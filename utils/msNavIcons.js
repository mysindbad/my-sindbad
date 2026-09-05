// utils/msNavIcons.js
// Shared SVG maneuver icon system for My Sindbad turn-by-turn navigation.
// Directional icons reflect the actual maneuver direction — they are NOT affected by page RTL/LTR.
// Exposes window.MSNavIcons: { maneuverSVG, maneuverKey }

(function () {
  'use strict';

  var S = 'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';

  var PATHS = {
    straight: '<path d="M12 19V5" ' + S + '/><path d="M7 10l5-5 5 5" ' + S + '/>',
    left: '<path d="M17 19V12a5 5 0 0 0-5-5H5" ' + S + '/><path d="M9 3L5 7l4 4" ' + S + '/>',
    right: '<path d="M7 19V12a5 5 0 0 1 5-5h7" ' + S + '/><path d="M15 3l4 4-4 4" ' + S + '/>',
    slight_left: '<path d="M18 19V14a5 5 0 0 0-5-5H5" ' + S + '/><path d="M9 5L5 9l4 4" ' + S + '/>',
    slight_right: '<path d="M6 19V14a5 5 0 0 1 5-5h7" ' + S + '/><path d="M15 5l4 4-4 4" ' + S + '/>',
    sharp_left: '<path d="M19 19V12a7 7 0 0 0-7-7H4" ' + S + '/><path d="M8 1L4 5l4 4" ' + S + '/>',
    sharp_right: '<path d="M5 19V12a7 7 0 0 1 7-7h7" ' + S + '/><path d="M16 1l4 4-4 4" ' + S + '/>',
    uturn: '<path d="M16 19V11a6 6 0 0 0-12 0v4" ' + S + '/><path d="M1 11L4 15L7 11" ' + S + '/>',
    roundabout: '<circle cx="12" cy="13" r="4" ' + S + '/><path d="M12 5v3" ' + S + '/><path d="M9 7l3-3 3 3" ' + S + '/><path d="M12 21v-4" ' + S + '/>',
    arrive: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" ' + S + '/><circle cx="12" cy="9" r="2.5" ' + S + '/>',
    depart: '<circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>'
  };

  function maneuverKey(type, modifier) {
    var m = String(modifier || '').toLowerCase().trim();
    var t = String(type || '').toLowerCase().trim();
    if (t === 'arrive') return 'arrive';
    if (t === 'depart') return 'depart';
    if (t === 'roundabout' || t === 'rotary' || t === 'exit roundabout' || t === 'exit rotary' || t === 'roundabout turn') return 'roundabout';
    if (m === 'uturn') return 'uturn';
    if (m === 'sharp left') return 'sharp_left';
    if (m === 'sharp right') return 'sharp_right';
    if (m === 'slight left') return 'slight_left';
    if (m === 'slight right') return 'slight_right';
    if (m === 'left') return 'left';
    if (m === 'right') return 'right';
    return 'straight';
  }

  function maneuverSVG(type, modifier) {
    var key = maneuverKey(type, modifier);
    var body = PATHS[key] || PATHS.straight;
    return '<svg viewBox="0 0 24 24" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + body + '</svg>';
  }

  window.MSNavIcons = { maneuverSVG: maneuverSVG, maneuverKey: maneuverKey };
})();