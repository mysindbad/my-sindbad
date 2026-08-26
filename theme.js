(function () {
  const key = 'themePreference';
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function resolve(preference) {
    if (preference === 'dark' || preference === 'light') return preference;
    return media?.matches ? 'dark' : 'light';
  }
  function apply(preference = localStorage.getItem(key) || 'auto') {
    const safe = ['auto', 'light', 'dark'].includes(preference) ? preference : 'auto';
    document.documentElement.dataset.themePreference = safe;
    document.documentElement.dataset.theme = resolve(safe);
    return safe;
  }
  window.MySindbadTheme = { apply, set: apply, get: () => localStorage.getItem(key) || 'auto' };
  apply();
  media?.addEventListener?.('change', () => { if ((localStorage.getItem(key) || 'auto') === 'auto') apply('auto'); });
})();
