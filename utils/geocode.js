(function initMySindbadGeocode() {
  'use strict';
  // PHASE 12 — single geocoding source of truth.
  // Queue + rate-limit + in-flight dedup + cache + timeout + graceful failure.
  // Results normalized to: { coordinates:{lat,lng}, name?, address?, source }.
  // No personal data stored. Cache holds query→coords only.
  const CACHE_KEY = 'mysindbad:geocode-cache:v2';
  const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  const CACHE_MAX = 500;
  const MIN_INTERVAL = 220; // ms between Nominatim requests (rate-limit protection)
  const TIMEOUT_MS = 6000;

  let nextAllowedAt = 0;
  let queue = Promise.resolve();
  const pending = new Map(); // key -> Promise (in-flight dedup)
  let memCache = null;
  let lsChecked = false;
  let lsOk = false;

  function lsAvailable() {
    if (lsChecked) return lsOk;
    lsChecked = true;
    try { const k = '__ms_gctest__'; localStorage.setItem(k, '1'); localStorage.removeItem(k); lsOk = true; } catch (e) { lsOk = false; }
    return lsOk;
  }

  function readCache() {
    if (!lsAvailable()) { memCache = memCache || {}; return memCache; }
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !parsed.entries) return {};
      const now = Date.now();
      const live = {};
      for (const k of Object.keys(parsed.entries)) {
        const e = parsed.entries[k];
        if (e && typeof e === 'object' && now - (e.t || 0) < CACHE_TTL) live[k] = e;
      }
      return live;
    } catch (e) { return {}; }
  }

  function writeCache(cache) {
    const keys = Object.keys(cache);
    if (keys.length > CACHE_MAX) {
      keys.sort((a, b) => (cache[a].t || 0) - (cache[b].t || 0));
      for (let i = 0; i < keys.length - CACHE_MAX; i++) delete cache[keys[i]];
    }
    if (!lsAvailable()) { memCache = cache; return; }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ v: 2, entries: cache })); } catch (e) {}
  }

  function normalizeKey(query) {
    return String(query || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function keyFor(title, destination) {
    return normalizeKey(title) + '|' + normalizeKey(destination);
  }

  function validCoords(value) {
    if (!value) return null;
    let lat, lng;
    if (value.coordinates && (value.coordinates.lat != null || value.coordinates.lng != null)) {
      lat = Number(value.coordinates.lat); lng = Number(value.coordinates.lng);
    } else if (value.coords && (value.coords.lat != null || value.coords.lng != null)) {
      lat = Number(value.coords.lat); lng = Number(value.coords.lng);
    } else {
      lat = Number(value.lat);
      lng = Number(value.lng != null ? value.lng : value.lon);
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat === 0 && lng === 0) return null;
    return { lat, lng };
  }

  function distanceKm(a, b) {
    const first = validCoords(a), second = validCoords(b);
    if (!first || !second) return null;
    const rad = Math.PI / 180;
    const dLat = (second.lat - first.lat) * rad;
    const dLng = (second.lng - first.lng) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(first.lat * rad) * Math.cos(second.lat * rad) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  }

  async function fetchWithTimeout(input, init, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs || TIMEOUT_MS);
    try { return await fetch(input, { ...(init || {}), signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }

  function enqueue(task) {
    const run = queue.then(async () => {
      const wait = Math.max(0, nextAllowedAt - Date.now());
      if (wait) await new Promise(r => setTimeout(r, wait));
      nextAllowedAt = Date.now() + MIN_INTERVAL;
      return task();
    });
    queue = run.catch(() => {});
    return run;
  }

  // Normalize a Nominatim row into the canonical geocode shape.
  function normalizeResult(row, source) {
    const coords = validCoords({ lat: row && row.lat, lon: row && row.lon });
    if (!coords) return null;
    const dn = String((row && (row.name || row.display_name)) || '');
    const name = (dn.split(',')[0] || '').trim();
    const address = String((row && (row.display_name || row.name)) || '').trim();
    return {
      coordinates: { lat: coords.lat, lng: coords.lng },
      lat: coords.lat, lng: coords.lng, lon: coords.lng,
      name: name,
      address: address,
      type: String((row && row.type) || ''),
      source: source || 'nominatim'
    };
  }

  // General forward geocode (city/place search). Returns canonical result or null.
  async function geocode(query, opts) {
    opts = opts || {};
    const q = String(query || '').trim();
    if (!q) return null;
    const k = normalizeKey(q);
    const cache = readCache();
    const cached = cache[k];
    if (cached && cached.r) return Object.assign({}, cached.r, { source: 'cache' });
    if (pending.has(k)) return pending.get(k);
    const p = enqueue(async () => {
      try {
        const cur = readCache();
        if (cur[k] && cur[k].r) return Object.assign({}, cur[k].r, { source: 'cache' });
        const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=' + encodeURIComponent(opts.lang || 'ar') + '&q=' + encodeURIComponent(q);
        const response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, opts.timeout || TIMEOUT_MS);
        if (!response.ok) throw new Error('nominatim_' + response.status);
        const rows = await response.json();
        const row = Array.isArray(rows) ? rows[0] : null;
        const result = normalizeResult(row, 'nominatim');
        if (!result) return null;
        const next = readCache();
        next[k] = { r: result, t: Date.now() };
        writeCache(next);
        return result;
      } catch (e) {
        return null; // graceful failure — never crash caller
      } finally {
        pending.delete(k);
      }
    });
    pending.set(k, p);
    return p;
  }

  // Activity geocode (title + destination, with city-center safety check).
  async function geocodeActivity(title, destination, cityCoords) {
    const titleText = String(title || '').trim();
    const destinationText = String(destination || '').trim();
    if (!titleText || !destinationText) return null;
    const k = keyFor(titleText, destinationText);
    const isSafe = (coords) => {
      const candidate = validCoords(coords);
      if (!candidate) return null;
      if (cityCoords) {
        const d = distanceKm(cityCoords, candidate);
        if (d !== null && d > 150) return null;
      }
      return candidate;
    };
    const cache = readCache();
    const cached = cache[k];
    if (cached && cached.r) {
      const safe = isSafe(cached.r);
      if (safe) return Object.assign({}, cached.r, { coordinates: { lat: safe.lat, lng: safe.lng }, lat: safe.lat, lng: safe.lng, lon: safe.lng, source: 'cache' });
    }
    if (pending.has(k)) return pending.get(k);
    const p = enqueue(async () => {
      try {
        const cur = readCache();
        if (cur[k] && cur[k].r) {
          const safe = isSafe(cur[k].r);
          if (safe) return Object.assign({}, cur[k].r, { coordinates: { lat: safe.lat, lng: safe.lng }, lat: safe.lat, lng: safe.lng, lon: safe.lng, source: 'cache' });
        }
        const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(titleText + ' ' + destinationText) + '&accept-language=ar';
        const response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, TIMEOUT_MS);
        if (!response.ok) throw new Error('nominatim_' + response.status);
        const rows = await response.json();
        const row = Array.isArray(rows) ? rows[0] : null;
        const result = normalizeResult(row, 'nominatim');
        if (!result) return null;
        const safe = isSafe(result);
        if (!safe) return null;
        const next = readCache();
        next[k] = { r: result, t: Date.now() };
        writeCache(next);
        return result;
      } catch (e) {
        return null;
      } finally {
        pending.delete(k);
      }
    });
    pending.set(k, p);
    return p;
  }

  window.MySindbadGeocode = {
    geocode: geocode,
    geocodeActivity: geocodeActivity,
    validCoords: validCoords,
    distanceKm: distanceKm,
    cacheKey: keyFor,
    normalizeKey: normalizeKey,
    _normalizeResult: normalizeResult,
    _readCache: readCache,
    _writeCache: writeCache,
    _pending: pending,
    _constants: { CACHE_KEY: CACHE_KEY, MIN_INTERVAL: MIN_INTERVAL, TIMEOUT_MS: TIMEOUT_MS, CACHE_TTL: CACHE_TTL }
  };
})();