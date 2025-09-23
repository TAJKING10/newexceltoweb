import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://auoykquilatpwdcolasp.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3lrcXVpbGF0cHdkY29sYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODcyNjgsImV4cCI6MjA3MjE2MzI2OH0.eComwexy12utoAEFLWhtMYteJ0AcGbqWaP22Gk0Q94M'

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storage: window.sessionStorage,
    storageKey: 'payslip-supabase-session-token',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development'
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'payslip-web'
    }
  }
})

// Add auth state change listener for better debugging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 Supabase Auth Event:', event);
  if (event === 'TOKEN_REFRESHED') {
    console.log('✅ Token refreshed automatically');
  }
  if (event === 'SIGNED_OUT') {
    console.log('🚪 User signed out');
  }
  if (event === 'SIGNED_IN' && session) {
    console.log('✅ User session established:', session.user?.email);
  }
  if (event === 'INITIAL_SESSION' && session) {
    console.log('📋 Initial session restored:', session.user?.email);
  }
})