import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Debug logging for production - Final deployment with GitHub Secrets
console.log('🔍 Supabase Environment Check:');
console.log('URL:', supabaseUrl ? 'Present' : 'Missing');
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('Environment:', process.env.NODE_ENV);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('This will cause the app to show a white screen.');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)