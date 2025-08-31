-- Universal Payslip Platform Database Schema
-- Admin Dashboard + Employee Management System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'pending');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  role user_role NOT NULL DEFAULT 'employee',
  status account_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  last_login timestamptz,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

-- Create employees table (detailed employee information)
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id text UNIQUE NOT NULL,
  department text,
  position text,
  hire_date date,
  salary numeric(10,2),
  currency text DEFAULT 'EUR',
  manager_id uuid REFERENCES public.employees(id),
  address jsonb,
  phone text,
  emergency_contact jsonb,
  bank_details jsonb, -- encrypted sensitive data
  tax_info jsonb,
  notes text,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payslips table
CREATE TABLE public.payslips (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  pay_period_start date NOT NULL,
  pay_period_end date NOT NULL,
  gross_salary numeric(10,2) NOT NULL,
  net_salary numeric(10,2) NOT NULL,
  deductions jsonb NOT NULL DEFAULT '{}',
  allowances jsonb NOT NULL DEFAULT '{}',
  tax_details jsonb NOT NULL DEFAULT '{}',
  payslip_data jsonb NOT NULL DEFAULT '{}', -- flexible structure for payslip content
  template_id uuid,
  generated_by uuid NOT NULL REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approval_date timestamptz,
  status text NOT NULL DEFAULT 'draft',
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_pay_period CHECK (pay_period_start <= pay_period_end),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending', 'approved', 'sent'))
);

-- Create payslip templates table
CREATE TABLE public.payslip_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  template_data jsonb NOT NULL DEFAULT '{}',
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create audit log table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL, -- INSERT, UPDATE, DELETE
  old_data jsonb,
  new_data jsonb,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create admin settings table
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  updated_by uuid NOT NULL REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX idx_employees_owner_id ON public.employees(owner_id);
CREATE INDEX idx_payslips_employee_id ON public.payslips(employee_id);
CREATE INDEX idx_payslips_owner_id ON public.payslips(owner_id);
CREATE INDEX idx_payslips_pay_period ON public.payslips(pay_period_start, pay_period_end);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON public.payslips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payslip_templates_updated_at BEFORE UPDATE ON public.payslip_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user ID, handle null case
  current_user_id := COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid);
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs(table_name, record_id, action, old_data, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), current_user_id);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs(table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user_id);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs(table_name, record_id, action, new_data, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), current_user_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to critical tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_employees AFTER INSERT OR UPDATE OR DELETE ON public.employees FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_payslips AFTER INSERT OR UPDATE OR DELETE ON public.payslips FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create sensitive field protection trigger for employees
CREATE OR REPLACE FUNCTION protect_employee_sensitive_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow admins to modify salary, employee_id, and owner_id
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()::uuid AND role = 'admin' AND status = 'active'
  ) THEN
    -- If not admin, preserve sensitive fields from OLD values
    NEW.salary = OLD.salary;
    NEW.employee_id = OLD.employee_id;
    NEW.owner_id = OLD.owner_id;
    NEW.bank_details = OLD.bank_details;
    NEW.tax_info = OLD.tax_info;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to protect sensitive employee fields
CREATE TRIGGER protect_employee_sensitive_fields_trigger
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION protect_employee_sensitive_fields();

-- Note: Default admin settings will be inserted after the first admin user is created
-- This prevents foreign key constraint violations