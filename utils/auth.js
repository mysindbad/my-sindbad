// طبقة المصادقة — تعتمد على Supabase عند تهيئة المفاتيح.
const Auth = {
  client() {
    if (!window.supabaseClient) {
      throw new Error('لم يتم إعداد Supabase بعد. أضف المفاتيح في utils/supabaseClient.js');
    }
    return window.supabaseClient;
  },

  async signIn(email, password) {
    const { data, error } = await this.client().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signUp(email, password, fullName) {
    const { data, error } = await this.client().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    if (data.user) {
      const { error: profileError } = await this.client().from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      });
      if (profileError) console.warn('Profile will be saved after the profiles table is created:', profileError.message);
    }
    return data.user;
  },

  async signOut() {
    if (window.supabaseClient) await window.supabaseClient.auth.signOut();
    localStorage.removeItem('sb_session');
    window.location.href = './index.html';
  },

  async getCurrentUser() {
    if (!window.supabaseClient) return null;
    const { data: { user } } = await window.supabaseClient.auth.getUser();
    return user;
  }
};

window.Auth = Auth;