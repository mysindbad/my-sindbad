const CATEGORY_COSTS = {
  accommodation: 800,
  food: 150,
  activities: 50,
  transport: 100
};

function jsonResponse(res, status, body) {
  return res.status(status).json(body);
}

function parseJson(text) {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function geocodeDestination(destination) {
  if (!destination) return null;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ar,en&q=${encodeURIComponent(destination)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MySindbad/33 (alternatives)' }
    });
    if (!response.ok) return null;
    const [place] = await response.json();
    const lat = Number(place?.lat);
    const lng = Number(place?.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}

async function fetchOverpass(destination, category, maxCost) {
  const location = await geocodeDestination(destination);
  if (!location) return [];
  const query = `[out:json][timeout:15];nwr["tourism"~"attraction|museum|park|viewpoint"](around:6000,${location.lat},${location.lng});out center tags 20;`;
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MySindbad/33 (alternatives)' }
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.elements || []).map((item) => {
      const tags = item.tags || {};
      const lat = Number(item.lat ?? item.center?.lat);
      const lng = Number(item.lon ?? item.center?.lon);
      return {
        title: tags.name || tags['name:en'] || '',
        cost: Math.min(maxCost, CATEGORY_COSTS[category] || 50),
        coords: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
        reason: 'بديل رائع في نفس المدينة',
        category: category || 'activities'
      };
    }).filter((item) => item.title && item.coords && item.cost <= maxCost);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });

  const body = req.body || {};
  const activity = body.activity || {};
  const trip = body.trip || {};
  const currentCost = Number(activity.cost || activity.price || 50);
  const maxCost = currentCost * 1.5;
  const category = activity.category || 'activities';

  const searched = await fetchOverpass(trip.destination || 'مراكش', category, maxCost);
  
  let resultOptions = searched.slice(0, 6);

  if (resultOptions.length < 6) {
    const fallbackList = [
      { title: 'ساحة الهطيم', cost: Math.min(maxCost, 20), reason: 'أرخص وأقرب', category },
      { title: 'متحف دار الجامعي', cost: Math.min(maxCost, 30), reason: 'تجربة ثقافية شائعة', category },
      { title: 'حديقة الحبول', cost: Math.min(maxCost, 10), reason: 'مكان عائلي ومفتوح', category },
      { title: 'باب المنصور', cost: 0, reason: 'معلم تاريخي مجاني', category },
      { title: 'السوق القديم', cost: Math.min(maxCost, 40), reason: 'تسوق محلي مميز', category },
      { title: 'برج Bel Air', cost: Math.min(maxCost, 25), reason: 'إطلالة بانورامية', category }
    ];
    for (const item of fallbackList) {
      if (resultOptions.length >= 6) break;
      if (!resultOptions.some(o => o.title === item.title)) {
        resultOptions.push(item);
      }
    }
  }

  return jsonResponse(res, 200, { alternatives: resultOptions });
}
