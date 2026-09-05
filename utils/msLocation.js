// utils/msLocation.js
// Real GPS / location module for My Sindbad. No fake coordinates. Privacy-first (no history storage).
// Exposes window.MSLocation: { has, permissionState, current, watch, stop }
// Typed errors: DENIED | UNAVAILABLE | TIMEOUT | UNSUPPORTED | UNKNOWN.
// Default enableHighAccuracy=false (battery-friendly). Navigation passes true.
(function () {
  'use strict';
  const has = () => typeof navigator !== 'undefined' && !!navigator.geolocation;
  const makeError = (type, message, original) => ({ __msloc: true, type, message, original });

  async function permissionState() {
    if (!has()) return 'unsupported';
    try {
      if (navigator.permissions) {
        const p = await navigator.permissions.query({ name: 'geolocation' });
        return p.state; // granted | denied | prompt
      }
    } catch (e) {}
    return 'prompt';
  }

  // One-shot fix. Rejects with a typed error; never returns fabricated coords.
  function current(opts) {
    opts = opts || {};
    return new Promise((resolve, reject) => {
      if (!has()) return reject(makeError('UNSUPPORTED', 'Geolocation API not available.'));
      const enableHighAccuracy = opts.enableHighAccuracy !== undefined ? opts.enableHighAccuracy : false;
      const timeout = opts.timeout !== undefined ? opts.timeout : 10000;
      const maximumAge = opts.maximumAge !== undefined ? opts.maximumAge : 0;
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({
          lat: p.coords.latitude, lng: p.coords.longitude,
          accuracy: p.coords.accuracy, heading: p.coords.heading,
          speed: p.coords.speed, timestamp: p.timestamp
        }),
        (e) => {
          const type = e.code === 1 ? 'DENIED' : e.code === 2 ? 'UNAVAILABLE' : e.code === 3 ? 'TIMEOUT' : 'UNKNOWN';
          reject(makeError(type, e.message || ('geo_' + e.code), e));
        },
        { enableHighAccuracy: enableHighAccuracy, timeout: timeout, maximumAge: maximumAge }
      );
    });
  }

  // Singleton watch tracking — prevents duplicate watchers.
  let activeStop = null;

  // Continuous watch. onUpdate({position}) | onUpdate({error}). Returns stop().
  // Calling watch() while a watch is active stops the previous one first.
  function watch(onUpdate, opts) {
    opts = opts || {};
    if (!has()) { onUpdate({ error: makeError('UNSUPPORTED', 'Geolocation API not available.') }); return () => {}; }
    // prevent duplicate watchers
    if (activeStop) { try { activeStop(); } catch (e) {} activeStop = null; }
    const enableHighAccuracy = opts.enableHighAccuracy !== undefined ? opts.enableHighAccuracy : false;
    const timeout = opts.timeout !== undefined ? opts.timeout : 12000;
    const maximumAge = opts.maximumAge !== undefined ? opts.maximumAge : 0;
    let stopped = false, id;
    try {
      id = navigator.geolocation.watchPosition(
        (p) => onUpdate({
          position: {
            lat: p.coords.latitude, lng: p.coords.longitude,
            accuracy: p.coords.accuracy, heading: p.coords.heading,
            speed: p.coords.speed, timestamp: p.timestamp
          }
        }),
        (e) => {
          const type = e.code === 1 ? 'DENIED' : e.code === 2 ? 'UNAVAILABLE' : e.code === 3 ? 'TIMEOUT' : 'UNKNOWN';
          onUpdate({ error: makeError(type, e.message || ('geo_' + e.code), e) });
        },
        { enableHighAccuracy: enableHighAccuracy, timeout: timeout, maximumAge: maximumAge }
      );
    } catch (e) {
      onUpdate({ error: makeError('UNKNOWN', e.message, e) });
      return () => {};
    }
    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (activeStop === stop) activeStop = null;
      try { navigator.geolocation.clearWatch(id); } catch (e) {}
    };
    activeStop = stop;
    return stop;
  }

  // Stop any active watch (convenience for page cleanup).
  function stop() {
    if (activeStop) { try { activeStop(); } catch (e) {} activeStop = null; }
  }

  // Auto-cleanup on page unload to prevent orphan watchers.
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', stop, { once: true });
  }

  window.MSLocation = { has: has, permissionState: permissionState, current: current, watch: watch, stop: stop };
})();