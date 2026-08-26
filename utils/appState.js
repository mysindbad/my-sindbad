// المصدر المركزي لإدارة بيانات التطبيق.
// يقرأ المفاتيح القديمة مرة واحدة عند الحاجة، ثم يعتمد على هذا المفتاح فقط.
const APP_STATE_KEY = 'mysindbad_app_data_v1';
const LEGACY_TRIP_KEYS = ['currentTrip', 'sb_trip'];
const LEGACY_ACTIVITY_KEYS = ['myTripActivities', 'currentItinerary'];

function emptyState() {
  return { user: null, currentTrip: null, activities: [], favorites: [] };
}

function parseStored(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function normaliseState(value) {
  const state = isObject(value) ? value : {};
  return {
    user: state.user ?? null,
    currentTrip: isObject(state.currentTrip) ? state.currentTrip : null,
    activities: Array.isArray(state.activities) ? state.activities : [],
    favorites: Array.isArray(state.favorites) ? state.favorites : []
  };
}

function legacyTrip() {
  for (const key of LEGACY_TRIP_KEYS) {
    const value = parseStored(key, null);
    if (isObject(value)) return value;
  }
  return null;
}

function activitiesFromItinerary(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((day, dayIndex) => (day?.activities || []).map((activity, activityIndex) => ({
    ...activity,
    id: activity.id || `${day?.day || dayIndex + 1}-${activityIndex}`,
    name: activity.name || activity.place || activity.title,
    place: activity.place || activity.name || activity.title,
    description: activity.description || activity.activity,
    day: activity.day || day?.day || dayIndex + 1,
    day_number: activity.day_number || day?.day || dayIndex + 1
  })));
}

function legacyActivities() {
  const direct = parseStored('myTripActivities', []);
  if (Array.isArray(direct) && direct.length) return direct;
  return activitiesFromItinerary(parseStored('currentItinerary', []));
}

function legacyFavorites() {
  const value = parseStored('favorites', []);
  return Array.isArray(value) ? value : [];
}

function hasMeaningfulState(state) {
  return Boolean(state?.user || state?.currentTrip || state?.activities?.length || state?.favorites?.length);
}

function migrateState(stored) {
  const state = normaliseState(stored);
  let migrated = !isObject(stored);
  if (!state.currentTrip) {
    const trip = legacyTrip();
    if (trip) { state.currentTrip = trip; migrated = true; }
  }
  const legacyItinerary = parseStored('currentItinerary', []);
  if (!state.activities.length) {
    const activities = legacyActivities();
    if (activities.length) { state.activities = activities; migrated = true; }
  }
  if (legacyItinerary.length && state.currentTrip && !Array.isArray(state.currentTrip.itinerary)) {
    state.currentTrip = { ...state.currentTrip, itinerary: legacyItinerary };
    migrated = true;
  }
  if (!state.favorites.length) {
    const favorites = legacyFavorites();
    if (favorites.length) { state.favorites = favorites; migrated = true; }
  }
  return { state, migrated };
}

const AppState = {
  getAll: () => {
    const stored = parseStored(APP_STATE_KEY, null);
    const { state, migrated } = migrateState(stored);
    if (migrated || (!hasMeaningfulState(stored) && hasMeaningfulState(state))) AppState.saveAll(state);
    return state;
  },

  saveAll: (data) => {
    try {
      const next = normaliseState(data);
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('storage'));
      return next;
    } catch (error) {
      console.error('Error saving app state:', error);
      return null;
    }
  },

  saveTrip: (tripData) => {
    const state = AppState.getAll();
    state.currentTrip = isObject(tripData) ? tripData : null;
    AppState.saveAll(state);
    return state.currentTrip;
  },

  getTrip: () => AppState.getAll().currentTrip,

  saveActivities: (activities) => {
    const state = AppState.getAll();
    state.activities = Array.isArray(activities) ? activities : [];
    AppState.saveAll(state);
    return state.activities;
  },

  getActivities: () => AppState.getAll().activities || [],

  getItinerary: () => AppState.getAll().currentTrip?.itinerary || [],

  saveItinerary: (itinerary) => {
    const state = AppState.getAll();
    const days = Array.isArray(itinerary) ? itinerary : [];
    state.currentTrip = state.currentTrip ? { ...state.currentTrip, itinerary: days } : state.currentTrip;
    state.activities = days.flatMap((day, dayIndex) => (day?.activities || []).map((activity, activityIndex) => ({
      ...activity,
      id: activity.id || `${day?.day || dayIndex + 1}-${activityIndex}`,
      name: activity.name || activity.place || activity.title,
      place: activity.place || activity.name || activity.title,
      description: activity.description || activity.activity,
      day: activity.day || day?.day || dayIndex + 1,
      day_number: activity.day_number || day?.day || dayIndex + 1
    })));
    AppState.saveAll(state);
    return days;
  },

  saveFavorites: (favorites) => {
    const state = AppState.getAll();
    state.favorites = Array.isArray(favorites) ? favorites : [];
    AppState.saveAll(state);
    return state.favorites;
  },

  getFavorites: () => AppState.getAll().favorites || [],

  addActivity: async (activity) => {
    const state = AppState.getAll();
    const currentTrip = state.currentTrip;
    if (!currentTrip) {
      if (typeof alert === 'function') alert('يرجى إنشاء رحلة أولاً!');
      return false;
    }

    let remoteTripId = currentTrip.id;
    if (window.supabaseClient && !remoteTripId) {
      try {
        const user = (await window.supabaseClient.auth.getUser()).data.user;
        if (user) {
          const result = await window.supabaseClient.from('trips').select('id')
            .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
          if (!result.error) remoteTripId = result.data?.id;
        }
      } catch (error) { console.warn('Could not resolve remote trip:', error.message); }
    }

    if (window.supabaseClient && remoteTripId) {
      try {
        const { error } = await window.supabaseClient.from('activities').insert([{
          trip_id: remoteTripId,
          place_name: activity.name || activity.place || activity.title,
          activity_description: activity.description || activity.activity || 'نشاط مضاف',
          distance: activity.distance || '',
          duration: activity.duration || '',
          estimated_cost: Number(activity.cost || activity.price || 0),
          day_number: Number(activity.day_number || activity.day) || 1
        }]);
        if (error) throw error;
      } catch (error) { console.warn('Supabase activity save failed, keeping canonical local state:', error.message); }
    }

    state.activities = Array.isArray(state.activities) ? state.activities : [];
    if (state.activities.some((item) => item?.id && activity?.id && item.id === activity.id)) return false;
    state.activities.push(activity);
    if (state.currentTrip && Array.isArray(state.currentTrip.itinerary)) {
      const dayNumber = Number(activity.day_number || activity.day) || 1;
      const day = state.currentTrip.itinerary.find((item) => Number(item.day) === dayNumber) || state.currentTrip.itinerary[0];
      if (day) day.activities = [...(day.activities || []), activity];
    }
    AppState.saveAll(state);
    window.dispatchEvent(new Event('appstate:activity-added'));
    return true;
  },

  clear: () => {
    try { localStorage.removeItem(APP_STATE_KEY); } catch (error) { console.warn('Error clearing app state:', error.message); }
    window.location.href = 'index.html';
  }
};

window.AppState = AppState;
