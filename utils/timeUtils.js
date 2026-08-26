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

  // reveal() hides/removes the splash and ensures the app has a chance to render.
  const reveal = () => {
    try {
      const shell = document.getElementById('shell');
      const splash = document.getElementById('splashScreen');

      // If shell exists but is empty, provide a minimal placeholder so users aren't left with a blank screen.
      if (shell && !shell.children.length) {
        shell.innerHTML = '<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#0A192F;color:#fff;text-align:center;font-family:Arial,sans-serif"><div><h1 style="color:#D4AF37;margin-bottom:8px">My Sindbad</h1><p style="opacity:.9">جاري إتمام التحميل — إن لم ينتهي، حاول تحديث الصفحة.</p></div></div>';
      }

      // Always try to hide/remove the splash element if present.
      if (splash) {
        try { splash.style.display = 'none'; } catch (e) {}
        try { splash.setAttribute('aria-hidden', 'true'); } catch (e) {}
        if (typeof splash.remove === 'function') {
          try { splash.remove(); } catch (e) {}
        } else if (splash.parentNode) {
          try { splash.parentNode.removeChild(splash); } catch (e) {}
        }
      }

      // Give the application a short moment then call render() if it's available (the main script defines render()).
      root.setTimeout(() => {
        try {
          if (typeof root.render === 'function') root.render();
        } catch (e) {
          // swallow errors here — reveal should not throw.
          console.warn('Boot watchdog render call failed', e);
        }
      }, 40);
    } catch (err) {
      // Don't allow the watchdog to crash the page.
      console.warn('Boot watchdog failed', err);
    }
  };

  // If a runtime error or unhandled rejection occurs we should reveal a fallback UI promptly.
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('error', reveal, { once: true });
    root.addEventListener('unhandledrejection', reveal, { once: true });
  }

  // Run shortly after DOMContentLoaded, and again as a longer timeout.
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { root.setTimeout(reveal, 80); }, { once: true });
  } else {
    root.setTimeout(reveal, 80);
  }

  // Additional, later fallbacks to ensure splash is removed even if other scripts are slow or hung.
  root.setTimeout(reveal, 1500);
  root.setTimeout(reveal, 3500);
  root.setTimeout(reveal, 7000);
})(typeof globalThis !== 'undefined' ? globalThis : window);
