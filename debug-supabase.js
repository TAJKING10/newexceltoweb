// Quick Supabase connection test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auoykquilatpwdcolasp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b3lrcXVpbGF0cHdkY29sYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODcyNjgsImV4cCI6MjA3MjE2MzI2OH0.eComwexy12utoAEFLWhtMYteJ0AcGbqWaP22Gk0Q94M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('payslip_templates')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection error:', error.message);
      console.error('Full error:', error);
    } else {
      console.log('✅ Connection successful!', data);
    }
    
    // Test auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('⚠️ No authenticated user');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();