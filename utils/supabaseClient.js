// تهيئة عميل Supabase — يعمل التطبيق حتى إذا تعذر تحميل CDN مؤقتاً.
const SUPABASE_URL = 'https://xvlgfiyusjyldxkplekf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_erPeWRINlkxFXsSCSi0OIA_sxjGGVoU';
const supabaseSdk = window.supabase;
const supabaseClient = supabaseSdk?.createClient
  ? supabaseSdk.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
const supabaseConfigured = Boolean(supabaseClient);

window.supabaseClient = supabaseClient;
window.supabaseConfigured = supabaseConfigured;

async function testSupabaseConnection() {
  if (!supabaseClient) {
    console.warn('Supabase CDN is unavailable; continuing in local mode.');
    return false;
  }
  const { error } = await supabaseClient.from('_dummy_test_').select('count');
  if (error && error.code !== 'PGRST116') {
    console.error('Supabase connection failed:', error);
    return false;
  }
  console.log('Supabase client is ready.');
  return true;
}

window.testSupabaseConnection = testSupabaseConnection;
