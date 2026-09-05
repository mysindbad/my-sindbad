// utils/msPlaces.js
// Smart Places client layer for My Sindbad — canonical Place everywhere.
// Bridges lib/placeModel.js (server canonical contract) to the client pages
// (map / explore / place / itinerary) so every clickable place flows through
// ONE identity: source + sourceId → canonical id → preview → place page → trip → navigation.
// Never invents ratings, reviews, prices, or opening hours.
// Exposes window.MSPlaces (loaded as a module; pages use it after DOMContentLoaded).
import {
  toCanonicalPlace, extractCoords, normalizeCategory, makePlaceId, validCoordinates
} from '../lib/placeModel.js';

// ---- Category visual system (icons + colors) ----
const CATEGORY_ICONS = {
  attraction: '📍', museum: '🏛️', gallery: '🖼️', viewpoint: '🔭',
  monument: '🗿', castle: '🏰', theme_park: '🎢', zoo: '🦓', aquarium: '🐠',
  hotel: '🏨', hostel: '🏨', guest_house: '🏠', accommodation: '🏨',
  restaurant: '🍽️', cafe: '☕', fast_food: '🍔', food: '🍽️',
  park: '🌳', garden: '🌿', beach: '🏖️', nature: '🏔️', camping: '⛺',
  station: '🚉', transport: '🚉', emergency: '🚑',
  shopping: '🛍️', market: '🛍️',
  place: '📍'
};
const CATEGORY_COLORS = {
  attraction: '#D4AF37', museum: '#6366f1', gallery: '#8b5cf6', viewpoint: '#0ea5e9',
  hotel: '#0284c7', hostel: '#0284c7', guest_house: '#0284c7', accommodation: '#0284c7',
  restaurant: '#ef4444', cafe: '#f59e0b', fast_food: '#f97316', food: '#ef4444',
  park: '#22c55e', garden: '#16a34a', beach: '#14b8a6', nature: '#059669', camping: '#84cc16',
  station: '#3b82f6', transport: '#3b82f6', emergency: '#dc2626',
  shopping: '#ec4899', market: '#ec4899',
  place: '#0A192F'
};
const FILTER_CATEGORIES = ['attraction', 'hotel', 'restaurant', 'cafe', 'museum', 'emergency', 'station', 'camping', 'shopping'];

export function categoryIcon(cat) {
  const c = normalizeCategory(cat);
  return CATEGORY_ICONS[c] || CATEGORY_ICONS.place;
}
export function categoryColor(cat) {
  const c = normalizeCategory(cat);
  return CATEGORY_COLORS[c] || CATEGORY_COLORS.place;
}

// ---- Canonical identity (dedup key) ----
// Priority: source:sourceId → existing id → deterministic coords. Never name-only.
export function placeIdentity(place) {
  const cp = toCanonicalPlace(place);
  if (cp.source && cp.source !== 'unknown' && cp.sourceId) return cp.source + ':' + cp.sourceId;
  if (cp.id && !String(cp.id).startsWith('unknown:')) return String(cp.id);
  const c = extractCoords(cp);
  return c ? 'coord:' + c.lat.toFixed(6) + ',' + c.lng.toFixed(6) : '';
}

// Stable activity id for trip storage (dedup-friendly).
export function placeActivityId(place) {
  const cp = toCanonicalPlace(place);
  if (cp.source && cp.source !== 'unknown' && cp.sourceId) return cp.source + ':' + cp.sourceId;
  if (cp.id && !String(cp.id).startsWith('unknown:')) return String(cp.id);
  const c = extractCoords(cp);
  return c ? 'place:' + c.lat.toFixed(6) + ',' + c.lng.toFixed(6) : ('place:' + Date.now());
}

// ---- Dedupe a list of raw places into canonical Places ----
export function dedupePlaces(places) {
  const seen = new Map();
  (Array.isArray(places) ? places : []).forEach(function (raw) {
    const cp = toCanonicalPlace(raw);
    if (!validCoordinates(cp)) return;
    const key = placeIdentity(cp);
    if (!key) return;
    if (!seen.has(key)) seen.set(key, cp);
  });
  return Array.from(seen.values());
}

// ---- URL builders (canonical identity + backward compat) ----
export function placeUrl(place) {
  const cp = toCanonicalPlace(place);
  const c = extractCoords(cp);
  const p = new URLSearchParams();
  if (cp.source && cp.source !== 'unknown' && cp.sourceId) { p.set('id', cp.source + ':' + cp.sourceId); p.set('source', cp.source); p.set('sid', cp.sourceId); }
  if (c) { p.set('lat', c.lat.toFixed(6)); p.set('lon', c.lng.toFixed(6)); }
  if (cp.name) p.set('name', cp.name);
  if (cp.category) p.set('cat', cp.category);
  return './place.html?' + p.toString();
}

