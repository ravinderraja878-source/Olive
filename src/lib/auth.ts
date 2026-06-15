import { supabase, isSupabaseConfigured } from './supabaseClient';

const MOCK_EMAIL = process.env.NEXT_PUBLIC_MOCK_ADMIN_EMAIL || 'admin@oliveprayerhouse.org';
const MOCK_PASSWORD = process.env.NEXT_PUBLIC_MOCK_ADMIN_PASSWORD || 'adminpassword123';

const isBrowser = () => typeof window !== 'undefined';

export const auth = {
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    // Mock Fallback Auth
    if (email.trim().toLowerCase() === MOCK_EMAIL.toLowerCase() && password === MOCK_PASSWORD) {
      if (isBrowser()) {
        localStorage.setItem('olive_admin_logged_in', 'true');
        localStorage.setItem('olive_admin_email', email);
      }
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (isBrowser()) {
      localStorage.removeItem('olive_admin_logged_in');
      localStorage.removeItem('olive_admin_email');
    }
  },

  async isLoggedIn(): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    }
    if (isBrowser()) {
      return localStorage.getItem('olive_admin_logged_in') === 'true';
    }
    return false;
  },

  getAdminEmail(): string | null {
    if (isBrowser()) {
      return localStorage.getItem('olive_admin_email') || 'Admin User';
    }
    return null;
  }
};
