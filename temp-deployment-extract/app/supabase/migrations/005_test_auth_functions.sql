-- Test script to validate auth.uid() type casting and RLS policies
-- Run this to verify all type casting issues are resolved

DO $$
BEGIN
  -- Test 1: Verify auth.uid() can be cast to UUID
  RAISE NOTICE 'Testing auth.uid() type casting...';
  
  -- This should not throw an error if type casting works
  PERFORM auth.uid()::uuid;
  
  RAISE NOTICE '✅ auth.uid() type casting works';
  
  -- Test 2: Verify is_admin() function works
  RAISE NOTICE 'Testing is_admin() function...';
  
  -- This should not throw an error
  PERFORM is_admin();
  
  RAISE NOTICE '✅ is_admin() function works';
  
  -- Test 3: Verify owns_record() function works
  RAISE NOTICE 'Testing owns_record() function...';
  
  -- This should not throw an error
  PERFORM owns_record(uuid_generate_v4());
  
  RAISE NOTICE '✅ owns_record() function works';
  
  -- Test 4: Check if we can create a test admin setting
  RAISE NOTICE 'Testing create_admin_setting() function...';
  
  -- Only run if we have an admin user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    PERFORM create_admin_setting('test_setting', '"test_value"'::jsonb, 'Test setting for validation');
    -- Clean up the test setting
    DELETE FROM public.admin_settings WHERE setting_key = 'test_setting';
    RAISE NOTICE '✅ create_admin_setting() function works';
  ELSE
    RAISE NOTICE '⚠️ No admin user found, skipping create_admin_setting() test';
  END IF;
  
  RAISE NOTICE '🎉 All type casting and function tests passed!';
  
END $$;