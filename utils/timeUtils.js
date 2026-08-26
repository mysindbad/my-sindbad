(function attachTimeUtils(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.MySindbadTimeUtils = api;
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function createTimeUtils() {
  /**
   * دالة لتحديد فترة اليوم بناءً على الساعة المحلية للمستخدم
   * @returns {string} 'fajr' | 'morning' | 'day' | 'sunset' | 'night'
   */
  function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 6) return 'fajr';
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 16) return 'day';
    if (hour >= 16 && hour < 19) return 'sunset';
    return 'night';
  }

  function getGreeting() {
    const period = getTimePeriod();
    const greetings = {
      fajr: 'صباح النور 🌙',
      morning: 'صباح الخير ☀️',
      day: 'مرحباً 🌤️',
      sunset: 'مساء الجمال 🌇',
      night: 'مساء الخير ✨'
    };
    return greetings[period];
  }

  function getBackgroundConfig() {
    const period = getTimePeriod();
    const configs = {
      fajr: 'bg-gradient-to-b from-navy-900 to-navy-700',
      morning: 'bg-gradient-to-b from-sky-400 to-sky-200',
      day: 'bg-gradient-to-b from-blue-300 to-blue-100',
      sunset: 'bg-gradient-to-b from-orange-400 via-pink-400 to-purple-500',
      night: 'bg-navy-900'
    };
    return configs[period];
  }

  return { getTimePeriod, getGreeting, getBackgroundConfig };
}));

// The homepage renders before deferred cityImages.js executes. Keep the first render safe.
if (typeof globalThis !== 'undefined' && !globalThis.CITY_IMAGES) {
  globalThis.CITY_IMAGES = {
    istanbul: './images/istanbul.jpg',
    marrakech: './images/marrakech.jpg',
    chefchaouen: './images/chefchaouen.jpg',
    agadir: './images/marrakech.jpg',
    fes: './images/chefchaouen.jpg',
    tangier: './images/chefchaouen.jpg',
    rabat: './images/chefchaouen.jpg',
    casablanca: './images/marrakech.jpg',
    paris: './images/istanbul.jpg'
  };
}

// Make the first render safe while the deferred cityImages.js helper is still loading.
if (typeof globalThis !== 'undefined' && !globalThis.MySindbadCity) {
  const cityKeys = { 'مراكش': 'marrakech', 'شفشاون': 'chefchaouen', 'إسطنبول': 'istanbul', marrakech: 'marrakech', chefchaouen: 'chefchaouen', istanbul: 'istanbul' };
  const cityDisplay = { marrakech: 'مراكش', chefchaouen: 'شفشاون', istanbul: 'إسطنبول' };
  const cityKey = (value) => cityKeys[String(value || '').trim().toLowerCase()] || null;
  globalThis.MySindbadCity = {
    normalizeCityImage: (value) => { const key = cityKey(value); return key ? globalThis.CITY_IMAGES?.[key] || '' : ''; },
    normalizeCityName: (value) => { const key = cityKey(value); return { key, display: key ? cityDisplay[key] : String(value || '').trim() }; },
    placeholderForCategory: () => ''
  };
}

// Prevent a stale shell or a boot-time JavaScript error from leaving the PWA spinning forever.
(function installBootWatchdog(root) {
  if (typeof document === 'undefined' || typeof root.setTimeout !== 'function') return;

  let finished = false;
  let failed = false;
  const getSplash = () => document.getElementById('splashScreen');

  const hideSplash = () => {
    if (finished || failed) return;
    finished = true;
    const splash = getSplash();
    if (!splash) return;
    splash.style.opacity = '0';
    splash.style.transition = 'opacity .18s ease';
    root.setTimeout(() => splash.remove(), 200);
  };

  const showStartupError = (error) => {
    if (finished || failed) return;
    const splash = getSplash();
    if (!splash) { finished = true; return; }
    failed = true;
    console.error('[My Sindbad] startup failed', error);
    splash.innerHTML = '<div style="max-width:22rem;padding:1.5rem;text-align:center;color:#fff;font-family:system-ui,sans-serif;direction:rtl"><strong style="display:block;color:#D4AF37;font-size:1.25rem;margin-bottom:.6rem">تعذر تشغيل My Sindbad</strong><p style="line-height:1.7;margin:0 0 1rem;color:#fff">حدث خطأ أثناء تحميل الصفحة. أعد المحاولة من فضلك.</p><button type="button" id="startupRetry" style="border:0;border-radius:.6rem;padding:.7rem 1.1rem;background:#D4AF37;color:#0A192F;font-weight:700;cursor:pointer">إعادة المحاولة</button></div>';
    splash.querySelector('#startupRetry')?.addEventListener('click', () => root.location.reload());
  };

  root.__hideMySindbadSplash = hideSplash;
  root.__mySindbadStartupFailed = showStartupError;

  root.setTimeout(() => {
    if (!finished && !failed) showStartupError(new Error('Startup timeout'));
  }, 3000);

  const revealAfterLoad = () => {
    root.setTimeout(() => {
      if (!finished && !failed) hideSplash();
    }, 250);
  };
  root.addEventListener('load', revealAfterLoad, { once: true });
  root.addEventListener('error', (event) => {
    if (!finished && (!event.filename || /\.(?:m?js)(?:\?|$)/i.test(event.filename))) {
      showStartupError(event.error || new Error('Script load error'));
    }
  }, true);
  root.addEventListener('unhandledrejection', (event) => {
    if (!finished) showStartupError(event.reason || new Error('Unhandled startup rejection'));
  }, true);
})(typeof globalThis !== 'undefined' ? globalThis : window);
