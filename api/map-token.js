export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  const token = process.env.MAPBOX_PUBLIC_TOKEN || '';
  res.status(200).json({ token });
}