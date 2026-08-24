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

function activityTitle(activity) {
  return activity?.title || activity?.name || activity?.place || 'نشاط';
}

function activityCost(activity) {
  const cost = Number(activity?.cost ?? activity?.price ?? activity?.estimated_cost);
  return Number.isFinite(cost) ? cost : 0;
}

function categoryFor(activity) {
  const value = String(activity?.category || activity?.type || activityTitle(activity)).toLowerCase();
  if (/accommodation|hotel|فندق|رياض|إقامة/.test(value)) return 'accommodation';
  if (/food|restaurant|cafe|lunch|dinner|مطعم|مقهى|غداء|عشاء|فطور|أكل/.test(value)) return 'food';
  if (/transport|نقل|تاكسي|سيارة|مشي|حافلة|قطار/.test(value)) return 'transport';
  return 'activities';
}

function numberFromText(value, fallback) {
  const match = String(value || '').match(/\d+/);
  return match ? Math.max(1, Number(match[0])) : fallback;
}

function flattenActivities(trip) {
  if (Array.isArray(trip?.activities)) return trip.activities;
  if (Array.isArray(trip?.days)) return trip.days.flatMap((day, dayIndex) => (day.activities || []).map((activity, index) => ({ ...activity, day: day.day || dayIndex + 1, activityIndex: index })));
  return [];
}

function findActivity(trip, day, activityIndex) {
  const days = Array.isArray(trip?.days) ? trip.days : [];
  const dayActivities = days.find((item) => Number(item.day) === Number(day))?.activities || [];
  if (dayActivities[activityIndex]) return dayActivities[activityIndex];
  return flattenActivities(trip)[activityIndex] || null;
}

async function geocodeDestination(destination) {
  if (!destination) return null;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ar,en&q=${encodeURIComponent(destination)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MySindbad/22 (travel assistant)' }
    });
    if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
    const [place] = await response.json();
    const lat = Number(place?.lat);
    const lng = Number(place?.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch (error) {
    console.warn('Assistant destination geocode failed:', error.message);
    return null;
  }
}

function overpassFilter(category) {
  if (category === 'food') return 'nwr["amenity"~"restaurant|cafe|fast_food"]';
  if (category === 'accommodation') return 'nwr["tourism"~"hotel|hostel|guest_house"]';
  if (category === 'transport') return 'nwr["amenity"~"taxi|bus_station|car_rental"]';
  return 'nwr["tourism"~"attraction|museum|gallery|viewpoint|theme_park|park"]';
}

async function searchOverpassAlternatives(destination, category, currentCost) {
  const location = await geocodeDestination(destination);
  if (!location) return [];
  const query = `[out:json][timeout:15];${overpassFilter(category)}(around:6000,${location.lat},${location.lng});out center tags 30;`;
  try {
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MySindbad/22 (travel assistant)' }
    });
    if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);
    const payload = await response.json();
    const suggestedCost = CATEGORY_COSTS[category] || CATEGORY_COSTS.activities;
    return (payload.elements || [])
      .map((item) => {
        const tags = item.tags || {};
        const lat = Number(item.lat ?? item.center?.lat);
        const lng = Number(item.lon ?? item.center?.lon);
        return {
          title: tags.name || tags['name:en'] || '',
          cost: suggestedCost,
          coords: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
          reason: `أرخص بـ ${Math.max(0, currentCost - suggestedCost)} MAD`,
          category
        };
      })
      .filter((option) => option.title && option.cost < currentCost && option.coords)
      .slice(0, 5);
  } catch (error) {
    console.warn('Assistant Overpass search failed:', error.message);
    return [];
  }
}

function localAlternatives(trip, current, currentCost, category) {
  const activities = flattenActivities(trip);
  return activities
    .filter((activity) => activity !== current && activityCost(activity) < currentCost)
    .map((activity) => ({
      title: activityTitle(activity),
      cost: activityCost(activity),
      coords: activity.coords || null,
      reason: `أرخص بـ ${Math.max(0, currentCost - activityCost(activity))} MAD`,
      category: activity.category || categoryFor(activity)
    }))
    .filter((option) => option.title && option.cost < currentCost)
    .slice(0, 5);
}

