const CITY_ALIASES = {
  marrakech: ['مراكش', 'marrakech', 'marrakesh', 'merakech', 'marrakes'],
  agadir: ['أغادير', 'اغادير', 'agadir'],
  chefchaouen: ['شفشاون', 'chefchaouen', 'chaouen'],
  fes: ['فاس', 'fes', 'fez'],
  tangier: ['طنجة', 'tangier', 'tanger'],
  rabat: ['الرباط', 'rabat'],
  casablanca: ['الدار البيضاء', 'casablanca', 'casa'],
  istanbul: ['إسطنبول', 'اسطنبول', 'istanbul', 'constantinople'],
  paris: ['باريس', 'paris']
};

export const CITY_COORDS = {
  marrakech: { lat: 31.6295, lng: -7.9811 },
  agadir: { lat: 30.4278, lng: -9.5981 },
  chefchaouen: { lat: 35.1688, lng: -5.2636 },
  fes: { lat: 34.0331, lng: -5.0003 },
  tangier: { lat: 35.7595, lng: -5.8340 },
  rabat: { lat: 34.0209, lng: -6.8416 },
  casablanca: { lat: 33.5731, lng: -7.5898 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  paris: { lat: 48.8566, lng: 2.3522 }
};

export const CITY_DISPLAY = {
  marrakech: 'مراكش',
  agadir: 'أكادير',
  chefchaouen: 'شفشاون',
  fes: 'فاس',
  tangier: 'طنجة',
  rabat: 'الرباط',
  casablanca: 'الدار البيضاء',
  istanbul: 'إسطنبول',
  paris: 'باريس'
};

export const CITY_PLACES = {
  marrakech: [
    { title: 'ساحة جامع الفنا', category: 'attraction', lat: 31.6258, lng: -7.9893, cost: 0, duration: '120 min' },
    { title: 'حديقة ماجوريل', category: 'garden', lat: 31.6416, lng: -8.0035, cost: 70, duration: '120 min' },
    { title: 'قصر الباهية', category: 'attraction', lat: 31.6218, lng: -7.9816, cost: 70, duration: '120 min' },
    { title: 'حدائق المنارة', category: 'garden', lat: 31.6080, lng: -8.0253, cost: 0, duration: '90 min' },
    { title: 'سوق السمارين', category: 'shopping', lat: 31.6293, lng: -7.9882, cost: 150, duration: '120 min' },
    { title: 'متحف إيف سان لوران مراكش', category: 'museum', lat: 31.6417, lng: -8.0031, cost: 100, duration: '90 min' },
    { title: 'مسجد الكتبية', category: 'attraction', lat: 31.6238, lng: -8.0000, cost: 0, duration: '60 min' },
    { title: 'مقهى التوابل', category: 'food', lat: 31.6298, lng: -7.9890, cost: 120, duration: '90 min' },
    { title: 'قصر البديع', category: 'attraction', lat: 31.6186, lng: -7.9874, cost: 70, duration: '90 min' },
    { title: 'فندق لا مامونية', category: 'hotel', lat: 31.6200, lng: -8.0060, cost: 1200, duration: 'overnight' }
  ],
  agadir: [
    { title: 'قصبة أكادير أوفلا', category: 'attraction', lat: 30.4278, lng: -9.6147, cost: 0, duration: '120 min' },
    { title: 'شاطئ أكادير', category: 'nature', lat: 30.4120, lng: -9.6010, cost: 0, duration: '120 min' },
    { title: 'سوق الأحد', category: 'shopping', lat: 30.4190, lng: -9.5930, cost: 50, duration: '120 min' },
    { title: 'متحف التراث الأمازيغي', category: 'museum', lat: 30.4170, lng: -9.5980, cost: 20, duration: '90 min' },
    { title: 'مارينا أكادير', category: 'attraction', lat: 30.4250, lng: -9.6110, cost: 0, duration: '90 min' },
    { title: 'وادي الطيور', category: 'nature', lat: 30.4210, lng: -9.6000, cost: 20, duration: '90 min' },
    { title: 'مدينة أكادير القديمة', category: 'attraction', lat: 30.3400, lng: -9.5400, cost: 40, duration: '120 min' },
    { title: 'حديقة التماسيح', category: 'nature', lat: 30.3800, lng: -9.5300, cost: 75, duration: '120 min' }
  ],
  chefchaouen: [
    { title: 'المدينة القديمة في شفشاون', category: 'attraction', lat: 35.1680, lng: -5.2630, cost: 0, duration: '120 min' },
    { title: 'القصبة', category: 'museum', lat: 35.1688, lng: -5.2636, cost: 20, duration: '90 min' },
    { title: 'ساحة وطاء الحمام', category: 'attraction', lat: 35.1688, lng: -5.2630, cost: 0, duration: '60 min' },
    { title: 'رأس الماء', category: 'nature', lat: 35.1710, lng: -5.2610, cost: 0, duration: '90 min' },
    { title: 'المسجد الإسباني', category: 'attraction', lat: 35.1740, lng: -5.2700, cost: 0, duration: '90 min' },
    { title: 'شلالات أقشور', category: 'nature', lat: 35.1530, lng: -5.1300, cost: 20, duration: '180 min' },
    { title: 'سوق شفشاون', category: 'shopping', lat: 35.1685, lng: -5.2645, cost: 80, duration: '120 min' },
    { title: 'متحف شفشاون الإثنوغرافي', category: 'museum', lat: 35.1690, lng: -5.2638, cost: 20, duration: '60 min' }
  ],
  fes: [
    { title: 'باب بوجلود', category: 'attraction', lat: 34.0609, lng: -4.9858, cost: 0, duration: '90 min' },
    { title: 'جامع القرويين', category: 'attraction', lat: 34.0640, lng: -4.9730, cost: 0, duration: '90 min' },
    { title: 'المدرسة البوعنانية', category: 'museum', lat: 34.0610, lng: -4.9820, cost: 20, duration: '90 min' },
    { title: 'متحف النجارين', category: 'museum', lat: 34.0640, lng: -4.9730, cost: 20, duration: '90 min' },
    { title: 'حدائق جنان السبيل', category: 'garden', lat: 34.0550, lng: -4.9840, cost: 0, duration: '90 min' },
    { title: 'القصر الملكي بفاس', category: 'attraction', lat: 34.0460, lng: -4.9930, cost: 0, duration: '60 min' },
    { title: 'برج الشمال', category: 'attraction', lat: 34.0660, lng: -4.9990, cost: 20, duration: '90 min' },
    { title: 'الملاح بفاس', category: 'attraction', lat: 34.0370, lng: -4.9920, cost: 0, duration: '90 min' }
  ],
  tangier: [
    { title: 'قصبة طنجة', category: 'attraction', lat: 35.7870, lng: -5.8120, cost: 0, duration: '120 min' },
    { title: 'ساحة 9 أبريل 1947', category: 'attraction', lat: 35.7830, lng: -5.8120, cost: 0, duration: '60 min' },
    { title: 'مغارات هرقل', category: 'nature', lat: 35.7590, lng: -5.9370, cost: 50, duration: '120 min' },
    { title: 'رأس سبارطيل', category: 'nature', lat: 35.7860, lng: -5.9230, cost: 0, duration: '90 min' },
    { title: 'متحف المفوضية الأمريكية', category: 'museum', lat: 35.7870, lng: -5.8130, cost: 20, duration: '90 min' },
    { title: 'شاطئ طنجة', category: 'nature', lat: 35.7830, lng: -5.8000, cost: 0, duration: '120 min' },
    { title: 'متحف ابن بطوطة', category: 'museum', lat: 35.7860, lng: -5.8140, cost: 20, duration: '60 min' },
    { title: 'منتزه بيرديكاريس', category: 'garden', lat: 35.7690, lng: -5.8900, cost: 0, duration: '120 min' }
  ],
  rabat: [
    { title: 'صومعة حسان', category: 'attraction', lat: 34.0230, lng: -6.8210, cost: 0, duration: '90 min' },
    { title: 'قصبة الأوداية', category: 'attraction', lat: 34.0290, lng: -6.8360, cost: 0, duration: '120 min' },
    { title: 'شالة', category: 'museum', lat: 34.0080, lng: -6.8210, cost: 70, duration: '120 min' },
    { title: 'ضريح محمد الخامس', category: 'attraction', lat: 34.0220, lng: -6.8220, cost: 0, duration: '60 min' },
    { title: 'مدينة الرباط القديمة', category: 'attraction', lat: 34.0260, lng: -6.8350, cost: 0, duration: '120 min' },
    { title: 'الحدائق الأندلسية', category: 'garden', lat: 34.0280, lng: -6.8370, cost: 0, duration: '60 min' },
    { title: 'متحف محمد السادس للفن الحديث', category: 'museum', lat: 34.0180, lng: -6.8350, cost: 40, duration: '120 min' },
    { title: 'حديقة الحيوانات بالرباط', category: 'nature', lat: 33.9490, lng: -6.9160, cost: 50, duration: '180 min' }
  ],
  casablanca: [
    { title: 'مسجد الحسن الثاني', category: 'attraction', lat: 33.6080, lng: -7.6320, cost: 130, duration: '120 min' },
    { title: 'المدينة القديمة في الدار البيضاء', category: 'attraction', lat: 33.5960, lng: -7.6200, cost: 0, duration: '120 min' },
    { title: 'ساحة محمد الخامس', category: 'attraction', lat: 33.5900, lng: -7.6140, cost: 0, duration: '60 min' },
    { title: 'حديقة الجامعة العربية', category: 'garden', lat: 33.5890, lng: -7.6150, cost: 0, duration: '90 min' },
    { title: 'موروكو مول', category: 'shopping', lat: 33.5730, lng: -7.7100, cost: 200, duration: '180 min' },
    { title: 'كورنيش عين الذئاب', category: 'nature', lat: 33.5960, lng: -7.6800, cost: 0, duration: '120 min' },
    { title: 'حي الحبوس', category: 'shopping', lat: 33.5650, lng: -7.5900, cost: 100, duration: '120 min' },
    { title: 'مقهى ريك', category: 'food', lat: 33.6040, lng: -7.6200, cost: 250, duration: '90 min' }
  ],
  istanbul: [
    { title: 'آيا صوفيا', category: 'museum', lat: 41.0086, lng: 28.9802, cost: 900, duration: '120 min' },
    { title: 'الجامع الأزرق', category: 'attraction', lat: 41.0054, lng: 28.9768, cost: 0, duration: '90 min' },
    { title: 'قصر طوب قابي', category: 'museum', lat: 41.0115, lng: 28.9833, cost: 850, duration: '150 min' },
    { title: 'البازار الكبير', category: 'shopping', lat: 41.0107, lng: 28.9680, cost: 200, duration: '120 min' },
    { title: 'برج غلطة', category: 'attraction', lat: 41.0256, lng: 28.9741, cost: 650, duration: '90 min' },
    { title: 'قصر دولمة بهجة', category: 'museum', lat: 41.0390, lng: 29.0000, cost: 800, duration: '150 min' },
    { title: 'جولة مضيق البوسفور', category: 'nature', lat: 41.0500, lng: 29.0400, cost: 700, duration: '120 min' },
    { title: 'مطعم تشيا صوفيزي', category: 'food', lat: 41.0165, lng: 29.0280, cost: 500, duration: '90 min' }
  ],
  paris: [
    { title: 'برج إيفل', category: 'attraction', lat: 48.8584, lng: 2.2945, cost: 900, duration: '150 min' },
    { title: 'متحف اللوفر', category: 'museum', lat: 48.8606, lng: 2.3376, cost: 850, duration: '180 min' },
    { title: 'كاتدرائية نوتردام', category: 'attraction', lat: 48.8530, lng: 2.3499, cost: 0, duration: '90 min' },
    { title: 'قوس النصر', category: 'attraction', lat: 48.8738, lng: 2.2950, cost: 350, duration: '90 min' },
    { title: 'كنيسة القلب المقدس', category: 'attraction', lat: 48.8867, lng: 2.3431, cost: 0, duration: '90 min' },
    { title: 'حدائق لوكسمبورغ', category: 'garden', lat: 48.8462, lng: 2.3372, cost: 0, duration: '120 min' },
    { title: 'متحف أورسيه', category: 'museum', lat: 48.8600, lng: 2.3266, cost: 650, duration: '150 min' },
    { title: 'الشانزليزيه', category: 'shopping', lat: 48.8698, lng: 2.3078, cost: 200, duration: '120 min' }
  ]
};

function fold(value) {
  return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeCityKey(value) {
  const folded = fold(value);
  return Object.entries(CITY_ALIASES).find(([, aliases]) => aliases.some((alias) => folded.includes(fold(alias))))?.[0] || null;
}

export function normalizeCity(value) {
  const key = normalizeCityKey(value);
  return { key, display: key ? CITY_DISPLAY[key] : String(value || '').trim(), coords: key ? CITY_COORDS[key] : null };
}

export function nearestCityKey(coords) {
  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng ?? coords?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return Object.entries(CITY_COORDS).sort(([, a], [, b]) => {
    const da = Math.hypot(a.lat - lat, a.lng - lng);
    const db = Math.hypot(b.lat - lat, b.lng - lng);
    return da - db;
  })[0]?.[0] || null;
}
