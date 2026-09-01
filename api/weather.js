import { fetchJson, handleOptions, sendUpstreamError, setCors } from '../lib/http.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'الطريقة غير مدعومة.' });

  const latParam = String(req.query?.lat || '');
  const lonParam = String(req.query?.lon || '');
  const lat = Number(latParam);
  const lon = Number(lonParam);
  if (!latParam || !lonParam || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({ error: 'إحداثيات الطقس غير صالحة.' });
  }

  const startParam = String(req.query?.start || '');
  const endParam = String(req.query?.end || '');
  const daily = (/^\d{4}-\d{2}-\d{2}$/.test(startParam) && /^\d{4}-\d{2}-\d{2}$/.test(endParam)) ? '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' : '';
  try {
    const data = await fetchJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto${daily}`
    );
    return res.status(200).json(data);
  } catch (error) {
    return sendUpstreamError(res, error);
  }
}
