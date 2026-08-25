export const translations = {
  ar: {
    nav_home: 'الرئيسية',
    nav_itinerary: 'برنامجي',
    nav_explore: 'استكشف',
    nav_community: 'المجتمع',
    nav_profile: 'حسابي',
    btn_save: 'حفظ الرحلة',
    btn_replace: 'استبدال',
    btn_sync: 'مزامنة الآن',
    assistant_title: 'مساعد سندباد',
    mode_today: 'وضع اليوم'
  },
  en: {
    nav_home: 'Home',
    nav_itinerary: 'Itinerary',
    nav_explore: 'Explore',
    nav_community: 'Community',
    nav_profile: 'Profile',
    btn_save: 'Save Trip',
    btn_replace: 'Replace',
    btn_sync: 'Sync Now',
    assistant_title: 'Sindbad Assistant',
    mode_today: 'Today Mode'
  }
};

export function getTranslation(lang = 'ar', key = '') {
  const dict = translations[lang] || translations.ar;
  return dict[key] || key;
}

export function applyLang(lang = 'ar') {
  const isRtl = lang === 'ar';
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = getTranslation(lang, key);
    });
  }
}
