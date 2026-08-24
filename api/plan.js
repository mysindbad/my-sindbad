function getDayCount(startDate, endDate) {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const days = Math.floor((end - start) / 86400000) + 1;
  return Math.max(1, Number.isFinite(days) ? days : 1);
}

function addDays(dateString, amount) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return date.toISOString().split('T')[0];
}

function fallbackPlan({ destination, startDate, endDate, travelStyle, currency }) {
  const dayCount = getDayCount(startDate, endDate);
  const marrakech = [
    ['10:00', 'ساحة جامع الفنا', 'جولة في الساحة والمدينة القديمة', 0, 'ساعتان', 31.6258, -7.9892],
    ['13:00', 'حديقة ماجوريل', 'زيارة الحديقة والتعرف على نباتاتها وفنها', 70, 'ساعتان', 31.6416, -8.0029],
    ['10:00', 'قصر الباهية', 'استكشاف العمارة المغربية والباحات التاريخية', 70, 'ساعتان', 31.6218, -7.9816],
    ['15:00', 'متحف إيف سان لوران مراكش', 'تجربة معرض التصميم والأزياء', 100, 'ساعة ونصف', 31.6417, -8.0031],
    ['10:00', 'مدرسة ابن يوسف', 'جولة في المدرسة القرآنية التاريخية', 50, 'ساعة ونصف', 31.6340, -7.9890],
    ['16:00', 'حدائق المنارة', 'نزهة هادئة حول الصهريج والحدائق', 0, 'ساعة ونصف', 31.6080, -8.0253],
    ['19:00', 'قصر البديع', 'مشاهدة آثار القصر السعدي عند الغروب', 70, 'ساعة ونصف', 31.6186, -7.9874]
  ];
  const generic = [
    ['10:00', `معالم ${destination}`, `جولة ثقافية في أشهر معالم ${destination}`, 0, 'ساعتان', null, null],
    ['13:00', `سوق ${destination}`, 'تجربة المأكولات والتسوق المحلي', 0, 'ساعتان', null, null],
    ['16:00', `حديقة ${destination}`, 'نزهة واسترخاء في مكان محلي', 0, 'ساعة ونصف', null, null]
  ];
  const source = /مراكش|marrakech|morocco|المغرب/i.test(destination) ? marrakech : generic;
  return {
    days: Array.from({ length: dayCount }, (_, index) => ({
      day: index + 1,
      date: addDays(startDate, index),
      activities: [0, 1, 2].map((offset) => {
        const item = source[(index * 3 + offset) % source.length];
        return {
          time: item[0],
          title: item[1],
          desc: `${item[2]}${travelStyle ? ` · مناسب لنمط ${travelStyle}` : ''}`,
          coords: item[5] == null ? null : { lat: item[5], lng: item[6] },
          cost: item[3],
          category: outputCategory({ title: item[1], desc: item[2] }),
          costEstimated: true,
          costLabel: 'تقديري',
          currency,
          duration: item[4]
        };
      })
    }))
  };
}

function isValidPlan(value, dayCount) {
  return Boolean(value && Array.isArray(value.days) && value.days.length === dayCount
    && value.days.every((day, index) => day && day.day === index + 1
      && Array.isArray(day.activities) && day.activities.length > 0
      && day.activities.every((activity) => activity && typeof activity.title === 'string')));
}

