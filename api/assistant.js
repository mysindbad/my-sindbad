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

function normaliseLanguage(value) { return value === 'en' || value === 'fr' ? value : 'ar'; }
function localize(language, ar, en, fr) { return normaliseLanguage(language) === 'fr' ? fr : normaliseLanguage(language) === 'en' ? en : ar; }

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
  return /طقس|جو|مطر|شتا|شتاء|برد|سخون|حرارة|رطوبة|rain|weather|météo|pluie|température/i.test(message);
}

function isGreetingMessage(message) {
  return /السلام عليكم|سلام|لاباس|كيف حالك|كيف داير|الحمد لله|hello|hi|how are you|bonjour|salut|comment allez[- ]vous|ça va/i.test(String(message || ''));
}

function greetingResponse(message, trip, language = 'ar') {
  const destination = tripDestination(trip, language);
  const wellbeing = /لاباس|كيف حالك|كيف داير|how are you|comment allez[- ]vous|ça va/i.test(message);
  if (wellbeing) return { type: 'TEXT', message: localize(language, `لاباس الحمد لله، شكراً على السؤال. نقدر نعاونك ترتب رحلتك فـ${destination} أو نجاوبك على الطقس والأنشطة.`, `I’m well, thank you. I can help plan your trip to ${destination || 'your destination'} or answer questions about weather and activities.`, `Je vais bien, merci. Je peux vous aider à organiser votre voyage à ${destination || 'votre destination'} ou répondre sur la météo et les activités.`) };
  return { type: 'TEXT', message: localize(language, `وعليكم السلام! مرحبا بك. أنا سندباد، رفيقك فالسفر. شنو بغيتي نديرو فـ${destination}؟`, `Hello! I’m Sindbad, your travel companion. What shall we do with your trip to ${destination || 'your destination'}?`, `Bonjour ! Je suis Sindbad, votre compagnon de voyage. Que souhaitez-vous faire pour votre voyage à ${destination || 'votre destination'} ?`) };
}

function isTravelMessage(message) {
  return /سفر|رحل|وجه|نشاط|طقس|جو|مطر|شتا|برد|حرارة|خريطة|فندق|مطعم|مقهى|مطار|قطار|ميزاني|شنطة|تجهيز|بدل|استبدل|أرخص|حيد|احذف|نقل|رتب|خطة|يوم|اليوم|غدا|غداً|travel|trip|weather|hotel|restaurant|map|airport|replace|remove|move|replan|voyage|hôtel|restaurant|carte|aéroport|remplacer|supprimer|déplacer/i.test(message);
}

function tripDestination(trip, language = 'ar') {
  return trip?.destinationDisplay || trip?.destination || trip?.destinationName || trip?.city || localize(language, 'وجهتك', 'your destination', 'votre destination');
}

