-- Fix existing admin_settings if they were inserted with invalid foreign keys
-- Run this if you already ran the original migration and got foreign key errors

DO $$
BEGIN
  -- Check if there are any admin_settings with invalid foreign keys
  IF EXISTS (
    SELECT 1 FROM public.admin_settings s 
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users u WHERE u.id = s.updated_by
    )
  ) THEN
    -- Delete invalid settings
    DELETE FROM public.admin_settings 
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.users u WHERE u.id = updated_by
    );
    
    RAISE NOTICE 'Deleted invalid admin settings with non-existent user references';
  END IF;
  
  -- Now insert default settings if we have an admin user
  PERFORM insert_default_admin_settings();
END $$;