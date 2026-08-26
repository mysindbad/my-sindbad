(function () {
  const key = 'themePreference';
  const root = document.documentElement;
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function autoTheme() {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 6) return 'dark';
    return media?.matches ? 'dark' : 'light';
  }
  function resolve(preference) {
    return preference === 'dark' || preference === 'light' ? preference : autoTheme();
  }
  function applyTheme(preference = localStorage.getItem(key) || 'auto') {
    const safe = ['auto', 'light', 'dark'].includes(preference) ? preference : 'auto';
    root.setAttribute('data-theme-preference', safe);
    root.setAttribute('data-theme', resolve(safe));
    return safe;
  }
  function setTheme(preference = 'auto') {
    const safe = ['auto', 'light', 'dark'].includes(preference) ? preference : 'auto';
    localStorage.setItem(key, safe);
    applyTheme(safe);
    return safe;
  }
  window.MySindbadTheme = { applyTheme, apply: applyTheme, set: setTheme, get: () => localStorage.getItem(key) || 'auto', resolve };
  applyTheme();
  media?.addEventListener?.('change', () => { if ((localStorage.getItem(key) || 'auto') === 'auto') applyTheme('auto'); });
})();