async function weatherResponse(trip, language = 'ar') {
  const destination = tripDestination(trip, language);
  let coords = trip?.cityCoords || (Number.isFinite(Number(trip?.lat)) && Number.isFinite(Number(trip?.lng)) ? { lat: Number(trip.lat), lng: Number(trip.lng) } : null);
  if (!coords) coords = await geocodeDestination(destination);
  if (!coords) return { type: 'TEXT', message: localize(language, `ما قدرتش نحدد موقع ${destination} باش نعطيك أرقام طقس حقيقية دابا.`, `I could not locate ${destination} to provide real weather numbers right now.`, `Je n’ai pas pu localiser ${destination} pour fournir les chiffres météo réels.`) };
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
    const range = Number.isFinite(min) && Number.isFinite(max) ? { ar: `، والمتوقع نهار الرحلة بين ${Math.round(min)} و${Math.round(max)}°م`, en: `, with a trip forecast between ${Math.round(min)} and ${Math.round(max)}°C`, fr: `, avec des prévisions entre ${Math.round(min)} et ${Math.round(max)}°C` } : { ar:'', en:'', fr:'' };
    const rainText = Number.isFinite(probability) ? { ar:`احتمال التساقطات ${Math.round(probability)}%`, en:`Rain probability ${Math.round(probability)}%`, fr:`Probabilité de pluie ${Math.round(probability)}%` } : { ar:`التساقطات الحالية ${precipitation.toFixed(1)} مم`, en:`Current precipitation ${precipitation.toFixed(1)} mm`, fr:`Précipitations actuelles ${precipitation.toFixed(1)} mm` };
    const message = localize(language, `الطقس الحقيقي فـ${destination}: دابا ${Math.round(temperature)}°م، الرطوبة ${Math.round(humidity)}%، الرياح ${Math.round(Number(current?.wind_speed_10m) || 0)} كم/س، والتساقطات ${precipitation.toFixed(1)} مم. ${rainText.ar}${range.ar}. ${rainy ? 'الأفضل تبدل النشاط الخارجي بنشاط داخلي.' : 'الجو مناسب للنشاط الخارجي.'}`, `Real weather in ${destination}: ${Math.round(temperature)}°C now, humidity ${Math.round(humidity)}%, wind ${Math.round(Number(current?.wind_speed_10m) || 0)} km/h, and ${precipitation.toFixed(1)} mm precipitation. ${rainText.en}${range.en}. ${rainy ? 'Consider an indoor activity.' : 'The weather is suitable for outdoor activities.'}`, `Météo réelle à ${destination} : ${Math.round(temperature)}°C, humidité ${Math.round(humidity)} %, vent ${Math.round(Number(current?.wind_speed_10m) || 0)} km/h et ${precipitation.toFixed(1)} mm de précipitations. ${rainText.fr}${range.fr}. ${rainy ? 'Privilégiez une activité intérieure.' : 'La météo convient aux activités extérieures.'}`);
    return {
      type: 'TEXT',
      message,
      action: rainy ? { type: 'CONFIRM_REPLACE_OUTDOOR', label: localize(language, 'بدّل النشاط الخارجي بنشاط داخلي', 'Switch the outdoor activity to an indoor one', 'Remplacer par une activité intérieure') } : null
    };
  } catch (error) {
    console.warn('Assistant weather request failed:', error.message);
    return { type: 'TEXT', message: localize(language, `ما قدرتش نوصل لبيانات الطقس الحقيقية فـ${destination} دابا؛ عاود المحاولة بعد شوية.`, `I could not reach real weather data for ${destination}; please try again shortly.`, `Je n’ai pas pu obtenir les données météo réelles pour ${destination} ; réessayez dans un instant.`) };
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

function fallbackResponse(message, trip, language = 'ar') {
  const removeRequested = /حيد|احذف|remove|delete/i.test(message);
  const moveRequested = /حرك|نقل|بدل الوقت|move|reschedule/i.test(message);
  const replanRequested = /رتب|خطة من جديد|عاود خطط|replan|rearrange/i.test(message);
  const replaceRequested = /بدل|استبدل|أرخص|غيّر|replace|cheaper/i.test(message);
  const day = numberFromText(message, 1);
  const activityIndex = Math.max(0, numberFromText(message.match(/النشاط\s*(\d+)|activity\s*(\d+)/i)?.[0], 2) - 1);
  if (removeRequested) return { type: 'REMOVE', day, activityIndex, preview: localize(language, `معاينة: حذف النشاط ${activityIndex + 1} من اليوم ${day}. أكّد قبل التنفيذ.`, `Preview: remove activity ${activityIndex + 1} from day ${day}. Confirm before applying.`, `Aperçu : supprimer l’activité ${activityIndex + 1} du jour ${day}. Confirmez avant l’application.`) };
  if (moveRequested) return { type: 'MOVE', day, activityIndex, preview: localize(language, `معاينة: نقل النشاط ${activityIndex + 1} في اليوم ${day} إلى وقت أنسب. أكّد قبل التنفيذ.`, `Preview: move activity ${activityIndex + 1} on day ${day} to a better time. Confirm before applying.`, `Aperçu : déplacer l’activité ${activityIndex + 1} du jour ${day} à une heure plus adaptée. Confirmez avant l’application.`) };
  if (replanRequested) return { type: 'REPLAN', day, activityIndex, preview: localize(language, `معاينة: إعادة ترتيب برنامج اليوم ${day} حسب تفضيلاتك. أكّد قبل التنفيذ.`, `Preview: replan day ${day} around your preferences. Confirm before applying.`, `Aperçu : réorganiser le jour ${day} selon vos préférences. Confirmez avant l’application.`) };
  if (!replaceRequested) return { type: 'TEXT', message: localize(language, 'نقدر نعاونك فالتخطيط. جرّب تطلب تبديل نشاط بشي أرخص أو ترتيب يومك.', 'I can help plan your trip. Try asking to replace an activity with a cheaper option or rearrange a day.', 'Je peux vous aider à planifier votre voyage. Demandez à remplacer une activité par une option moins chère ou à réorganiser une journée.') };
  const current = findActivity(trip, day, activityIndex) || flattenActivities(trip)[activityIndex];
  const currentCost = activityCost(current);
  const alternatives = localAlternatives(trip, current, currentCost, categoryFor(current));
  return { type: 'REPLACE_ACTIVITY', day, activityIndex, options: alternatives };
}

const ASSISTANT_SYSTEM_PROMPT = 'أنت سندباد، رفيق سفر مغربي ودود. أجب باللغة المطلوبة فقط. رد على السلام والمجاملة ("لاباس"، "كيف حالك") بود وبإيجاز ثم وجّه للرحلة. نفّذ أي طلب ضمن نطاق السفر. خارج النطاق أعد جملة لطيفة تعيد المستخدم للسفر. استخدم سياق الرحلة والطقس الواقعي المرفق، ولا تخترع أماكن أو أرقاماً. أرجع JSON صالحاً فقط بالشكل {"type":"TEXT|REPLACE_ACTIVITY|REMOVE|MOVE|REPLAN","message":"...","preview":"...","day":1,"activityIndex":0,"options":[]}. عند أي تعديل، أضف preview واضحاً، ولا تدّع تنفيذ التعديل؛ التنفيذ يحتاج تأكيداً من الواجهة.';

async function askGemini(message, trip, history = [], language = 'ar', weatherContext = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const contents = (Array.isArray(history) ? history.slice(-5) : []).map((item) => ({ role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user', parts: [{ text: String(item.content || item.text || '') }] })).filter((item) => item.parts[0].text);
  const tripContext = { destination: tripDestination(trip, language), days: Array.isArray(trip?.days) ? trip.days : [], activities: flattenActivities(trip).slice(0, 40) };
  contents.push({ role: 'user', parts: [{ text: `لغة الرد المطلوبة: ${normaliseLanguage(language)}\nسياق الرحلة: ${JSON.stringify(tripContext)}\nسياق الطقس الواقعي (إن وجد): ${JSON.stringify(weatherContext || null)}\nرسالة المستخدم: ${message}` }] });
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
  const history = Array.isArray(body.history) ? body.history.slice(-5) : [];
  const language = normaliseLanguage(body.language);
  if (!message) return jsonResponse(res, 400, { type: 'TEXT', message: localize(language, 'اكتب طلبك وسنعاونك في الرحلة.', 'Write a request and I will help with your trip.', 'Écrivez votre demande et je vous aiderai pour votre voyage.') });
  let weatherContext = null;
  if (isWeatherMessage(message)) weatherContext = await weatherResponse(trip, language);

  try {
    const aiResponse = await askGemini(message, trip, history, language, weatherContext);
    const response = aiResponse && typeof aiResponse === 'object' ? aiResponse : (weatherContext || (isGreetingMessage(message) ? greetingResponse(message, trip, language) : fallbackResponse(message, trip, language)));
    if (weatherContext?.message && response.type === 'TEXT' && /\d/.test(weatherContext.message) && !/\d/.test(response.message || '')) response.message = `${response.message} ${weatherContext.message}`;
    if (response.type === 'REPLACE_ACTIVITY' || response.type === 'REPLACE') {
      const day = Number(response.day) || 1;
      const activityIndex = Math.max(0, Number(response.activityIndex) || 0);
      const options = await buildReplacementOptions(trip, day, activityIndex, response.options);
      return jsonResponse(res, 200, { type: 'REPLACE_ACTIVITY', day, activityIndex, options, preview: response.preview || '' });
    }
    if (['REMOVE', 'REMOVE_ACTIVITY', 'MOVE', 'MOVE_ACTIVITY', 'REPLAN'].includes(response.type)) return jsonResponse(res, 200, { ...response, preview: response.preview || response.message || 'معاينة التعديل جاهزة للتأكيد.' });
    if (response.type === 'TEXT' && typeof response.message === 'string') return jsonResponse(res, 200, response);
    return jsonResponse(res, 200, weatherContext || fallbackResponse(message, trip, language));
  } catch (error) {
    console.warn('Assistant request failed:', error.message);
    const fallback = weatherContext || (isGreetingMessage(message) ? greetingResponse(message, trip, language) : fallbackResponse(message, trip, language));
    if (fallback.type === 'REPLACE_ACTIVITY') {
      fallback.options = await buildReplacementOptions(trip, fallback.day, fallback.activityIndex, fallback.options);
    }
    return jsonResponse(res, 200, fallback);
  }
}