export function mapUrl(place) {
  const cp = toCanonicalPlace(place);
  const c = extractCoords(cp);
  const p = new URLSearchParams();
  if (c) { p.set('lat', c.lat.toFixed(6)); p.set('lng', c.lng.toFixed(6)); }
  if (cp.name) p.set('name', cp.name);
  if (cp.source && cp.source !== 'unknown' && cp.sourceId) { p.set('id', cp.source + ':' + cp.sourceId); p.set('source', cp.source); p.set('sid', cp.sourceId); }
  if (cp.category) p.set('cat', cp.category);
  return './map.html?' + p.toString();
}

export function navigateUrl(place, profile) {
  const c = extractCoords(place);
  if (!c) return '';
  const p = new URLSearchParams({ dest: c.lat + ',' + c.lng, profile: profile || 'walking' });
  const cp = toCanonicalPlace(place);
  if (cp.name) p.set('name', cp.name);
  return './navigate.html?' + p.toString();
}

// ---- Add canonical place to trip (dedup by stable id) ----
// Returns { ok: boolean, reason: 'duplicate'|'no-trip'|'no-coords'|'error', activity }
function addPlaceToTrip(place, opts) {
  opts = opts || {};
  const cp = toCanonicalPlace(place);
  const c = extractCoords(cp);
  if (!c) return { ok: false, reason: 'no-coords' };
  const trip = window.AppState && window.AppState.getTrip && window.AppState.getTrip();
  if (!trip) return { ok: false, reason: 'no-trip' };
  const id = placeActivityId(cp);
  const activity = {
    id: id,
    name: cp.name, place: cp.name, title: cp.name,
    description: cp.description || '',
    coords: { lat: c.lat, lng: c.lng }, coordinates: { lat: c.lat, lng: c.lng },
    lat: c.lat, lon: c.lng,
    category: cp.category, type: cp.category,
    cost: (cp.estimatedCost != null ? Number(cp.estimatedCost) : 0) || 0,
    source: cp.source, sourceId: cp.sourceId,
    day_number: opts.day || 1, day: opts.day || 1,
    addedAt: new Date().toISOString()
  };
  // AppState.addActivity dedups by id internally; pre-check for synchronous feedback.
  const existing = (window.AppState.getActivities && window.AppState.getActivities()) || [];
  if (existing.some(function (a) { return a && a.id === id; })) return { ok: false, reason: 'duplicate' };
  const promise = window.AppState.addActivity ? window.AppState.addActivity(activity) : Promise.resolve(true);
  return Promise.resolve(promise).then(function (ok) {
    return { ok: !!ok, reason: ok ? '' : 'error', activity: activity };
  });
}

// ---- Category-aware marker element (DOM node for Mapbox) ----
function buildMarkerElement(place, opts) {
  opts = opts || {};
  const cp = toCanonicalPlace(place);
  const icon = categoryIcon(cp.category);
  const color = opts.color || categoryColor(cp.category);
  const current = !!opts.current;
  const el = document.createElement('div');
  el.className = 'ms-marker' + (current ? ' ms-marker--current' : '');
  el.style.cssText = [
    'display:grid', 'place-items:center',
    'width:' + (opts.size || 30) + 'px', 'height:' + (opts.size || 30) + 'px',
    'min-width:' + (opts.size || 30) + 'px',
    'border-radius:50% 50% 50% 0',
    'transform:rotate(-45deg)',
    'background:' + color,
    'border:2px solid #fff',
    'box-shadow:0 3px 8px rgba(0,0,0,.35)',
    'cursor:pointer',
    'transition:transform .15s ease'
  ].join(';');
  const span = document.createElement('span');
  span.textContent = icon;
  span.style.cssText = 'transform:rotate(45deg);font-size:' + ((opts.size || 30) * 0.5) + 'px;line-height:1';
  el.appendChild(span);
  return el;
}

window.MSPlaces = {
  toCanonical: toCanonicalPlace,
  extractCoords: extractCoords,
  normalizeCategory: normalizeCategory,
  validCoordinates: validCoordinates,
  makePlaceId: makePlaceId,
  categoryIcon: categoryIcon,
  categoryColor: categoryColor,
  placeIdentity: placeIdentity,
  placeActivityId: placeActivityId,
  dedupePlaces: dedupePlaces,
  placeUrl: placeUrl,
  mapUrl: mapUrl,
  navigateUrl: navigateUrl,
  addPlaceToTrip: addPlaceToTrip,
  buildMarkerElement: buildMarkerElement,
  FILTER_CATEGORIES: FILTER_CATEGORIES,
  CATEGORY_ICONS: CATEGORY_ICONS,
  CATEGORY_COLORS: CATEGORY_COLORS
};