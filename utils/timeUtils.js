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

// Prevent a stale shell or a boot-time JavaScript error from leaving the PWA spinning forever.
(function installBootWatchdog(root) {
  if (typeof document === 'undefined' || typeof root.setTimeout !== 'function') return;
  const reveal = () => {
    const shell = document.getElementById('shell');
    const splash = document.getElementById('splashScreen');
    if (shell && !shell.children.length) {
      shell.innerHTML = '<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#0A192F;color:#fff;text-align:center;font-family:Arial,sans-serif"><div><h1 style="color:#D4AF37;margin:0 0 12px">My Sindbad</h1><p style="line-height:1.8">تعذر تشغيل الواجهة. أعد تحميل الصفحة للمحاولة من جديد.</p><button type="button" onclick="location.reload()" style="padding:12px 22px;border:0;border-radius:8px;background:#D4AF37;color:#0A192F;font-weight:700;cursor:pointer">إعادة المحاولة</button></div></div>';
    }
    splash?.remove();
  };
  root.addEventListener?.('error', reveal, { once: true });
  root.addEventListener?.('unhandledrejection', reveal, { once: true });
  root.setTimeout(reveal, 4500);
})(typeof globalThis !== 'undefined' ? globalThis : window);
