import { fetchJson, handleOptions, sendUpstreamError, setCors } from '../lib/http.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'الطريقة غير مدعومة.' });

  const query = String(req.query?.q || '').trim();
  if (query.length < 2) return res.status(400).json({ error: 'اكتب اسم مدينة أو دولة للبحث.' });

  try {
    const data = await fetchJson(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=ar,en&q=${encodeURIComponent(query)}`
    );
    return res.status(200).json(data.map((item) => ({
      id: item.place_id,
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: Number(item.lat),
      lon: Number(item.lon),
      country: item.address?.country || '',
      type: item.type
    })));
  } catch (error) {
    return sendUpstreamError(res, error);
  }
}
