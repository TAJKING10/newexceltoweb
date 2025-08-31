-- Simple script to create the first admin user
-- Run this AFTER running the main migrations (001, 002, 003)

-- Step 1: First, create a user manually in Supabase Dashboard > Authentication > Users
-- Use email: admin@yourcompany.com (or any email you want)
-- Then run this script and replace 'admin@yourcompany.com' with your actual email

-- Step 2: Run this script to promote the user to admin
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'toufic-jandah@hotmail.com'; -- CHANGE THIS TO YOUR EMAIL
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    -- Check if user exists
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found. Please create the user in Supabase Dashboard > Authentication > Users first.', admin_email;
    END IF;
    
    -- Check if user already has a profile
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_user_id) THEN
        -- Create profile if it doesn't exist
        INSERT INTO public.profiles (id, email, full_name, role, status, created_at, updated_at)
        VALUES (
            admin_user_id,
            admin_email,
            'System Administrator',
            'admin',
            'active',
            now(),
            now()
        );
        RAISE NOTICE '✅ Created admin profile for %', admin_email;
    ELSE
        -- Update existing profile to admin
        UPDATE public.profiles 
        SET role = 'admin', status = 'active', updated_at = now()
        WHERE id = admin_user_id;
        RAISE NOTICE '✅ Updated existing profile to admin for %', admin_email;
    END IF;
    
    -- Now insert default admin settings using the admin user ID
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
        ('notification_email', ('""'::text)::jsonb, 'Email for system notifications')
    ) AS default_settings(setting_key, setting_value, description)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.admin_settings 
        WHERE admin_settings.setting_key = default_settings.setting_key
    );
    
    RAISE NOTICE '✅ Default admin settings created';
    RAISE NOTICE '🎉 Admin setup complete! You can now login with: %', admin_email;
    
END $$;