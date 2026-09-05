// utils/msNavigation.js
// In-app Navigation Session engine: live GPS tracking, off-route recalculation, ETA, turn-by-turn steps.
// Depends on window.MSLocation and window.MSRouting. Real data only; no fake positions.
// Exposes window.MSNavigation: { start, stop, setProfile, on, snapshot }
(function () {
  'use strict';
  const R = 6371000; // earth radius (m)
  const rad = (d) => d * Math.PI / 180;
  function haversine(a, b) {
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function nearestOnSeg(p, a, b) {
    const dx = b.lng - a.lng, dy = b.lat - a.lat;
    const len2 = dx * dx + dy * dy;
    let t = len2 > 0 ? ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const proj = { lng: a.lng + t * dx, lat: a.lat + t * dy };
    return { point: proj, dist: haversine(p, proj) };
  }
  // project p on route coords [[lng,lat],...]; returns remaining distance along route + distance traveled (at).
  function projectOnRoute(p, coords) {
    const cum = [0];
    for (let i = 1; i < coords.length; i++) {
      cum[i] = cum[i - 1] + haversine({ lng: coords[i - 1][0], lat: coords[i - 1][1] }, { lng: coords[i][0], lat: coords[i][1] });
    }
    let best = { dist: Infinity, index: 0, at: 0, remaining: 0 };
    for (let i = 0; i < coords.length - 1; i++) {
      const a = { lng: coords[i][0], lat: coords[i][1] }, b = { lng: coords[i + 1][0], lat: coords[i + 1][1] };
      const r = nearestOnSeg(p, a, b);
      const at = cum[i] + haversine(a, r.point);
      if (r.dist < best.dist) best = { dist: r.dist, index: i, at, remaining: cum[cum.length - 1] - at };
    }
    best.routeLength = cum[cum.length - 1] || 0;
    return best;
  }

  // Normalize a Mapbox step into a clean maneuver model.
  function normalizeManeuver(step) {
    if (!step) return null;
    const m = step.maneuver || {};
    const banner = (step.bannerInstructions && step.bannerInstructions[0]) || null;
    const instruction = String(m.instruction || (banner ? (banner.primary + (banner.secondary ? ' ' + banner.secondary : '')) : '') || '');
    const streetName = String(step.name || (banner ? banner.secondary : '') || '');
    return {
      type: String(m.type || ''),
      modifier: String(m.modifier || ''),
      instruction: instruction,
      streetName: streetName,
      distance: Number(step.distance) || 0,
      duration: Number(step.duration) || 0,
      location: Array.isArray(m.location) ? { lng: m.location[0], lat: m.location[1] } : null,
      banner: banner
    };
  }

  // Flatten route legs into a flat step list with cumulative distances along the route.
  function buildSteps(route) {
    const steps = [];
    let cum = 0;
    (route.legs || []).forEach((leg) => {
      (leg.steps || []).forEach((step) => {
        const stepLen = Number(step.distance) || 0;
        steps.push({
          raw: step,
          maneuver: normalizeManeuver(step),
          distance: stepLen,
          duration: Number(step.duration) || 0,
          cumStart: cum,
          cumEnd: cum + stepLen
        });
        cum += stepLen;
      });
    });
    return steps;
  }

  // Determine the current step index from distance traveled along the route.
  // Forward-only advancement with hysteresis to handle GPS noise + short consecutive steps.
  function computeCurrentStep(session, at) {
    const steps = session.steps;
    if (!steps.length) return -1;
    if (at <= 0) return 0;
    let idx = session.currentStepIndex >= 0 ? session.currentStepIndex : 0;
    const HYSTERESIS = 3; // meters — don't advance until 3m past the maneuver point
    while (idx < steps.length - 1 && at >= steps[idx].cumEnd + HYSTERESIS) {
      idx++;
    }
    return idx;
  }

  const OFFROUTE = { walking: 18, driving: 45, cycling: 25 }; // meters
  const ARRIVAL = 18; // meters
  let session = null;

  function createSession() {
    return { state: 'idle', destination: null, profile: 'walking', route: null, routeCoords: null,
      routeDistance: 0, routeDuration: 0, steps: [], currentStepIndex: -1, language: 'ar',
      origin: null, lastPos: null, stopWatch: null,
      offRouteCount: 0, listeners: [], rerouting: false, _lastOff: 0, _map: null, _mb: null,
      _userMarker: null, _destMarker: null };
  }
  function on(listener) { if (session) session.listeners.push(listener); return () => { if (session) session.listeners = session.listeners.filter(l => l !== listener); }; }
  function emit(patch) { if (!session) return; Object.assign(session, patch); const snap = snapshot(); session.listeners.forEach(l => { try { l(snap); } catch (e) {} }); }
  function snapshot() {
    if (!session) return null;
    const s = session;
    let distRem = s.routeDistance, durRem = s.routeDuration, at = 0;
    if (s.route && s.lastPos && s.routeCoords) {
      const pr = projectOnRoute(s.lastPos, s.routeCoords);
      distRem = pr.remaining; durRem = s.routeDistance > 0 ? (pr.remaining / s.routeDistance) * s.routeDuration : s.routeDuration;
      s._lastOff = pr.dist; at = pr.at;
    }
    // Turn-by-turn: find current step + next maneuver + distance to it.
    let stepIndex = -1, maneuver = null, nextManeuver = null, distanceToManeuver = null, distanceToNextManeuver = null;
    if (s.steps.length && s.route) {
      stepIndex = computeCurrentStep(s, at);
      s.currentStepIndex = stepIndex;
      const currentStep = stepIndex >= 0 ? s.steps[stepIndex] : null;
      const nextStep = (stepIndex >= 0 && stepIndex + 1 < s.steps.length) ? s.steps[stepIndex + 1] : null;
      if (currentStep) {
        maneuver = currentStep.maneuver;
        distanceToManeuver = Math.max(0, Math.round(currentStep.cumEnd - at));
      }
      if (nextStep) {
        nextManeuver = nextStep.maneuver;
        distanceToNextManeuver = Math.max(0, Math.round(nextStep.cumEnd - at));
      }
    }
    return { state: s.state, profile: s.profile, destination: s.destination,
      offRouteDistance: Math.round(s._lastOff || 0), distanceRemaining: Math.max(0, Math.round(distRem)),
      durationRemaining: Math.max(0, Math.round(durRem)),
      eta: durRem > 0 ? Date.now() + durRem * 1000 : null,
      rerouting: !!s.rerouting, accuracy: s.lastPos?.accuracy ?? null, speed: s.lastPos?.speed ?? null,
      currentStepIndex: stepIndex, totalSteps: s.steps.length,
      maneuver: maneuver, nextManeuver: nextManeuver,
      distanceToManeuver: distanceToManeuver, distanceToNextManeuver: distanceToNextManeuver };
  }

  function drawRouteLine() {
    const map = session._map, mb = session._mb; if (!map || !mb || !session.route) return;
    try {
      if (map.getSource('ms-nav-route')) { if (map.getLayer('ms-nav-route-line')) map.removeLayer('ms-nav-route-line'); map.removeSource('ms-nav-route'); }
      map.addSource('ms-nav-route', { type: 'geojson', data: { type: 'Feature', geometry: session.route.geometry } });
      map.addLayer({ id: 'ms-nav-route-line', type: 'line', source: 'ms-nav-route', paint: { 'line-color': '#D4AF37', 'line-width': 6, 'line-opacity': 0.92 } });
    } catch (e) {}
  }
  function updateUserMarker(pos) {
    const map = session._map, mb = session._mb; if (!map || !mb) return;
    try {
      if (!session._userMarker) session._userMarker = new mb.Marker({ color: '#2674ff' }).setLngLat([pos.lng, pos.lat]).addTo(map);
      else session._userMarker.setLngLat([pos.lng, pos.lat]);
      if (session.state === 'navigating') map.easeTo({ center: [pos.lng, pos.lat], zoom: Math.max(map.getZoom(), 15) });
    } catch (e) {}
  }
  async function computeRoute(origin) {
    if (!session) return;
    try { session.rerouting = true; session.currentStepIndex = -1; emit({ rerouting: true, currentStepIndex: -1 });
      const r = await window.MSRouting.getRoute({ origin, destination: session.destination, profile: session.profile, language: session.language });
      session.route = r; session.routeCoords = r.geometry.coordinates; session.routeDistance = r.distance; session.routeDuration = r.duration;
      session.steps = buildSteps(r); session.currentStepIndex = -1;
      drawRouteLine();
      emit({ state: 'navigating', rerouting: false });
    } catch (e) { session.rerouting = false; emit({ state: session.route ? 'navigating' : 'error', rerouting: false, routeError: e }); }
  }
  function beginWatch() {
    session.stopWatch = window.MSLocation.watch((upd) => {
      if (upd.error) { emit({ state: upd.error.type === 'DENIED' ? 'denied' : 'waiting_gps', error: upd.error }); return; }
      const pos = upd.position; session.lastPos = pos; updateUserMarker(pos);
      if (!session.routeCoords) { if (!session.origin) { session.origin = pos; computeRoute(pos); } return; }
      const pr = projectOnRoute(pos, session.routeCoords);
      const thresh = OFFROUTE[session.profile] || 45;
      if (pr.dist > thresh) { session.offRouteCount++; if (session.offRouteCount >= 3 && !session.rerouting) { session.offRouteCount = 0; computeRoute(pos); } }
      else session.offRouteCount = 0;
      if (haversine(pos, session.destination) < ARRIVAL) { emit({ state: 'arrived' }); stop(); return; }
      emit({ state: 'navigating' });
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }

  async function start({ map, destination, profile = 'walking', mapboxgl, language }) {
    if (!destination || !Number.isFinite(destination.lat) || !Number.isFinite(destination.lng))
      throw { __msnav: true, type: 'ARGS', message: 'valid destination required' };
    if (session) stop();
    session = createSession();
    session.destination = destination; session.profile = profile; session._map = map; session._mb = mapboxgl;
    session.language = language || (window.MySindbadI18n && window.MySindbadI18n.getLang && window.MySindbadI18n.getLang()) || 'ar';
    emit({ state: 'preparing' });
    try { if (map && mapboxgl) session._destMarker = new mapboxgl.Marker({ color: '#D4AF37' }).setLngLat([destination.lng, destination.lat]).addTo(map); } catch (e) {}
    let origin = null;
    try { origin = await window.MSLocation.current({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }); }
    catch (e) { emit({ state: 'waiting_gps', error: e }); }
    if (origin) { session.origin = origin; session.lastPos = origin; await computeRoute(origin); }
    beginWatch();
    emit({ state: origin ? 'navigating' : 'waiting_gps' });
    return snapshot();
  }
  function setProfile(profile) { if (!session) return; session.profile = profile; if (session.lastPos) computeRoute(session.lastPos); }
  function stop() {
    if (!session) return;
    if (session.stopWatch) try { session.stopWatch(); } catch (e) {}
    session.stopWatch = null;
    const map = session._map;
    try { if (map && map.getSource && map.getSource('ms-nav-route')) { if (map.getLayer('ms-nav-route-line')) map.removeLayer('ms-nav-route-line'); map.removeSource('ms-nav-route'); } session._userMarker && session._userMarker.remove && session._userMarker.remove(); session._destMarker && session._destMarker.remove && session._destMarker.remove(); } catch (e) {}
    session.listeners = []; session.state = 'idle';
  }

  window.MSNavigation = { start, stop, setProfile, on, snapshot,
    _haversine: haversine, _buildSteps: buildSteps, _computeCurrentStep: computeCurrentStep, _normalizeManeuver: normalizeManeuver };
})();