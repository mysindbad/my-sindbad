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

  addActivity: (activity) => {
    const state = AppState.getAll();
    if (!state.activities) state.activities = [];
    // منع التكرار
    if (!state.activities.find(a => a.name === activity.name && a.date === activity.date)) {
      state.activities.push(activity);
      AppState.saveAll(state);
      return true;
    }
    return false; // مكرر
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