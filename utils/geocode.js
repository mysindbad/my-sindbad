(function initMySindbadGeocode() {
  const CACHE_KEY = 'mysindbad:geocode-cache:v1';
  const MIN_INTERVAL = 210;
  let nextAllowedAt = 0;
  let queue = Promise.resolve();
  function readCache() {
    try { const value = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
  }
  function writeCache(cache) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {} }
  function keyFor(title, destination) { return `${String(title || '').trim().toLowerCase()}|${String(destination || '').trim().toLowerCase()}`; }
  function validCoords(value) {
    const lat = Number(value?.lat), lng = Number(value?.lng ?? value?.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) ? { lat, lng } : null;
  }
  function distanceKm(a, b) { const first = validCoords(a), second = validCoords(b); if (!first || !second) return null; const rad = Math.PI / 180; const dLat = (second.lat - first.lat) * rad; const dLng = (second.lng - first.lng) * rad; const h = Math.sin(dLat / 2) ** 2 + Math.cos(first.lat * rad) * Math.cos(second.lat * rad) * Math.sin(dLng / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h))); }
  async function fetchWithTimeout(input, init = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(input, { ...init, signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }
  function enqueue(task) {
    const run = queue.then(async () => {
      const wait = Math.max(0, nextAllowedAt - Date.now());
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      nextAllowedAt = Date.now() + MIN_INTERVAL;
      return task();
    });
    queue = run.catch(() => {});
    return run;
  }
  async function geocodeActivity(title, destination, cityCoords = null) {
    const titleText = String(title || '').trim();
    const destinationText = String(destination || '').trim();
    if (!titleText || !destinationText) return null;
    const key = keyFor(titleText, destinationText);
    const isSafe = (coords) => { const candidate = validCoords(coords); if (!candidate) return null; const distance = distanceKm(cityCoords, candidate); return distance !== null && distance > 150 ? null : candidate; };
    const cache = readCache();
    const cached = isSafe(cache[key]);
    if (cached) return { ...cached, source: 'cache' };
    return enqueue(async () => {
      const current = isSafe(readCache()[key]);
      if (current) return { ...current, source: 'cache' };
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(`${titleText} ${destinationText}`)}&accept-language=ar`;
      const response = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`nominatim_${response.status}`);
      const [first] = await response.json();
      const coords = isSafe({ lat: first?.lat, lon: first?.lon });
      if (!coords) return null;
      const next = readCache();
      next[key] = coords;
      writeCache(next);
      return { ...coords, source: 'nominatim' };
    });
  }
  window.MySindbadGeocode = { geocodeActivity, validCoords, distanceKm, cacheKey: keyFor };
})();
