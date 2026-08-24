// تهيئة عميل Supabase — استبدل القيم التالية من لوحة تحكم مشروعك.
const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';
const supabaseConfigured = !SUPABASE_URL.includes('YOUR_PROJECT_REF') &&
  !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY_HERE');

const supabase = supabaseConfigured && window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

window.supabaseClient = supabase;
window.supabaseConfigured = supabaseConfigured;

async function testSupabaseConnection() {
  if (!supabase) {
    console.warn('Supabase is not configured yet.');
    return false;
  }
  const { error } = await supabase.from('_dummy_test_').select('count');
  if (error && error.code !== 'PGRST116') {
    console.error('Supabase connection failed:', error);
    return false;
  }
  console.log('Supabase client is ready.');
  return true;
}

window.testSupabaseConnection = testSupabaseConnection;