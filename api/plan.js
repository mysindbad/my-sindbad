import { CITY_COORDS, CITY_DISPLAY, CITY_PLACES, nearestCityKey, normalizeCity } from './places-data.js';
import { getWeatherContext, weatherContextText, getNearbyPlacesContext, placesContextText } from '../lib/tripContext.js';

const MAX_DAYS = 14;
const DAY_TIMES = ['09:00', '13:00', '17:00'];

function isoToday() {
  return new Date().toISOString().split('T')[0];
}

function validDate(value) {
  const text = String(value || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(text) && !Number.isNaN(new Date(`${text}T12:00:00`).getTime()) ? text : '';
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().split('T')[0];
}

function getDayCount(startDate, endDate) {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const days = Math.floor((end - start) / 86400000) + 1;
  return Math.min(MAX_DAYS, Math.max(1, Number.isFinite(days) ? days : 1));
}

function normaliseDates(input) {
  const startDate = validDate(input.startDate) || isoToday();
  const requestedDays = Number(input.days);
  const candidateEnd = validDate(input.endDate);
  const spanDays = candidateEnd && candidateEnd >= startDate ? getDayCount(startDate, candidateEnd) : 0;
  const dayCount = Math.min(MAX_DAYS, Math.max(1, Number.isFinite(requestedDays) && requestedDays > 0 ? Math.round(requestedDays) : spanDays || 1));
  const endDate = candidateEnd && candidateEnd >= startDate && !Number.isFinite(requestedDays) ? candidateEnd : addDays(startDate, dayCount - 1);
  return { startDate, endDate, dayCount };
}

function classifyPlace(place) {
  if (place.category === 'food') return 'food';
  if (place.category === 'hotel') return 'accommodation';
  if (place.category === 'garden' || place.category === 'nature') return 'activities';
  return 'activities';
}

function placeDescription(place, display) {
  if (place.category === 'food') return `تجربة أطباق محلية في ${place.title} بمدينة ${display}`;
  if (place.category === 'shopping') return `جولة تسوق حقيقية في ${place.title} بمدينة ${display}`;
  if (place.category === 'garden' || place.category === 'nature') return `زيارة واستكشاف ${place.title} في ${display}`;
  return `زيارة ${place.title} والتعرف على معالم ${display}`;
}

function orderedPlaces(places) {
  const priorities = ['attraction', 'museum', 'food', 'garden', 'nature', 'shopping', 'hotel'];
  const used = new Set();
  const result = [];
  priorities.forEach((category) => places.filter((place) => place.category === category).forEach((place) => {
    if (!used.has(place.title)) { used.add(place.title); result.push(place); }
  }));
  places.forEach((place) => { if (!used.has(place.title)) { used.add(place.title); result.push(place); } });
  return result;
}

function localPlan({ cityKey, startDate, dayCount, travelStyle, currency }) {
  const display = CITY_DISPLAY[cityKey];
  const places = orderedPlaces(CITY_PLACES[cityKey] || []);
  const days = Array.from({ length: dayCount }, (_, index) => {
    const activities = DAY_TIMES.map((time, offset) => {
      const place = places[(index * DAY_TIMES.length + offset) % places.length];
      return {
        time,
        title: place.title,
        desc: `${placeDescription(place, display)}${travelStyle ? ` · مناسب لنمط ${travelStyle}` : ''}`,
        coords: { lat: place.lat, lng: place.lng },
        cost: place.cost,
        category: classifyPlace(place),
        costEstimated: true,
        costLabel: 'تقديري بـ MAD',
        currency,
        duration: place.duration
      };
    });
    return { day: index + 1, date: addDays(startDate, index), activities };
  });
  return { destination: display, destinationDisplay: display, source: 'verified_local_places', days };
}

function isValidPlan(value, dayCount) {
  return Boolean(value && Array.isArray(value.days) && value.days.length === dayCount
    && value.days.every((day, index) => day && day.day === index + 1 && Array.isArray(day.activities) && day.activities.length >= 2));
}

function parseGeminiPlan(text) {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function geocode(query) {
  if (!query) return null;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ar,en&q=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MySindbad/24 (verified travel places)' }
    });
    if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
    const [first] = await response.json();
    const lat = Number(first?.lat);
    const lng = Number(first?.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0) ? { lat, lng } : null;
  } catch (error) {
    console.warn('Nominatim geocode failed:', query, error.message);
    return null;
  }
}

