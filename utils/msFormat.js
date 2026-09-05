// utils/msFormat.js
// Unified, localized distance + duration formatting for My Sindbad navigation.
// AR / EN / FR. No duplication across pages.
// Exposes window.MSFormat: { formatDistance, formatDuration }

(function () {
  'use strict';

  function lang() {
    return (window.MySindbadI18n && window.MySindbadI18n.getLang && window.MySindbadI18n.getLang()) || 'ar';
  }

  function formatDistance(m, language) {
    if (m == null || !Number.isFinite(m)) return '—';
    var l = language || lang();
    var unit_m, unit_km;
    if (l === 'fr') { unit_m = 'm'; unit_km = 'km'; }
    else if (l === 'en') { unit_m = 'm'; unit_km = 'km'; }
    else { unit_m = 'م'; unit_km = 'كم'; }
    if (m >= 1000) return (m / 1000).toFixed(1) + ' ' + unit_km;
    return Math.round(m) + ' ' + unit_m;
  }

  function formatDuration(s, language) {
    if (s == null || !Number.isFinite(s)) return '—';
    var l = language || lang();
    var m = Math.max(0, Math.round(s / 60));
    var unit_min, unit_hour;
    if (l === 'fr') { unit_min = 'min'; unit_hour = 'h'; }
    else if (l === 'en') { unit_min = 'min'; unit_hour = 'h'; }
    else { unit_min = 'د'; unit_hour = 'س'; }
    if (m < 60) return m + ' ' + unit_min;
    var h = Math.floor(m / 60), r = m % 60;
    return h + ' ' + unit_hour + ' ' + r + ' ' + unit_min;
  }

  window.MSFormat = { formatDistance: formatDistance, formatDuration: formatDuration };
})();