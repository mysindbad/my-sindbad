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
  async function geocodeActivity(title, destination) {
    const titleText = String(title || '').trim();
    const destinationText = String(destination || '').trim();
    if (!titleText || !destinationText) return null;
    const key = keyFor(titleText, destinationText);
    const cache = readCache();
    const cached = validCoords(cache[key]);
    if (cached) return { ...cached, source: 'cache' };
    return enqueue(async () => {
      const current = validCoords(readCache()[key]);
      if (current) return { ...current, source: 'cache' };
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(`${titleText} ${destinationText}`)}&accept-language=ar`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`nominatim_${response.status}`);
      const [first] = await response.json();
      const coords = validCoords({ lat: first?.lat, lon: first?.lon });
      if (!coords) return null;
      const next = readCache();
      next[key] = coords;
      writeCache(next);
      return { ...coords, source: 'nominatim' };
    });
  }
  window.MySindbadGeocode = { geocodeActivity, validCoords, cacheKey: keyFor };
})();
