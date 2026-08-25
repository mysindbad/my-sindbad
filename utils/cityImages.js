(function () {
  const aliases = {
    marrakech: ['مراكش', 'marrakech', 'marrakesh', 'merakech', 'marrakes'],
    chefchaouen: ['شفشاون', 'chefchaouen', 'chaouen'],
    istanbul: ['إسطنبول', 'اسطنبول', 'istanbul'],
    agadir: ['أغادير', 'اغادير', 'agadir'],
    fes: ['فاس', 'fes', 'fez'],
    tangier: ['طنجة', 'tangier', 'tanger'],
    rabat: ['الرباط', 'rabat'],
    casablanca: ['الدار البيضاء', 'casablanca', 'casa'],
    paris: ['باريس', 'paris']
  };
  const display = { marrakech: 'مراكش', chefchaouen: 'شفشاون', istanbul: 'إسطنبول', agadir: 'أكادير', fes: 'فاس', tangier: 'طنجة', rabat: 'الرباط', casablanca: 'الدار البيضاء', paris: 'باريس' };
  const images = {
    marrakech: './images/marrakech.jpg',
    chefchaouen: './images/chefchaouen.jpg',
    istanbul: './images/istanbul.jpg'
  };
  const categoryPlaceholders = {
    restaurant: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%237b341e'/%3E%3Ctext x='400' y='260' fill='white' font-size='56' text-anchor='middle'%3E%F0%9F%8D%B4 مطعم%3C/text%3E%3C/svg%3E",
    hotel: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%231e3a8a'/%3E%3Ctext x='400' y='260' fill='white' font-size='56' text-anchor='middle'%3E%F0%9F%8F%A8 فندق%3C/text%3E%3C/svg%3E",
    attraction: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%230a192f'/%3E%3Ctext x='400' y='260' fill='white' font-size='52' text-anchor='middle'%3E%F0%9F%8F%9B%EF%B8%8F معلم%3C/text%3E%3C/svg%3E",
    nature: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23166534'/%3E%3Ctext x='400' y='260' fill='white' font-size='52' text-anchor='middle'%3E%F0%9F%8C%BF طبيعة%3C/text%3E%3C/svg%3E"
  };
  function fold(value) { return String(value || '').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); }
  function normalizeCityKey(value) {
    const folded = fold(value);
    return Object.entries(aliases).find(([, list]) => list.some((item) => folded.includes(fold(item))))?.[0] || null;
  }
  function normalizeCityName(value) {
    const key = normalizeCityKey(value);
    return { key, display: key ? display[key] : String(value || '').trim() };
  }
  function normalizeCityImage(value) {
    const key = normalizeCityKey(value);
    return key && images[key] ? images[key] : '';
  }
  function placeholderForCategory(value) {
    const raw = fold(value);
    if (/restaurant|cafe|food|مطعم|مقهى|أكل|غداء|عشاء/.test(raw)) return categoryPlaceholders.restaurant;
    if (/hotel|riad|accommodation|فندق|رياض|إقامة/.test(raw)) return categoryPlaceholders.hotel;
    if (/garden|park|nature|حديقة|منتزه|طبيعة|شاطئ/.test(raw)) return categoryPlaceholders.nature;
    return categoryPlaceholders.attraction;
  }
  window.MySindbadCity = { normalizeCityKey, normalizeCityName, normalizeCityImage, placeholderForCategory, display };
})();
