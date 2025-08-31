-- Test script to validate all migrations work correctly
-- Run this AFTER running all other migrations to verify everything is working

DO $$
BEGIN
  -- Test 1: Check if all tables exist
  RAISE NOTICE 'Testing table existence...';
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'profiles table does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
    RAISE EXCEPTION 'employees table does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payslips') THEN
    RAISE EXCEPTION 'payslips table does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payslip_templates') THEN
    RAISE EXCEPTION 'payslip_templates table does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    RAISE EXCEPTION 'audit_logs table does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_settings') THEN
    RAISE EXCEPTION 'admin_settings table does not exist';
  END IF;
  
  RAISE NOTICE '✅ All tables exist';
  
  -- Test 2: Check if RLS is enabled
  RAISE NOTICE 'Testing Row Level Security...';
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on profiles table';
  END IF;
  
  RAISE NOTICE '✅ Row Level Security is enabled';
  
  -- Test 3: Check if functions exist
  RAISE NOTICE 'Testing functions...';
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    RAISE EXCEPTION 'is_admin function does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'insert_default_admin_settings') THEN
    RAISE EXCEPTION 'insert_default_admin_settings function does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'setup_initial_admin') THEN
    RAISE EXCEPTION 'setup_initial_admin function does not exist';
  END IF;
  
  RAISE NOTICE '✅ All functions exist';
  
  -- Test 4: Check if triggers exist
  RAISE NOTICE 'Testing triggers...';
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    RAISE EXCEPTION 'on_auth_user_created trigger does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'protect_employee_sensitive_fields_trigger') THEN
    RAISE EXCEPTION 'protect_employee_sensitive_fields_trigger does not exist';
  END IF;
  
  RAISE NOTICE '✅ All triggers exist';
  
  -- Test 5: Check if indexes exist
  RAISE NOTICE 'Testing indexes...';
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_role') THEN
    RAISE EXCEPTION 'idx_profiles_role index does not exist';
  END IF;
  
  RAISE NOTICE '✅ All indexes exist';
  
  RAISE NOTICE '🎉 All migration tests passed! Your database is ready for the Universal Payslip Platform.';
  
END $$;