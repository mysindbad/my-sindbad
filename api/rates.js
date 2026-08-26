import { fetchJson, handleOptions, sendUpstreamError, setCors } from '../lib/http.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(res);
  if (req.method !== 'GET') return res.status(405).json({ error: 'الطريقة غير مدعومة.' });

  const base = String(req.query?.base || 'MAD').toUpperCase();
  if (!/^[A-Z]{3}$/.test(base)) return res.status(400).json({ error: 'عملة الأساس غير صالحة.' });

  try {
    const data = await fetchJson(`https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`);
    if (data.result !== 'success' || !data.rates) throw new Error('rates_unavailable');
    return res.status(200).json(data);
  } catch (error) {
    return sendUpstreamError(res, error);
  }
}
