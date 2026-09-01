import { fetchJson } from './http.js';
import { normalizeOSMPlace, placeText } from './placeModel.js';

var NL = String.fromCharCode(10);
var WMO_AR = { 0:'صحو', 1:'صحو غالباً', 2:'غائم جزئياً', 3:'غائم', 45:'ضباب', 48:'ضباب متجمد', 51:'رذاذ خفيف', 53:'رذاذ متوسط', 55:'رذاذ كثيف', 56:'رذاذ متجمد', 57:'رذاذ متجمد كثيف', 61:'مطر خفيف', 63:'مطر متوسط', 65:'مطر غزير', 66:'مطر متجمد', 67:'مطر متجمد غزير', 71:'ثلج خفيف', 73:'ثلج متوسط', 75:'ثلج كثيف', 77:'حبيبات ثلج', 80:'زخات مطر', 81:'زخات مطر متوسطة', 82:'زخات مطر غزيرة', 85:'زخات ثلج', 86:'زخات ثلج غزيرة', 95:'عاصفة رعدية', 96:'عاصفة رعدية مع بَرَد', 99:'عاصفة رعدية شديدة مع بَرَد' };
function wmoAr(code){ return WMO_AR[code] || ('حالة جوية ' + code); }
var INDOOR = { 45:1, 48:1, 51:1, 53:1, 55:1, 56:1, 57:1, 61:1, 63:1, 65:1, 66:1, 67:1, 71:1, 73:1, 75:1, 77:1, 80:1, 81:1, 82:1, 85:1, 86:1, 95:1, 96:1, 99:1 };
function isIndoor(code){ return !!INDOOR[code]; }

// Real weather context for a destination over a date range (Open-Meteo). Returns null on failure.
export async function getWeatherContext(lat, lon, startDate, endDate){
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto';
  var data;
  try { data = await fetchJson(url, {}, 8000); } catch (e) { return null; }
  var daily = data.daily;
  if (!daily || !Array.isArray(daily.time)) return null;
  var days = [];
  for (var i = 0; i < daily.time.length; i++) {
    var d = daily.time[i];
    if (startDate && d < startDate) continue;
    if (endDate && d > endDate) continue;
    var rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[i] != null) ? daily.precipitation_probability_max[i] : null;
    days.push({ date: d, tMax: Math.round(daily.temperature_2m_max[i]), tMin: Math.round(daily.temperature_2m_min[i]), code: daily.weather_code[i], desc: wmoAr(daily.weather_code[i]), rainProb: rainProb, indoor: isIndoor(daily.weather_code[i]) });
  }
  var current = data.current ? { temp: Math.round(data.current.temperature_2m), code: data.current.weather_code, desc: wmoAr(data.current.weather_code) } : null;
  return { current: current, days: days };
}

export function weatherContextText(ctx){
  if (!ctx || !ctx.days || !ctx.days.length) return '';
  var lines = ctx.days.map(function (d){
    var s = d.date + ': ' + d.desc + '، ' + d.tMin + '–' + d.tMax + '°C';
    if (d.rainProb != null) s += '، احتمال مطر ' + d.rainProb + '%';
    if (d.indoor) s += ' (يُفضّل أنشطة داخلية)';
    return s;
  });
  var out = 'توقعات الطقس لأيام الرحلة:' + NL + lines.join(NL);
  if (ctx.current) out += NL + 'الطقس الحالي: ' + ctx.current.desc + '، ' + ctx.current.temp + '°C';
  return out;
}

// Real nearby places from OpenStreetMap (Overpass). Returns [] on failure.
function haversineKm(la1, lo1, la2, lo2){ var R=6371, r=Math.PI/180, dLa=(la2-la1)*r, dLo=(lo2-lo1)*r, s=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dLo/2)*Math.sin(dLo/2); return 2*R*Math.asin(Math.sqrt(s)); }

export async function getNearbyPlacesContext(lat, lon){
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
  var q = '[out:json][timeout:12];(nwr(around:8000,' + lat + ',' + lon + ')[\"tourism\"~\"attraction|museum|gallery|viewpoint|theme_park|zoo|aquarium|castle|monument\"];nwr(around:8000,' + lat + ',' + lon + ')[\"amenity\"~\"restaurant|cafe\"];);out center tags 40;';
  var data;
  try { data = await fetchJson('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q), {}, 12000); } catch (e) { return []; }
  var out = [];
  var els = data.elements || [];
  for (var i = 0; i < els.length; i++) {
    var p = normalizeOSMPlace(els[i]);
    if (!p.name || !Number.isFinite(p.lat) || !Number.isFinite(p.lon)) continue;
    p.distanceKm = haversineKm(lat, lon, p.lat, p.lon);
    out.push(p);
    if (out.length >= 24) break;
  }
  return out;
}

export function placesContextText(places){
  if (!places || !places.length) return '';
  return 'أماكن حقيقية قريبة من الوجهة (من OpenStreetMap) تمكنك الاختيار منها:' + NL + places.map(function (p){ return placeText(p, { distanceKm: p.distanceKm }); }).join(NL);
}
