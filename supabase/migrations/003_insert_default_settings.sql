-- Insert Default Admin Settings
-- Run this AFTER creating the first admin user

-- Function to insert default settings with the first admin as the updater
CREATE OR REPLACE FUNCTION insert_default_admin_settings()
RETURNS void AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the first admin user
  SELECT id INTO admin_user_id 
  FROM public.profiles 
  WHERE role = 'admin' 
  LIMIT 1;
  
  -- If no admin exists, exit
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'No admin user found. Please create an admin user first.';
    RETURN;
  END IF;
  
  -- Insert default settings only if they don't exist
  INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by) 
  SELECT 
    default_settings.setting_key, 
    default_settings.setting_value, 
    default_settings.description, 
    admin_user_id
  FROM (VALUES
    ('company_name', '"Universal Payslip Platform"'::jsonb, 'Company name for payslips'),
    ('default_currency', '"EUR"'::jsonb, 'Default currency for payslips'),
    ('tax_rates', '{"standard": 0.17, "social": 0.12}'::jsonb, 'Default tax rates'),
    ('require_approval', 'true'::jsonb, 'Require admin approval for payslips'),
    ('max_employees', '100'::jsonb, 'Maximum number of employees allowed'),
    ('payslip_retention_months', '24'::jsonb, 'How long to keep payslip records (months)'),
    ('backup_enabled', 'true'::jsonb, 'Enable automatic backups'),
    ('notification_email', '""'::jsonb, 'Email for system notifications')
  ) AS default_settings(setting_key, setting_value, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.admin_settings 
    WHERE admin_settings.setting_key = default_settings.setting_key
  )
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_id AND role = 'admin');
  
  -- Update all settings to have the admin user as updater
  UPDATE public.admin_settings 
  SET updated_by = admin_user_id 
  WHERE updated_by IS NULL OR updated_by != admin_user_id;
  
  RAISE NOTICE 'Default admin settings inserted successfully for admin user: %', admin_user_id;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT insert_default_admin_settings();