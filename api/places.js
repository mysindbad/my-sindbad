import { fetchJson, handleOptions, sendUpstreamError, setCors } from '../lib/http.js';
import { CITY_PLACES, nearestCityKey } from './places-data.js';
import { normalizeOSMPlace, normalizeLocalPlace } from '../lib/placeModel.js';

function localFallback(lat, lon, kind) {
  const cityKey = nearestCityKey({ lat, lon });
  const source = CITY_PLACES[cityKey] || [];
  return source
    .filter((item) => kind === 'food'
      ? item.category === 'food'
      : kind === 'hotels'
        ? item.category === 'hotel'
        : !['food', 'hotel'].includes(item.category))
    .map((item, index) => normalizeLocalPlace(item, cityKey, index));
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'الطريقة غير مدعومة.' });

  const latParam = String(req.query?.lat || '');
  const lonParam = String(req.query?.lon || '');
  const lat = Number(latParam);
  const lon = Number(lonParam);
  const kind = String(req.query?.kind || 'tourism');
  if (!latParam || !lonParam || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: 'إحداثيات الوجهة غير صالحة.' });
  }

  const filter = kind === 'food'
    ? '["amenity"~"restaurant|cafe|fast_food"]'
    : kind === 'hotels'
      ? '["tourism"~"hotel|hostel|guest_house"]'
      : '["tourism"~"attraction|museum|gallery|viewpoint|theme_park"]';
  const query = `[out:json][timeout:20];(nwr(around:6000,${lat},${lon})${filter};);out center tags 25;`;

  try {
    const data = await fetchJson(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {}, 25000);
    const places = (data.elements || [])
      .map((el) => normalizeOSMPlace(el, { fallbackCategory: kind }))
      .filter((p) => p.name && Number.isFinite(p.lat) && Number.isFinite(p.lon));
    return res.status(200).json(places);
  } catch (error) {
    const fallback = localFallback(lat, lon, kind);
    if (fallback.length) {
      console.warn('Overpass unavailable; using verified local places fallback.');
      return res.status(200).json(fallback);
    }
    return sendUpstreamError(res, error);
  }
}
