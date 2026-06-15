import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verify credentials exist and are not placeholders
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