function parseGeminiPlan(text) {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

function activityText(activity) {
  return `${activity?.title || ''} ${activity?.desc || ''}`.trim();
}

function classifyActivity(activity) {
  const text = activityText(activity);
  if (/فندق|رياض|إقامة|hotel|riad|check.?in|نزل/i.test(text)) return 'hotel';
  if (/نقل|تاكسي|حافلة|قطار|مطار|transport|taxi|bus|train|airport/i.test(text)) return 'transport';
  if (/تسوق|سوق|بازار|مول|هدايا|shopping|market|souq|mall/i.test(text)) return 'shopping';
  if (/مطعم|مقهى|قهوة|غداء|عشاء|فطور|مأكولات|restaurant|cafe|coffee|lunch|dinner|breakfast|food/i.test(text)) return 'restaurant';
  if (/حديقة|منتزه|بستان|garden|park/i.test(text)) return 'garden';
  return 'attraction';
}

const CATEGORY_ESTIMATES = {
  restaurant: { cost: 150, duration: '90 min' },
  attraction: { cost: 50, duration: '120 min' },
  garden: { cost: 30, duration: '90 min' },
  hotel: { cost: 800, duration: 'check-in' },
  shopping: { cost: 200, duration: '120 min' },
  transport: { cost: 100, duration: '30 min' }
};

function outputCategory(activity) {
  const category = classifyActivity(activity);
  if (category === 'hotel') return 'accommodation';
  if (category === 'restaurant') return 'food';
  if (category === 'transport') return 'transport';
  return 'activities';
}

async function geocodeActivity(activity, destination) {
  const query = `${activityText(activity)} ${destination}`.trim();
  if (!query) return null;
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ar,en&q=${encodeURIComponent(query)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MySindbad/20 (travel planner; contact via repository)'
      }
    });
    if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);
    const rows = await response.json();
    const first = rows?.[0];
    const lat = Number(first?.lat);
    const lng = Number(first?.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch (error) {
    console.warn('Nominatim geocode failed:', query, error.message);
    return null;
  }
}

async function enrichActivity(activity, destination, currency) {
  const category = classifyActivity(activity);
  const estimate = CATEGORY_ESTIMATES[category];
  const coords = await geocodeActivity(activity, destination);
  return {
    ...activity,
    coords,
    category: outputCategory(activity),
    cost: estimate.cost,
    costEstimated: true,
    costLabel: 'تقديري',
    currency: activity.currency || currency,
    duration: estimate.duration
  };
}

// QA20-ENRICH: server-side tool loop; each activity is geocoded before the plan is returned.
async function enrichPlan(plan, destination, currency) {
  const days = [];
  for (const day of plan.days) {
    const activities = [];
    for (const activity of day.activities || []) {
      activities.push(await enrichActivity(activity, destination, currency));
    }
    days.push({ ...day, activities });
  }
  return { ...plan, days };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const input = req.body || {};
  const destination = String(input.destination || '').trim();
  const startDate = String(input.startDate || '');
  const endDate = String(input.endDate || startDate);
  const planInput = {
    destination,
    startDate,
    endDate,
    travelers: Number(input.travelers) || 1,
    budget: Number(input.budget) || 0,
    currency: String(input.currency || 'MAD'),
    travelStyle: String(input.travelStyle || 'ثقافي'),
    preferences: Array.isArray(input.preferences) ? input.preferences.join('، ') : String(input.preferences || '')
  };
  const dayCount = getDayCount(startDate, endDate);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !destination || !startDate) throw new Error('AI planner unavailable');
    const prompt = `أنشئ برنامج سفر واقعي لمدة ${dayCount} أيام إلى ${destination}.
البيانات: من ${startDate} إلى ${endDate}، ${planInput.travelers} مسافر، الميزانية ${planInput.budget} ${planInput.currency}، النمط ${planInput.travelStyle}، التفضيلات: ${planInput.preferences || 'لا توجد'}.
استخدم فقط أماكن حقيقية موجودة فعلاً في ${destination}. لا تخترع أماكن. المسافات والتكاليف يجب أن تكون واقعية. الأنشطة مختلفة لكل يوم ومناسبة للنمط والميزانية.
أعد JSON فقط بهذا الشكل دون Markdown: {"days":[{"day":1,"activities":[{"time":"10:00","title":"...","desc":"...","coords":{"lat":0,"lng":0},"cost":0,"duration":"..."}]}]}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
      })
    });
    if (!response.ok) throw new Error('Gemini request failed');
    const payload = await response.json();
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    const plan = parseGeminiPlan(text);
    if (!isValidPlan(plan, dayCount)) throw new Error('Invalid AI plan');
    return res.status(200).json(await enrichPlan(plan, destination, planInput.currency));
  } catch (error) {
    console.warn('AI plan unavailable; returning local fallback:', error.message);
    return res.status(200).json(fallbackPlan(planInput));
  }
}
