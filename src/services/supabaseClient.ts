/**
 * Supabase Client Configuration
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 環境変数が設定されているかチェック
const isConfigured = supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here';

if (!isConfigured) {
  console.warn('[Supabase] Missing or placeholder environment variables. Auth features will not work.');
  console.warn('[Supabase] Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// 設定されていない場合はダミーURLを使用（エラー回避用）
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isSupabaseConfigured = isConfigured;