async function buildReplacementOptions(trip, day, activityIndex, aiOptions = []) {
  const current = findActivity(trip, day, activityIndex);
  const currentCost = activityCost(current);
  const category = categoryFor(current);
  const searched = await searchOverpassAlternatives(trip?.destination, category, currentCost);
  const existing = localAlternatives(trip, current, currentCost, category);
  const aiFiltered = (Array.isArray(aiOptions) ? aiOptions : [])
    .map((option) => ({ ...option, cost: Number(option.cost), category: option.category || category }))
    .filter((option) => option.title && Number.isFinite(option.cost) && option.cost < currentCost);
  const merged = [...searched, ...existing, ...aiFiltered];
  const seen = new Set();
  return merged.filter((option) => {
    const key = option.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function fallbackResponse(message, trip) {
  const replaceRequested = /بدل|استبدل|أرخص|غيّر|replace|cheaper/i.test(message);
  if (!replaceRequested) return { type: 'TEXT', message: 'نقدر نعاونك فالتخطيط. جرّب تطلب تبديل نشاط بشي أرخص أو ترتيب يومك.' };
  const day = numberFromText(message, 1);
  const activityIndex = Math.max(0, numberFromText(message.match(/النشاط\s*(\d+)|activity\s*(\d+)/i)?.[0], 2) - 1);
  const current = findActivity(trip, day, activityIndex) || flattenActivities(trip)[activityIndex];
  const currentCost = activityCost(current);
  const alternatives = localAlternatives(trip, current, currentCost, categoryFor(current));
  return { type: 'REPLACE_ACTIVITY', day, activityIndex, options: alternatives };
}

async function askGemini(message, trip) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const prompt = `أنت مساعد سفر. المستخدم قال: '${message}'. الرحلة الحالية: ${JSON.stringify(trip)}. إذا طلب تغيير، أرجع JSON فقط بصيغة: {"type":"REPLACE_ACTIVITY","day":1,"activityIndex":1,"options":[{"title":"...","cost":...,"coords":{"lat":...,"lng":...},"reason":"أرخص بـ 50 MAD"}]}. إذا كان سؤالاً عادياً، أرجع {"type":"TEXT","message":"..."}. لا تخترع أماكن؛ استخدم فقط أنشطة من الرحلة أو بدائل واقعية في نفس المدينة.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, responseMimeType: 'application/json' } })
  });
  if (!response.ok) throw new Error('Gemini assistant request failed');
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  return parseJson(text);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' });

  const body = req.body || {};
  const message = String(body.message || '').trim();
  const trip = body.trip && typeof body.trip === 'object' ? body.trip : {};
  if (!message) return jsonResponse(res, 400, { type: 'TEXT', message: 'اكتب طلبك وسنعاونك في الرحلة.' });

  try {
    const aiResponse = await askGemini(message, trip);
    const response = aiResponse && typeof aiResponse === 'object' ? aiResponse : fallbackResponse(message, trip);
    if (response.type === 'REPLACE_ACTIVITY') {
      const day = Number(response.day) || 1;
      const activityIndex = Math.max(0, Number(response.activityIndex) || 0);
      const options = await buildReplacementOptions(trip, day, activityIndex, response.options);
      return jsonResponse(res, 200, { type: 'REPLACE_ACTIVITY', day, activityIndex, options });
    }
    if (response.type === 'TEXT' && typeof response.message === 'string') return jsonResponse(res, 200, response);
    return jsonResponse(res, 200, fallbackResponse(message, trip));
  } catch (error) {
    console.warn('Assistant request failed:', error.message);
    const fallback = fallbackResponse(message, trip);
    if (fallback.type === 'REPLACE_ACTIVITY') {
      fallback.options = await buildReplacementOptions(trip, fallback.day, fallback.activityIndex, fallback.options);
    }
    return jsonResponse(res, 200, fallback);
  }
}
