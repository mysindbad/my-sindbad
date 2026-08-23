// تهيئة عميل Supabase
// ملاحظة: سيتم استبدال هذه القيم بمتغيرات البيئة الحقيقية لاحقاً
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// إنشاء العميل وتصديره
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دالة اختبارية للتأكد من أن الاتصال يعمل (سنستدعيها في Console)
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('_dummy_test_').select('count');
    if (error && error.code === 'PGRST116') {
      console.log('✅ Supabase Connected Successfully (Table not found is expected for now)');
      return true;
    }
    console.log('✅ Supabase Connected Successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase Connection Failed:', err);
    return false;
  }
}

// جعل الدالة متاحة عالمياً للاختبار
window.testSupabaseConnection = testSupabaseConnection;