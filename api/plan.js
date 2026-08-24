export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  res.status(200).json({ status: 'ready', message: 'AI planning endpoint — Phase 1B' });
}