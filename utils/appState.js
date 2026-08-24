// مركزي لإدارة بيانات التطبيق (محاكاة آمنة قبل الربط بـ Supabase)
const APP_STATE_KEY = 'mysindbad_app_data_v1';

const AppState = {
  // جلب كل البيانات
  getAll: () => {
    try {
      const data = localStorage.getItem(APP_STATE_KEY);
      return data ? JSON.parse(data) : { user: null, currentTrip: null, activities: [], favorites: [] };
    } catch (e) {
      console.error('Error reading app state:', e);
      return { user: null, currentTrip: null, activities: [], favorites: [] };
    }
  },

  // حفظ كل البيانات
  saveAll: (data) => {
    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(data));
      // إطلاق حدث لتحديث الصفحات الأخرى إذا كانت مفتوحة
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error saving app state:', e);
    }
  },

  // دوال مساعدة محددة
  saveTrip: (tripData) => {
    const state = AppState.getAll();
    state.currentTrip = tripData;
    AppState.saveAll(state);
  },

  getTrip: () => AppState.getAll().currentTrip,

  addActivity: async (activity) => {
    const state = AppState.getAll();
    let currentTrip = state.currentTrip;
    if (!currentTrip) {
      try {
        currentTrip = JSON.parse(localStorage.getItem('currentTrip') || localStorage.getItem('sb_trip') || 'null');
      } catch (error) { currentTrip = null; }
    }
    if (!currentTrip) { alert('يرجى إنشاء رحلة أولاً!'); return false; }

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
          place_name: activity.name || activity.place,
          activity_description: activity.description || 'نشاط مضاف',
          distance: activity.distance || '',
          duration: activity.duration || '',
           estimated_cost: Number(activity.cost || activity.price || 0),
           day_number: Number(activity.day_number || activity.day) || 1
        }]);
        if (error) throw error;
      } catch (error) {
        console.warn('Supabase activity save failed, falling back to local:', error.message);
      }
    }

    if (!state.activities) state.activities = [];
    if (state.activities.some(a => a.id && activity.id && a.id === activity.id)) return false;
    state.activities.push(activity);
    AppState.saveAll(state);
    try {
      const localActivities = JSON.parse(localStorage.getItem('myTripActivities') || '[]');
      if (!localActivities.some(a => a.id && activity.id && a.id === activity.id)) {
        localActivities.push(activity);
        localStorage.setItem('myTripActivities', JSON.stringify(localActivities));
      }
    } catch (error) {}
    window.dispatchEvent(new Event('appstate:activity-added'));
    return true;
  },

  getActivities: () => AppState.getAll().activities || [],
  
  // مسح البيانات (لتسجيل الخروج أو إعادة الضبط)
  clear: () => {
    localStorage.removeItem(APP_STATE_KEY);
    window.location.href = 'index.html';
  }
};

// جعله متاحاً عالمياً
window.AppState = AppState;