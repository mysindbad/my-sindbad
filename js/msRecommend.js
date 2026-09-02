// js/msRecommend.js
// Smart recommendations surface for My Sindbad — renders weather/distance/time-ranked
// suggestions using the same engine as the assistant. Never invents data.

import { getWeatherContext, getNearbyPlacesContext } from '../lib/tripContext.js';
import { recommendPlaces } from '../lib/recommendations.js';

var CAT_AR = {
  museum: '\u0645\u062a\u062d\u0641', gallery: '\u0645\u0639\u0631\u0636', castle: '\u0642\u0644\u0639\u0629', aquarium: '\u0623\u0643\u0648\u0627\u0631\u064a\u0648\u0645', zoo: '\u062d\u062f\u064a\u0642\u0629 \u062d\u064a\u0648\u0627\u0646\u0627\u062a',
  restaurant: '\u0645\u0637\u0639\u0645', cafe: '\u0645\u0642\u0647\u0649', fast_food: '\u0648\u062c\u0628\u0627\u062a \u0633\u0631\u064a\u0639\u0629', viewpoint: '\u0645\u0637\u0644', park: '\u062d\u062f\u064a\u0642\u0629',
  beach: '\u0634\u0627\u0637\u0626', theme_park: '\u0645\u062f\u064a\u0646\u0629 \u0645\u0644\u0627\u0647\u064a', monument: '\u0646\u0635\u0628', attraction: '\u0645\u0639\u0644\u0645 \u0633\u064a\u0627\u062d\u064a', tourism: '\u0633\u064a\u0627\u062d\u0629'
};
function catAr(c) { return CAT_AR[c] || c || '\u0645\u0643\u0627\u0646'; }

export async function renderSmartRecs(container, opts) {
  if (!container) return;
  opts = opts || {};
  var coords = opts.coords;
  if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) { container.innerHTML = ''; return; }
  container.innerHTML = '<p class="text-xs text-slate-400">\u062c\u0627\u0631\u064d \u062a\u062d\u0636\u064a\u0631 \u0627\u0644\u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a\u2026</p>';
  try {
    var wctx = await getWeatherContext(coords.lat, coords.lng);
    var places = await getNearbyPlacesContext(coords.lat, coords.lng);
    var recs = recommendPlaces(places, wctx, { hour: opts.hour != null ? opts.hour : new Date().getHours(), limit: 4 });
    if (!recs.length) { container.innerHTML = ''; return; }
    var cards = recs.map(function (r) {
      var p = r.place;
      var dist = Number.isFinite(p.distanceKm) ? p.distanceKm.toFixed(1) + ' \u0643\u0645' : '';
      var reason = r.reasons[0] || '';
      var navHref = './navigate.html?dest=' + encodeURIComponent(p.lat + ',' + p.lng) + '&name=' + encodeURIComponent(p.name || '') + '&profile=walking';
      var mapHref = './map.html?lat=' + p.lat + '&lng=' + p.lng + '&name=' + encodeURIComponent(p.name || '');
      return '<div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">' +
        '<div class="flex justify-between items-start">' +
        '<div><div class="font-black text-slate-800">' + (p.name || '') + '</div>' +
        '<div class="text-xs text-slate-500">' + catAr(p.category) + (dist ? ' \u2022 ' + dist : '') + '</div></div>' +
        '<span class="text-amber-600 text-xs font-bold">\u2605</span></div>' +
        (reason ? '<p class="text-xs text-slate-600">\u2713 ' + reason + '</p>' : '') +
        '<div class="flex gap-2">' +
        '<a href="' + navHref + '" class="flex-1 text-center text-xs font-bold py-2 rounded-xl" style="background:#0A192F;color:#D4AF37">\u0645\u0644\u0627\u062d\u0629 \ud83e\udded</a>' +
        '<a href="' + mapHref + '" class="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-white border-2 border-amber-400 text-amber-700">\u062e\u0631\u064a\u0637\u0629 \ud83d\uddfa\ufe0f</a>' +
        '</div></div>';
    }).join('');
    container.innerHTML = '<h2 class="text-sm font-bold text-slate-500">\u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a \u0630\u0643\u064a\u0629 \u2728</h2>' +
      '<p class="text-xs text-slate-400 -mt-1 mb-1">\u0645\u0628\u0646\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0642\u0633 \u0648\u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0648\u0627\u0644\u0648\u0642\u062a</p>' + cards;
  } catch (e) { container.innerHTML = ''; }
}