async function enrichPlan(plan, destination, currency) {
  const destinationCoords = await geocode(destination);
  const nearestKey = nearestCityKey(destinationCoords);
  const replacements = nearestKey ? orderedPlaces(CITY_PLACES[nearestKey] || []) : [];
  let replacementIndex = 0;
  const days = [];
  for (const day of plan.days) {
    const activities = [];
    for (const activity of day.activities || []) {
      const title = String(activity?.title || activity?.name || '').trim();
      const coords = await geocode(`${title}, ${destination}`);
      if (title && coords) {
        activities.push({
          ...activity,
          title,
          coords,
          cost: Number.isFinite(Number(activity.cost)) ? Number(activity.cost) : 0,
          currency,
          costEstimated: true,
          costLabel: 'تقديري',
          duration: activity.duration || '120 min'
        });
      } else if (replacements.length) {
        const place = replacements[replacementIndex++ % replacements.length];
        activities.push({
          time: activity.time || DAY_TIMES[activities.length % DAY_TIMES.length],
          title: place.title,
          desc: placeDescription(place, CITY_DISPLAY[nearestKey]),
          coords: { lat: place.lat, lng: place.lng },
          cost: place.cost,
          category: classifyPlace(place),
          costEstimated: true,
          costLabel: 'تقديري بـ MAD',
          currency,
          duration: place.duration
        });
      }
    }
    days.push({ ...day, activities });
  }
  return { destination, source: 'gemini_verified_geocodes', days };
}

async function safeFallbackPlan(input) {
  const location = await geocode(input.destination);
  const nearestKey = nearestCityKey(location);
  if (!nearestKey) {
    return { destination: input.destination, source: 'no_verified_places', days: Array.from({ length: input.dayCount }, (_, index) => ({ day: index + 1, date: addDays(input.startDate, index), activities: [] })) };
  }
  return localPlan({ ...input, cityKey: nearestKey });
}

async function geminiPlan(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('AI planner unavailable');
  let contextBlock = '';
  try {
    const coords = await geocode(input.destination);
    if (coords) {
      const [wctx, places] = await Promise.all([ getWeatherContext(coords.lat, coords.lon, input.startDate, input.endDate), getNearbyPlacesContext(coords.lat, coords.lon) ]);
      const parts = [];
      const wt = weatherContextText(wctx); if (wt) parts.push(wt);
      const pt = placesContextText(places); if (pt) parts.push(pt);
      if (parts.length) {
        const nl = String.fromCharCode(10);
        contextBlock = nl + nl + 'سياق إضافي للذكاء:' + nl + parts.join(nl + nl) + nl + 'استخدم هذا السياق لاختيار أنشطة مناسبة للطقس وأماكن حقيقية فقط.';
      }
    }
  } catch (e) { console.warn('trip context failed', e.message); }
  const prompt = `أنشئ برنامج سفر لمدة ${input.dayCount} أيام إلى ${input.destination}.
استخدم أماكن حقيقية مشهورة فقط بأسمائها الفعلية، ولا تستخدم أي أسماء عامة أو مخترعة مثل معالم المدينة أو سوق المدينة. كل نشاط يجب أن يكون مكاناً معروفاً يمكن البحث عنه في OpenStreetMap. اجعل في كل يوم نشاطين أو أكثر، وامزج بين فئات مختلفة، ورتب الأوقات زمنياً.
البيانات: من ${input.startDate} إلى ${input.endDate}، ${input.travelers} مسافر، الميزانية ${input.budget} ${input.currency}، النمط ${input.travelStyle}، التفضيلات: ${input.preferences || 'لا توجد'}.${contextBlock}
أعد JSON فقط دون Markdown بهذا الشكل: {"days":[{"day":1,"activities":[{"time":"10:00","title":"اسم المكان الحقيقي","desc":"وصف مختصر","cost":0,"duration":"120 min"}]}]}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } })
  });
  if (!response.ok) throw new Error('Gemini request failed');
  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
  const plan = parseGeminiPlan(text);
  if (!isValidPlan(plan, input.dayCount)) throw new Error('Invalid AI plan');
  return enrichPlan(plan, input.destination, input.currency);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const input = req.body || {};
  const destinationInput = String(input.destination || '').trim();
  const dates = normaliseDates(input);
  const normalized = normalizeCity(destinationInput);
  const planInput = {
    destination: normalized.display || destinationInput,
    cityKey: normalized.key,
    startDate: dates.startDate,
    endDate: dates.endDate,
    dayCount: dates.dayCount,
    travelers: Number(input.travelers) || 1,
    budget: Number(input.budget) || 0,
    currency: String(input.currency || 'MAD'),
    travelStyle: String(input.travelStyle || 'ثقافي'),
    preferences: Array.isArray(input.preferences) ? input.preferences.join('، ') : String(input.preferences || '')
  };

  if (planInput.cityKey && CITY_PLACES[planInput.cityKey]?.length) {
    return res.status(200).json(localPlan(planInput));
  }
  try {
    return res.status(200).json(await geminiPlan(planInput));
  } catch (error) {
    console.warn('Verified AI plan unavailable; using verified fallback:', error.message);
    return res.status(200).json(await safeFallbackPlan(planInput));
  }
}
