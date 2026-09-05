// lib/placeModel.js
// Canonical Place model for My Sindbad discovery + AI + navigation.
// Real data only. Never invents ratings, reviews, prices, opening hours, or availability.
// Each optional field is tagged with dataQuality: 'real' | 'estimated' | 'absent'.
// Extensible: add a normalizer per source and register it in normalizePlace().
//
// PHASE 11 — Canonical Place Contract:
//   coordinates: { lat, lng }   (canonical, Number)
//   photos: [ { url, source, caption? } ]
//   source / sourceId           (osm | local:verified | wikipedia | user | business | api)
//   category                     (normalized via normalizeCategory)
//   id                           (stable, source-prefixed: "osm:node/123", "local:cityKey/i")
// Legacy shapes ({lat,lon}, {lat,lng}, {coords:{lat,lng}}) are accepted at the
// normalization boundary (toCanonicalPlace) and never crash consumers.

var CAT_LABEL = {
  attraction: 'tourist_attraction', museum: 'museum', gallery: 'gallery',
  viewpoint: 'viewpoint', theme_park: 'theme_park', zoo: 'zoo', aquarium: 'aquarium',
  castle: 'castle', monument: 'monument', hotel: 'hotel', hostel: 'hostel',
  guest_house: 'guest_house', restaurant: 'restaurant', cafe: 'cafe', fast_food: 'fast_food',
  park: 'park', beach: 'beach', tourism: 'place', amenity: 'place'
};

// Canonical category set + alias map (synonyms → canonical key).
// Same conceptual type must not appear under different names across pages.
var CATEGORY_ALIASES = {
  // attractions
  attraction: 'attraction', tourist_attraction: 'attraction', tourism: 'attraction',
  place: 'place', amenity: 'place',
  museum: 'museum', gallery: 'gallery',
  viewpoint: 'viewpoint', view: 'viewpoint',
  monument: 'monument', castle: 'castle',
  theme_park: 'theme_park', zoo: 'zoo', aquarium: 'aquarium',
  // hospitality
  hotel: 'hotel', hostel: 'hostel', guest_house: 'guest_house', accommodation: 'hotel',
  // food
  restaurant: 'restaurant', restaurants: 'restaurant', food: 'restaurant', dining: 'restaurant',
  cafe: 'cafe', coffee: 'cafe', fast_food: 'fast_food',
  // outdoor / nature
  park: 'park', garden: 'garden', gardens: 'garden',
  beach: 'beach', nature: 'nature', natural: 'nature',
  camping: 'camping', campsite: 'camping',
  // transport / safety
  station: 'station', transport: 'station', emergency: 'emergency',
  // shopping
  shopping: 'shopping', shop: 'shopping', market: 'shopping',
  // meta (itinerary-style)
  activities: 'attraction', activity: 'attraction'
};

export function normalizeCategory(raw) {
  if (raw == null) return 'place';
  var key = String(raw).trim().toLowerCase();
  if (!key) return 'place';
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  // preserve unknown but valid-looking categories (don't silently rename)
  if (/^[a-z_]+$/.test(key)) return key;
  return 'place';
}

function osmCategory(tags, fallback) {
  if (!tags) return fallback || 'place';
  if (tags.tourism) return CAT_LABEL[tags.tourism] || tags.tourism;
  if (tags.amenity) return CAT_LABEL[tags.amenity] || tags.amenity;
  if (tags.leisure === 'park') return 'park';
  if (tags.natural === 'beach') return 'beach';
  return fallback || 'place';
}

