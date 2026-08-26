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

function isWeatherMessage(message) {
  return /طقس|جو|مطر|شتا|شتاء|برد|سخون|حرارة|رطوبة|rain|weather/i.test(message);
}

function isGreetingMessage(message) {
  return /السلام عليكم|سلام|لاباس|كيف حالك|كيف داير|الحمد لله|hello|hi|how are you/i.test(String(message || ''));
}

function greetingResponse(message, trip) {
  const destination = tripDestination(trip);
  if (/لاباس|كيف حالك|كيف داير|how are you/i.test(message)) return { type: 'TEXT', message: `لاباس الحمد لله، شكراً على السؤال. نقدر نعاونك ترتب رحلتك فـ${destination} أو نجاوبك على الطقس والأنشطة.` };
  return { type: 'TEXT', message: `وعليكم السلام! مرحبا بك. أنا سندباد، رفيقك فالسفر. شنو بغيتي نديرو فـ${destination}؟` };
}

function isTravelMessage(message) {
  return /سفر|رحل|وجه|نشاط|طقس|جو|مطر|شتا|برد|حرارة|خريطة|فندق|مطعم|مقهى|مطار|قطار|ميزاني|شنطة|تجهيز|بدل|استبدل|أرخص|حيد|احذف|نقل|رتب|خطة|يوم|اليوم|غدا|غداً|travel|trip|weather|hotel|restaurant|map|airport|replace|remove|move|replan/i.test(message);
}

function tripDestination(trip) {
  return trip?.destinationDisplay || trip?.destination || trip?.destinationName || trip?.city || 'وجهتك';
}

