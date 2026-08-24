// تهيئة عميل Supabase — استبدل القيم التالية من لوحة تحكم مشروعك.
const SUPABASE_URL = 'https://xvlgfiyusjyldxkplekf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_erPeWRINlkxFXsSCSi0OIA_sxjGGVoU';
const supabaseConfigured = true;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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