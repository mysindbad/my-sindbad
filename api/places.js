import { fetchJson, handleOptions, sendUpstreamError, setCors } from '../lib/http.js';

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
    const places = (data.elements || []).map((item) => ({
      id: `${item.type}/${item.id}`,
      name: item.tags?.name || item.tags?.['name:en'] || '',
      category: item.tags?.amenity || item.tags?.tourism || kind,
      address: item.tags?.['addr:street'] || item.tags?.['addr:city'] || '',
      lat: item.lat ?? item.center?.lat,
      lon: item.lon ?? item.center?.lon,
      website: item.tags?.website || item.tags?.['contact:website'] || '',
      phone: item.tags?.phone || ''
    })).filter((item) => item.name && Number.isFinite(item.lat) && Number.isFinite(item.lon));
    return res.status(200).json(places);
  } catch (error) {
    return sendUpstreamError(res, error);
  }
}