async function weatherResponse(trip) {
  const destination = tripDestination(trip);
  let coords = trip?.cityCoords || (Number.isFinite(Number(trip?.lat)) && Number.isFinite(Number(trip?.lng)) ? { lat: Number(trip.lat), lng: Number(trip.lng) } : null);
  if (!coords) coords = await geocodeDestination(destination);
  if (!coords) return { type: 'TEXT', message: `ما قدرتش نحدد موقع ${destination} باش نعطيك أرقام طقس حقيقية دابا.` };
  try {
    const start = trip?.dates?.start || trip?.start_date;
    const end = trip?.dates?.end || trip?.end_date || start;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(coords.lat)}&longitude=${encodeURIComponent(coords.lng)}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);
    const data = await response.json();
    const current = data.current;
    const daily = data.daily;
    const index = start && Array.isArray(daily?.time) ? Math.max(0, daily.time.indexOf(start)) : 0;
    const temperature = Number(current?.temperature_2m);
    const humidity = Number(current?.relative_humidity_2m);
    const precipitation = Number(current?.precipitation);
    const probability = Number(daily?.precipitation_probability_max?.[index]);
    const max = Number(daily?.temperature_2m_max?.[index]);
    const min = Number(daily?.temperature_2m_min?.[index]);
    const rainy = (Number.isFinite(probability) && probability >= 50) || (Number.isFinite(precipitation) && precipitation > 0);
    const numbers = [temperature, humidity, precipitation, probability, max, min].filter(Number.isFinite).length;
    if (numbers < 2) throw new Error('Incomplete weather data');
    const range = Number.isFinite(min) && Number.isFinite(max) ? `، والمتوقع نهار الرحلة بين ${Math.round(min)} و${Math.round(max)}°م` : '';
    const rainText = Number.isFinite(probability) ? `احتمال التساقطات ${Math.round(probability)}%` : `التساقطات الحالية ${precipitation.toFixed(1)} مم`;
    return {
      type: 'TEXT',
      message: `الطقس الحقيقي فـ${destination}: دابا ${Math.round(temperature)}°م، الرطوبة ${Math.round(humidity)}%، الرياح ${Math.round(Number(current?.wind_speed_10m) || 0)} كم/س، والتساقطات ${precipitation.toFixed(1)} مم. ${rainText}${range}. ${rainy ? 'الأفضل تبدل النشاط الخارجي بنشاط داخلي.' : 'الجو مناسب للنشاط الخارجي.'}`,
      action: rainy ? { type: 'CONFIRM_REPLACE_OUTDOOR', label: 'بدّل النشاط الخارجي بنشاط داخلي' } : null
    };
  } catch (error) {
    console.warn('Assistant weather request failed:', error.message);
    return { type: 'TEXT', message: `ما قدرتش نوصل لبيانات الطقس الحقيقية فـ${destination} دابا؛ عاود المحاولة بعد شوية.` };
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
  const withCoordinates = await Promise.all(merged.map(async (option) => {
    if (option.coords) return option;
    const coords = await geocodeDestination(`${option.title} ${trip?.destination || ''}`);
    return { ...option, coords };
  }));
  const seen = new Set();
  return withCoordinates.filter((option) => {
    const key = option.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);
}

function fallbackResponse(message, trip) {
  const removeRequested = /حيد|احذف|remove|delete/i.test(message);
  const moveRequested = /حرك|نقل|بدل الوقت|move|reschedule/i.test(message);
  const replanRequested = /رتب|خطة من جديد|عاود خطط|replan|rearrange/i.test(message);
  const replaceRequested = /بدل|استبدل|أرخص|غيّر|replace|cheaper/i.test(message);
  const day = numberFromText(message, 1);
  const activityIndex = Math.max(0, numberFromText(message.match(/النشاط\s*(\d+)|activity\s*(\d+)/i)?.[0], 2) - 1);
  if (removeRequested) return { type: 'REMOVE', day, activityIndex, preview: `معاينة: حذف النشاط ${activityIndex + 1} من اليوم ${day}. أكّد قبل التنفيذ.` };
  if (moveRequested) return { type: 'MOVE', day, activityIndex, preview: `معاينة: نقل النشاط ${activityIndex + 1} في اليوم ${day} إلى وقت أنسب. أكّد قبل التنفيذ.` };
  if (replanRequested) return { type: 'REPLAN', day, activityIndex, preview: `معاينة: إعادة ترتيب برنامج اليوم ${day} حسب تفضيلاتك. أكّد قبل التنفيذ.` };
  if (!replaceRequested) return { type: 'TEXT', message: 'نقدر نعاونك فالتخطيط. جرّب تطلب تبديل نشاط بشي أرخص أو ترتيب يومك.' };
  const current = findActivity(trip, day, activityIndex) || flattenActivities(trip)[activityIndex];
  const currentCost = activityCost(current);
  const alternatives = localAlternatives(trip, current, currentCost, categoryFor(current));
  return { type: 'REPLACE_ACTIVITY', day, activityIndex, options: alternatives };
}

const ASSISTANT_SYSTEM_PROMPT = 'أنت سندباد، رفيق سفر مغربي ودود. رد على السلام والمجاملة ("لاباس"، "كيف حالك") بود وبإيجاز ثم وجّه للرحلة. نفّذ أي طلب ضمن نطاق السفر. خارج النطاق → جملة لطيفة تعيد للسفر. أرجع JSON فقط. الأنواع المسموحة: TEXT، REPLACE_ACTIVITY، REMOVE، MOVE، REPLAN. عند أي تعديل، أضف preview واضحاً ولا تنفّذ التعديل دون تأكيد. لا تخترع أماكن أو أرقام طقس؛ استخدم بيانات الرحلة أو المصادر الواقعية المتاحة.';

async function askGemini(message, trip, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const contents = (Array.isArray(history) ? history.slice(-8) : []).map((item) => ({ role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user', parts: [{ text: String(item.content || item.text || '') }] })).filter((item) => item.parts[0].text);
  contents.push({ role: 'user', parts: [{ text: `الرحلة الحالية: ${JSON.stringify(trip)}\nرسالة المستخدم: ${message}` }] });
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: ASSISTANT_SYSTEM_PROMPT }] }, contents, generationConfig: { temperature: 0.3, responseMimeType: 'application/json' } })
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
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  if (!message) return jsonResponse(res, 400, { type: 'TEXT', message: 'اكتب طلبك وسنعاونك في الرحلة.' });
  if (isGreetingMessage(message)) return jsonResponse(res, 200, greetingResponse(message, trip));
  if (!isTravelMessage(message)) return jsonResponse(res, 200, { type: 'TEXT', message: 'أنا مختص بمساعدتك في رحلتك فقط؛ نقدر نعاونك فالوجهة والطقس والأنشطة والميزانية.' });
  if (isWeatherMessage(message)) return jsonResponse(res, 200, await weatherResponse(trip));

  try {
    const aiResponse = await askGemini(message, trip, history);
    const response = aiResponse && typeof aiResponse === 'object' ? aiResponse : fallbackResponse(message, trip);
    if (response.type === 'REPLACE_ACTIVITY' || response.type === 'REPLACE') {
      const day = Number(response.day) || 1;
      const activityIndex = Math.max(0, Number(response.activityIndex) || 0);
      const options = await buildReplacementOptions(trip, day, activityIndex, response.options);
      return jsonResponse(res, 200, { type: 'REPLACE_ACTIVITY', day, activityIndex, options, preview: response.preview || '' });
    }
    if (['REMOVE', 'REMOVE_ACTIVITY', 'MOVE', 'MOVE_ACTIVITY', 'REPLAN'].includes(response.type)) return jsonResponse(res, 200, { ...response, preview: response.preview || response.message || 'معاينة التعديل جاهزة للتأكيد.' });
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