function osmAddress(tags) {
  if (!tags) return { value: '', quality: 'absent' };
  var parts = [
    tags['addr:housenumber'], tags['addr:street'], tags['addr:suburb'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village']
  ].filter(Boolean);
  var value = parts.join(' ').trim();
  return { value: value, quality: value ? 'real' : 'absent' };
}

function osmDescription(tags) {
  if (!tags) return { value: '', quality: 'absent' };
  var value = tags.description || tags['description:ar'] || tags.wikipedia || tags.wikidata || '';
  return { value: String(value || ''), quality: value ? 'real' : 'absent' };
}

function osmOpeningHours(tags) {
  if (!tags || !tags.opening_hours) return { value: '', quality: 'absent' };
  return { value: String(tags.opening_hours), quality: 'real' };
}

function osmContact(tags) {
  var website = (tags && (tags.website || tags['contact:website'] || tags.url)) || '';
  var phone = (tags && (tags.phone || tags['contact:phone'])) || '';
  var email = (tags && (tags.email || tags['contact:email'])) || '';
  return { website: String(website || ''), phone: String(phone || ''), email: String(email || '') };
}

// ============ PHOTOS ============
// photos: [ { url, source, caption? } ]. Never invented. Missing => [].
function normalizePhotos(raw) {
  if (!raw) return [];
  if (Array.isArray(raw.photos)) {
    return raw.photos.map(function (p) {
      if (typeof p === 'string') return { url: p, source: String(raw.source || ''), caption: '' };
      return {
        url: String(p.url || ''),
        source: String(p.source || raw.source || ''),
        caption: String(p.caption || '')
      };
    }).filter(function (p) { return p.url; });
  }
  if (raw.image) return [{ url: String(raw.image), source: String(raw.source || ''), caption: '' }];
  return [];
}

// ============ COORDINATES EXTRACTION (legacy boundary) ============
// Accepts: {coordinates:{lat,lng}} | {coords:{lat,lng}} | {lat,lon} | {lat,lng}
// Returns {lat, lng} as Numbers, or null if invalid.
export function extractCoords(raw) {
  if (!raw) return null;
  var lat, lng;
  if (raw.coordinates && (raw.coordinates.lat != null || raw.coordinates.lng != null)) {
    lat = Number(raw.coordinates.lat); lng = Number(raw.coordinates.lng);
  } else if (raw.coords && (raw.coords.lat != null || raw.coords.lng != null)) {
    lat = Number(raw.coords.lat); lng = Number(raw.coords.lng);
  } else {
    lat = Number(raw.lat);
    lng = Number(raw.lng != null ? raw.lng : raw.lon);
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat: lat, lng: lng };
}

export function validCoordinates(place) {
  return extractCoords(place) != null;
}

// ============ STABLE IDs ============
// Strategy: "<source>:<sourceId>" e.g. "osm:node/123", "local:marrakech/3".
// Falls back to raw.id if present, else "unknown:<random>".
export function makePlaceId(source, sourceId, existingId) {
  if (existingId) return String(existingId);
  if (source && sourceId) return source + ':' + sourceId;
  if (sourceId) return String(sourceId);
  return 'unknown:' + Math.random().toString(36).slice(2, 10);
}

export function normalizeOSMPlace(el, opts) {
  opts = opts || {};
  var tags = el.tags || {};
  var lat = el.lat != null ? el.lat : (el.center && el.center.lat);
  var lon = el.lon != null ? el.lon : (el.center && el.center.lon);
  var name = tags.name || tags['name:en'] || tags['name:ar'] || '';
  var addr = osmAddress(tags);
  var desc = osmDescription(tags);
  var oh = osmOpeningHours(tags);
  var contact = osmContact(tags);
  var id = el.type + '/' + el.id;
  return {
    id: id,
    name: String(name || ''),
    category: osmCategory(tags, opts.fallbackCategory),
    coordinates: { lat: Number(lat), lng: Number(lon) },
    lat: Number(lat),
    lon: Number(lon),
    address: addr.value,
    description: desc.value,
    photos: [],
    openingHours: oh.value,
    website: contact.website,
    phone: contact.phone,
    email: contact.email,
    source: 'osm',
    sourceId: id,
    metadata: { osmType: el.type, osmId: el.id },
    rating: null,
    reviews: null,
    estimatedCost: null,
    duration: null,
    dataQuality: {
      coordinates: (Number.isFinite(lat) && Number.isFinite(lon)) ? 'real' : 'absent',
      address: addr.quality,
      description: desc.quality,
      openingHours: oh.quality,
      website: contact.website ? 'real' : 'absent',
      phone: contact.phone ? 'real' : 'absent',
      rating: 'absent',
      reviews: 'absent',
      estimatedCost: 'absent'
    }
  };
}

export function normalizeLocalPlace(item, cityKey, index) {
  var id = 'local/' + cityKey + '/' + index;
  return {
    id: id,
    name: String(item.title || ''),
    category: normalizeCategory(item.category) || 'place',
    coordinates: { lat: Number(item.lat), lng: Number(item.lng) },
    lat: Number(item.lat),
    lon: Number(item.lng),
    address: '',
    description: '',
    photos: [],
    openingHours: '',
    website: '',
    phone: '',
    email: '',
    source: 'local:verified',
    sourceId: id,
    metadata: { city: cityKey },
    rating: null,
    reviews: null,
    estimatedCost: (item.cost != null) ? Number(item.cost) : null,
    duration: item.duration || null,
    dataQuality: {
      coordinates: 'real',
      address: 'absent',
      description: 'absent',
      openingHours: 'absent',
      website: 'absent',
      phone: 'absent',
      rating: 'absent',
      reviews: 'absent',
      estimatedCost: (item.cost != null) ? 'real' : 'absent'
    }
  };
}

// ============ CANONICAL BOUNDARY ============
// Accepts ANY legacy place-like shape and returns a canonical Place.
// Does NOT mutate the input. Preserves optional fields when present.
// Use this at consumer read boundaries instead of touching raw shapes.
export function toCanonicalPlace(raw, opts) {
  opts = opts || {};
  if (!raw) return null;
  // already canonical (from normalizeOSMPlace / normalizeLocalPlace)
  if (raw.coordinates && raw.source && raw.dataQuality) {
    var c = extractCoords(raw);
    if (c) {
      return Object.assign({}, raw, {
        coordinates: { lat: c.lat, lng: c.lng },
        lat: c.lat, lon: c.lng,
        photos: normalizePhotos(raw),
        category: normalizeCategory(raw.category)
      });
    }
  }
  var coords = extractCoords(raw);
  var source = raw.source || opts.source || 'unknown';
  var sourceId = raw.sourceId || raw.id || (coords ? (coords.lat + ',' + coords.lng) : '');
  var id = makePlaceId(source, sourceId, raw.id);
  var category = normalizeCategory(raw.category || opts.fallbackCategory);
  var photos = normalizePhotos(raw);
  var name = String(raw.name || raw.title || raw.place || '');
  return {
    id: id,
    name: name,
    category: category,
    coordinates: coords ? { lat: coords.lat, lng: coords.lng } : { lat: NaN, lng: NaN },
    lat: coords ? coords.lat : NaN,
    lon: coords ? coords.lng : NaN,
    address: String(raw.address || ''),
    description: String(raw.description || raw.activity || ''),
    photos: photos,
    openingHours: String(raw.openingHours || raw.opening_hours || ''),
    website: String(raw.website || ''),
    phone: String(raw.phone || ''),
    email: String(raw.email || ''),
    source: source,
    sourceId: String(sourceId || ''),
    metadata: raw.metadata || {},
    rating: raw.rating != null ? raw.rating : null,
    reviews: raw.reviews != null ? raw.reviews : null,
    estimatedCost: raw.estimatedCost != null ? Number(raw.estimatedCost) : (raw.cost != null ? Number(raw.cost) : (raw.price != null ? Number(raw.price) : null)),
    duration: raw.duration != null ? raw.duration : null,
    dataQuality: raw.dataQuality || {
      coordinates: coords ? 'real' : 'absent',
      address: raw.address ? 'real' : 'absent',
      description: raw.description || raw.activity ? 'real' : 'absent',
      openingHours: raw.openingHours || raw.opening_hours ? 'real' : 'absent',
      website: raw.website ? 'real' : 'absent',
      phone: raw.phone ? 'real' : 'absent',
      rating: raw.rating != null ? 'real' : 'absent',
      reviews: raw.reviews != null ? 'real' : 'absent',
      estimatedCost: (raw.estimatedCost != null || raw.cost != null || raw.price != null) ? 'real' : 'absent'
    }
  };
}

export function normalizePlace(source, raw, ctx) {
  ctx = ctx || {};
  if (source === 'osm') return normalizeOSMPlace(raw, ctx);
  if (source === 'local') return normalizeLocalPlace(raw, ctx.cityKey, ctx.index);
  if (source === 'generic' || source === 'legacy' || source === 'user' || source === 'business' || source === 'api' || source === 'wikipedia') {
    return toCanonicalPlace(raw, { source: source, fallbackCategory: ctx.fallbackCategory });
  }
  // unknown source: try boundary normalization
  return toCanonicalPlace(raw, ctx);
}

export function placeText(place, opts) {
  opts = opts || {};
  if (!place || !place.name) return '';
  var s = '- ' + place.name + ' (' + place.category + ')';
  if (opts.distanceKm != null) s += ' على بعد ' + Number(opts.distanceKm).toFixed(1) + ' كم';
  if (place.openingHours && place.dataQuality && place.dataQuality.openingHours === 'real') s += ' ساعات: ' + place.openingHours;
  if (place.estimatedCost != null && place.dataQuality && place.dataQuality.estimatedCost === 'real') s += ' تكلفة تقريبية: ' + place.estimatedCost;
  if (place.website && place.dataQuality && place.dataQuality.website === 'real') s += ' (له موقع)';
  return s;
}

export function discoveryEnvelope(places, meta) {
  meta = meta || {};
  return { ok: true, source: meta.source || 'osm', count: places.length, truncated: !!meta.truncated, places: places };
}

// ============ VALIDATION ============
export function validatePlace(place) {
  var errors = [];
  if (!place || typeof place !== 'object') { errors.push('place is not an object'); return { valid: false, errors: errors }; }
  if (!place.id) errors.push('missing id');
  if (!place.name) errors.push('missing name');
  if (!place.category) errors.push('missing category');
  if (!place.coordinates || !Number.isFinite(Number(place.coordinates.lat)) || !Number.isFinite(Number(place.coordinates.lng))) errors.push('invalid coordinates');
  if (!place.source) errors.push('missing source');
  if (!Array.isArray(place.photos)) errors.push('photos is not an array');
  if (!place.dataQuality || typeof place.dataQuality !== 'object') errors.push('missing dataQuality');
  return { valid: errors.length === 0, errors: errors };
}

// ============ SELF-TESTS ============
// Returns { passed, failed, results: [{name, ok, detail}] }. Pure, no network.
export function runSelfTests() {
  var results = [];
  function assert(name, ok, detail) { results.push({ name: name, ok: !!ok, detail: detail || '' }); }

  // 1. valid coordinates accepted
  var p1 = toCanonicalPlace({ name: 'A', lat: 31.6, lon: -7.9, category: 'museum', source: 'osm', sourceId: 'node/1' });
  assert('valid coords accepted', validCoordinates(p1), JSON.stringify(p1.coordinates));

  // 2. invalid coordinates rejected
  var p2 = toCanonicalPlace({ name: 'B', lat: 0, lon: 0 });
  assert('zero coords rejected', !validCoordinates(p2), JSON.stringify(p2.coordinates));
  var p2b = toCanonicalPlace({ name: 'B2', lat: 'abc', lon: 'xyz' });
  assert('non-numeric coords rejected', !validCoordinates(p2b), '');

  // 3. {lat, lon} normalized
  var p3 = toCanonicalPlace({ name: 'C', lat: 30.4, lon: -9.5 });
  assert('{lat,lon} normalized', p3.coordinates.lat === 30.4 && p3.coordinates.lng === -9.5, '');

  // 4. {lat, lng} normalized
  var p4 = toCanonicalPlace({ name: 'D', lat: 41.0, lng: 28.9 });
  assert('{lat,lng} normalized', p4.coordinates.lat === 41.0 && p4.coordinates.lng === 28.9, '');

  // 5. {coords:{lat,lng}} normalized
  var p5 = toCanonicalPlace({ name: 'E', coords: { lat: 48.8, lng: 2.3 } });
  assert('{coords:{lat,lng}} normalized', p5.coordinates.lat === 48.8 && p5.coordinates.lng === 2.3, '');

  // 6. {coordinates:{lat,lng}} normalized
  var p6 = toCanonicalPlace({ name: 'F', coordinates: { lat: 33.5, lng: -7.6 } });
  assert('{coordinates:{lat,lng}} normalized', p6.coordinates.lat === 33.5 && p6.coordinates.lng === -7.6, '');

  // 7. category normalization
  assert('food→restaurant', normalizeCategory('food') === 'restaurant', normalizeCategory('food'));
  assert('shopping stays', normalizeCategory('shopping') === 'shopping', normalizeCategory('shopping'));
  assert('tourism→attraction', normalizeCategory('tourism') === 'attraction', normalizeCategory('tourism'));
  assert('empty→place', normalizeCategory('') === 'place', normalizeCategory(''));
  assert('null→place', normalizeCategory(null) === 'place', normalizeCategory(null));

  // 8. missing photos => []
  assert('missing photos => []', Array.isArray(p1.photos) && p1.photos.length === 0, JSON.stringify(p1.photos));

  // 9. photos from single image
  var p9 = toCanonicalPlace({ name: 'G', lat: 1, lng: 1, image: 'https://x.com/a.jpg', source: 'wikipedia' });
  assert('image→photos[0].url', p9.photos.length === 1 && p9.photos[0].url === 'https://x.com/a.jpg', JSON.stringify(p9.photos));

  // 10. missing optional fields don't crash
  var p10 = toCanonicalPlace({ name: 'H', lat: 1, lng: 1 });
  assert('missing optionals ok', p10.address === '' && p10.phone === '' && p10.rating === null && p10.duration === null, '');

  // 11. stable IDs
  var p11a = toCanonicalPlace({ name: 'I', lat: 1, lng: 1, source: 'osm', sourceId: 'node/123' });
  var p11b = toCanonicalPlace({ name: 'I', lat: 1, lng: 1, source: 'osm', sourceId: 'node/123' });
  assert('stable id (same input)', p11a.id === p11b.id, p11a.id + ' vs ' + p11b.id);

  // 12. validatePlace
  var v = validatePlace(p1);
  assert('validatePlace valid', v.valid, v.errors.join(';'));

  // 13. backward compat: legacy lat/lon top-level preserved
  assert('legacy lat/lon top-level', p1.lat === 31.6 && p1.lon === -7.9, '');

  // 14. normalizeOSMPlace includes photos
  var osm = normalizeOSMPlace({ type: 'node', id: 42, lat: 1, lon: 2, tags: { name: 'X', tourism: 'museum' } });
  assert('OSM has photos []', Array.isArray(osm.photos) && osm.photos.length === 0, '');
  assert('OSM canonical coords', osm.coordinates.lat === 1 && osm.coordinates.lng === 2, '');

  // 15. normalizeLocalPlace includes photos + normalized category
  var local = normalizeLocalPlace({ title: 'Y', category: 'food', lat: 1, lng: 2, cost: 50 }, 'marrakech', 0);
  assert('local has photos []', Array.isArray(local.photos) && local.photos.length === 0, '');
  assert('local category normalized', local.category === 'restaurant', local.category);

  var passed = results.filter(function (r) { return r.ok; }).length;
  var failed = results.length - passed;
  return { passed: passed, failed: failed, total: results.length, results: results };
}
