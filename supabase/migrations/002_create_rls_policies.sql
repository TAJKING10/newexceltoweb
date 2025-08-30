-- Row Level Security Policies
-- Admin sees everything, employees only see their own data

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user owns the record
CREATE OR REPLACE FUNCTION owns_record(owner_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = owner_id OR is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles table policies
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id AND NOT (role = 'admin'));

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (is_admin());

-- Employees table policies
CREATE POLICY "Admin full access to employees" ON public.employees
  FOR ALL USING (is_admin());

CREATE POLICY "Employees can view their own data" ON public.employees
  FOR SELECT USING (user_id = auth.uid());

-- Note: RLS policies cannot access OLD/NEW values like triggers can
-- Instead, we'll handle sensitive field protection in the application layer
CREATE POLICY "Employees can update their own basic data" ON public.employees
  FOR UPDATE USING (user_id = auth.uid());

-- Payslips table policies
CREATE POLICY "Admin full access to payslips" ON public.payslips
  FOR ALL USING (is_admin());

CREATE POLICY "Employees can view their own payslips" ON public.payslips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = employee_id AND e.user_id = auth.uid()
    )
  );

-- Payslip templates policies
CREATE POLICY "Admin full access to templates" ON public.payslip_templates
  FOR ALL USING (is_admin());

CREATE POLICY "Employees can view active templates" ON public.payslip_templates
  FOR SELECT USING (is_active = true);

-- Audit logs policies (Admin only)
CREATE POLICY "Admin full access to audit logs" ON public.audit_logs
  FOR ALL USING (is_admin());

-- Admin settings policies (Admin only)
CREATE POLICY "Admin full access to settings" ON public.admin_settings
  FOR ALL USING (is_admin());

-- Function to create initial admin user
CREATE OR REPLACE FUNCTION create_admin_user(admin_email text, admin_password text)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- This function should only be called once during setup
  -- Check if any admin already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'Admin user already exists';
  END IF;
  
  -- Create the admin profile (user creation handled by Supabase Auth)
  -- This will be called after the auth user is created
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration (triggered by auth.users)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'),
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to promote first user to admin (for initial setup)
CREATE OR REPLACE FUNCTION setup_initial_admin(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Only works if no admin exists yet
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    UPDATE public.profiles 
    SET role = 'admin', status = 'active'
    WHERE id = user_id;
    
    -- Note: Default admin settings will be inserted in a separate migration
    -- to avoid circular dependencies
    RAISE NOTICE 'Admin user promoted successfully. Run insert_default_admin_settings() to add default settings.';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to create admin settings with current user
CREATE OR REPLACE FUNCTION create_admin_setting(key text, value jsonb, description_text text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO public.admin_settings (setting_key, setting_value, description, updated_by)
  VALUES (key, value, description_text, auth.uid())
  ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = COALESCE(EXCLUDED.description, admin_settings.description),
    updated_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;