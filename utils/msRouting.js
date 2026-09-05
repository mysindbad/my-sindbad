// utils/msRouting.js
// Mapbox Directions v5 wrapper. Real routes only; no fabrication. Reuses /api/map-token.
// Requests steps + banner_instructions + localized instructions.
// Exposes window.MSRouting: { getToken, getRoute }
(function () {
  'use strict';
  let tokenCache = null, tokenPromise = null;

  function getToken() {
    if (tokenCache) return Promise.resolve(tokenCache);
    if (tokenPromise) return tokenPromise;
    tokenPromise = fetch('/api/map-token').then(r => r.json()).then(d => {
      tokenCache = d.token || '';
      if (!tokenCache) console.warn('[MSRouting] MAPBOX_PUBLIC_TOKEN not configured.');
      return tokenCache;
    }).catch(e => { tokenPromise = null; throw { __msroute: true, type: 'TOKEN', message: 'map-token endpoint failed', original: e }; });
    return tokenPromise;
  }

  async function getRoute({ origin, destination, profile = 'walking', alternatives = false, language }) {
    if (!origin || !destination) throw { __msroute: true, type: 'ARGS', message: 'origin and destination required' };
    for (const p of [origin, destination]) {
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) throw { __msroute: true, type: 'ARGS', message: 'invalid coordinates' };
    }
    const token = await getToken();
    if (!token) throw { __msroute: true, type: 'NO_TOKEN', message: 'Mapbox token not configured' };
    const prof = profile === 'walking' ? 'walking' : profile === 'cycling' ? 'cycling' : 'driving';
    const coords = origin.lng + ',' + origin.lat + ';' + destination.lng + ',' + destination.lat;
    const lang = (language === 'en' || language === 'fr') ? language : 'ar';
    const url = 'https://api.mapbox.com/directions/v5/mapbox/' + prof + '/' + coords +
      '?alternatives=' + (alternatives ? 'true' : 'false') + '&geometries=geojson&overview=full&steps=true&banner_instructions=true&language=' + lang + '&access_token=' + encodeURIComponent(token);
    let resp;
    try { resp = await fetch(url, { headers: { Accept: 'application/json' } }); }
    catch (e) { throw { __msroute: true, type: 'NETWORK', message: e.message, original: e }; }
    if (!resp.ok) throw { __msroute: true, type: 'HTTP', status: resp.status, message: 'directions_' + resp.status };
    const data = await resp.json();
    const route = data.routes && data.routes[0];
    if (!route) throw { __msroute: true, type: 'NO_ROUTE', message: 'No route returned' };
    return {
      geometry: route.geometry,
      distance: route.distance, // meters
      duration: route.duration,  // seconds
      profile: prof,
      legs: route.legs || []
    };
  }

  window.MSRouting = { getToken, getRoute };
})();