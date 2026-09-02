// lib/recommendations.js
// Smart, data-grounded recommendations for My Sindbad.
// Scores nearby places using weather, distance, and time-of-day.
// Never invents ratings, prices, reviews, or availability — only ranks real OSM data.

var INDOOR_CATS = { museum: 1, gallery: 1, castle: 1, aquarium: 1, zoo: 1, restaurant: 1, cafe: 1, fast_food: 1, hostel: 1, hotel: 1, guest_house: 1 };
var OUTDOOR_CATS = { viewpoint: 1, park: 1, beach: 1, theme_park: 1, monument: 1, attraction: 1, tourism: 1 };
// WMO weather codes that make outdoor activities uncomfortable.
var BAD_CODES = { 45: 1, 48: 1, 51: 1, 53: 1, 55: 1, 56: 1, 57: 1, 61: 1, 63: 1, 65: 1, 66: 1, 67: 1, 71: 1, 73: 1, 75: 1, 77: 1, 80: 1, 81: 1, 82: 1, 85: 1, 86: 1, 95: 1, 96: 1, 99: 1 };

function isIndoorCategory(cat) { return !!INDOOR_CATS[cat]; }
function isOutdoorCategory(cat) { return !!OUTDOOR_CATS[cat]; }

function dayPart(hour) {
  if (hour == null) return 'any';
  var h = Number(hour);
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 16) return 'midday';
  if (h >= 16 && h < 19) return 'afternoon';
  return 'evening';
}

function badWeather(code) { return !!BAD_CODES[code]; }
function hotWeather(temp) { return Number.isFinite(temp) && temp >= 32; }
function coldWeather(temp) { return Number.isFinite(temp) && temp <= 8; }

// Pick the most relevant weather snapshot from a getWeatherContext() result.
function weatherForToday(wctx) {
  if (!wctx) return null;
  if (wctx.current) return { code: wctx.current.code, temp: wctx.current.temp };
  if (wctx.days && wctx.days[0]) return { code: wctx.days[0].code, temp: wctx.days[0].tMax };
  return null;
}

// Rank places by weather fit, distance, and time-of-day. Returns scored items with Arabic reasons.
// opts.hour (0-23), opts.limit (default 6).
export function recommendPlaces(places, wctx, opts) {
  opts = opts || {};
  if (!Array.isArray(places) || !places.length) return [];
  var hour = (opts.hour != null) ? Number(opts.hour) : new Date().getHours();
  var part = dayPart(hour);
  var wx = weatherForToday(wctx);
  var preferIndoor = wx ? (badWeather(wx.code) || hotWeather(wx.temp) || coldWeather(wx.temp)) : false;
  var preferOutdoor = wx ? (!badWeather(wx.code) && !hotWeather(wx.temp) && !coldWeather(wx.temp)) : false;

  var scored = places.map(function (p) {
    var score = 0;
    var reasons = [];
    var cat = p.category;
    var indoor = isIndoorCategory(cat);
    var outdoor = isOutdoorCategory(cat);

    // Weather alignment
    if (preferIndoor && indoor) { score += 30; reasons.push('\u062f\u0627\u062e\u0644\u064a \u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0637\u0642\u0633 \u0627\u0644\u062d\u0627\u0644\u064a'); }
    else if (preferOutdoor && outdoor) { score += 30; reasons.push('\u062e\u0627\u0631\u062c\u064a \u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0637\u0642\u0633 \u0627\u0644\u062d\u0627\u0644\u064a'); }
    else if (preferIndoor && outdoor) { score -= 15; }
    else if (preferOutdoor && indoor) { score -= 5; }

    // Distance (closer is better; query radius ~8km)
    var d = Number(p.distanceKm);
    if (Number.isFinite(d)) {
      if (d <= 1) { score += 25; reasons.push('\u0642\u0631\u064a\u0628 \u062c\u062f\u0627\u064b (' + d.toFixed(1) + ' \u0643\u0645)'); }
      else if (d <= 3) { score += 18; reasons.push('\u0642\u0631\u064a\u0628 (' + d.toFixed(1) + ' \u0643\u0645)'); }
      else if (d <= 5) { score += 10; }
      else { score += 3; }
    }

    // Time-of-day fit
    if (part === 'morning' && (cat === 'viewpoint' || cat === 'park' || cat === 'attraction' || cat === 'monument')) {
      score += 12; reasons.push('\u0645\u062b\u0627\u0644\u064a \u0644\u0644\u0635\u0628\u0627\u062d');
    } else if (part === 'midday' && (cat === 'museum' || cat === 'gallery' || cat === 'castle' || cat === 'aquarium')) {
      score += 12; reasons.push('\u0645\u062b\u0627\u0644\u064a \u0644\u0645\u0646\u062a\u0635\u0641 \u0627\u0644\u0646\u0647\u0627\u0631');
    } else if ((part === 'evening' || part === 'afternoon') && (cat === 'restaurant' || cat === 'cafe')) {
      score += 14; reasons.push('\u0645\u0646\u0627\u0633\u0628 \u0644\u0644\u0648\u0642\u062a');
    }

    // Data-quality completeness: more verified info = more actionable, never invented
    var dq = p.dataQuality || {};
    var infoBits = 0;
    if (dq.openingHours === 'real') infoBits++;
    if (dq.website === 'real') infoBits++;
    if (dq.address === 'real') infoBits++;
    if (p.description) infoBits++;
    score += infoBits * 2;

    return { place: p, score: score, reasons: reasons, indoor: indoor, outdoor: outdoor };
  });

  scored.sort(function (a, b) { return b.score - a.score; });
  return scored.filter(function (r) { return r.score > 0; }).slice(0, opts.limit || 6);
}

// Render recommendations as Arabic text for the assistant context block.
export function recommendationsText(recs) {
  if (!recs || !recs.length) return '';
  var nl = String.fromCharCode(10);
  var lines = recs.map(function (r) {
    var p = r.place;
    var s = '\u2605 ' + p.name + ' (' + p.category + ')';
    if (Number.isFinite(p.distanceKm)) s += ' \u2014 ' + p.distanceKm.toFixed(1) + ' \u0643\u0645';
    if (r.reasons.length) s += ' \u2014 ' + r.reasons.join('\u060c ');
    return s;
  });
  return '\u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a \u0630\u0643\u064a\u0629 \u0645\u0628\u0646\u064a\u0647 \u0639\u0644\u0649 \u0627\u0644\u0637\u0642\u0633 \u0648\u0627\u0644\u0645\u0633\u0627\u0641\u0629 \u0648\u0627\u0644\u0648\u0642\u062a:' + nl + lines.join(nl);
}
