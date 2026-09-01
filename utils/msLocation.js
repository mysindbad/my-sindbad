// utils/msLocation.js
// Real GPS / location module for My Sindbad. No fake coordinates. Privacy-first (no history storage).
// Exposes window.MSLocation: { has, permissionState, current, watch }
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
  function current(opts = {}) {
    return new Promise((resolve, reject) => {
      if (!has()) return reject(makeError('UNSUPPORTED', 'Geolocation API not available.'));
      const { enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = opts;
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          heading: p.coords.heading,
          speed: p.coords.speed,
          timestamp: p.timestamp
        }),
        (e) => {
          const type = e.code === 1 ? 'DENIED' : e.code === 2 ? 'UNAVAILABLE' : e.code === 3 ? 'TIMEOUT' : 'UNKNOWN';
          reject(makeError(type, e.message || ('geo_' + e.code), e));
        },
        { enableHighAccuracy, timeout, maximumAge }
      );
    });
  }

  // Continuous watch. onUpdate({position}) | onUpdate({error}). Returns stop().
  function watch(onUpdate, opts = {}) {
    if (!has()) { onUpdate({ error: makeError('UNSUPPORTED', 'Geolocation API not available.') }); return () => {}; }
    const { enableHighAccuracy = true, timeout = 12000, maximumAge = 0 } = opts;
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
        { enableHighAccuracy, timeout, maximumAge }
      );
    } catch (e) {
      onUpdate({ error: makeError('UNKNOWN', e.message, e) });
      return () => {};
    }
    return () => { if (stopped) return; stopped = true; try { navigator.geolocation.clearWatch(id); } catch (e) {} };
  }

  window.MSLocation = { has, permissionState, current, watch };
})();
