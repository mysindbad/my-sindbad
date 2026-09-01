// lib/placeModel.js
// Canonical Place model for My Sindbad discovery + AI + navigation.
// Real data only. Never invents ratings, reviews, prices, opening hours, or availability.
// Each optional field is tagged with dataQuality: 'real' | 'estimated' | 'absent'.
// Extensible: add a normalizer per source and register it in normalizePlace().

var CAT_LABEL = {
  attraction: 'tourist_attraction', museum: 'museum', gallery: 'gallery',
  viewpoint: 'viewpoint', theme_park: 'theme_park', zoo: 'zoo', aquarium: 'aquarium',
  castle: 'castle', monument: 'monument', hotel: 'hotel', hostel: 'hostel',
  guest_house: 'guest_house', restaurant: 'restaurant', cafe: 'cafe', fast_food: 'fast_food',
  park: 'park', beach: 'beach', tourism: 'place', amenity: 'place'
};

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
    category: item.category || 'place',
    coordinates: { lat: Number(item.lat), lng: Number(item.lng) },
    lat: Number(item.lat),
    lon: Number(item.lng),
    address: '',
    description: '',
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

export function normalizePlace(source, raw, ctx) {
  ctx = ctx || {};
  if (source === 'osm') return normalizeOSMPlace(raw, ctx);
  if (source === 'local') return normalizeLocalPlace(raw, ctx.cityKey, ctx.index);
  return null;
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
