import { supabase, isSupabaseConfigured } from './supabaseClient';

const MOCK_EMAIL = process.env.NEXT_PUBLIC_MOCK_ADMIN_EMAIL || 'admin@oliveprayerhouse.org';
const MOCK_PASSWORD = process.env.NEXT_PUBLIC_MOCK_ADMIN_PASSWORD || 'adminpassword123';

const isBrowser = () => typeof window !== 'undefined';

export const auth = {
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      // 1. Try signing in with Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signInError) {
        return { success: true };
      }

      // 2. If login fails, and it matches the default mock credentials, try to auto-signup the user in Supabase
      if (email.trim().toLowerCase() === MOCK_EMAIL.toLowerCase() && password === MOCK_PASSWORD) {
        try {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (!signUpError && signUpData.user) {
            // Try signing in again now that the user has been created
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (!retryError) {
              return { success: true };
            }
          }
        } catch (signUpErr) {
          console.error('Auto-signup error:', signUpErr);
        }

        // 3. If Supabase signup/signin fails or requires email verification,
        // fallback to local offline mode session so they are not locked out.
        if (isBrowser()) {
          localStorage.setItem('olive_admin_logged_in', 'true');
          localStorage.setItem('olive_admin_email', email);
        }
        return { success: true };
      }

      return { success: false, error: signInError.message };
    }

    // Mock Fallback Auth (when Supabase is not configured)
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
