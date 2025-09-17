-- Migration: Separate Users (Employees) from Customers
-- This implements the complete separation of authentication users from business customers

-- Create customer/person types
CREATE TYPE person_type AS ENUM ('customer', 'vendor', 'contractor', 'freelancer', 'consultant');
CREATE TYPE person_status AS ENUM ('active', 'inactive', 'suspended', 'terminated', 'completed');
CREATE TYPE work_type AS ENUM ('full-time', 'part-time', 'contractor', 'freelance', 'consultant', 'customer', 'vendor');

-- Create the customers/persons table (separate from users)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  person_id text UNIQUE NOT NULL, -- Business ID for the customer
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email text NOT NULL,
  phone text,

  -- Address Information
  address jsonb DEFAULT '{}', -- {street, city, state, zipCode, country}

  -- Person/Customer Classification
  person_type person_type NOT NULL DEFAULT 'customer',
  work_type work_type DEFAULT 'customer',
  status person_status NOT NULL DEFAULT 'active',

  -- Work/Business Details
  department text,
  position text,
  base_salary numeric(10,2),
  hourly_rate numeric(10,2),
  currency text DEFAULT 'EUR',
  payment_method text,

  -- Metadata
  notes text,
  custom_fields jsonb DEFAULT '{}',

  -- Ownership and Creation Tracking
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id), -- Employee who created this customer
  company_id uuid, -- For multi-tenant support (future)

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
  CONSTRAINT valid_salary_or_rate CHECK (
    (base_salary IS NOT NULL AND base_salary >= 0) OR
    (hourly_rate IS NOT NULL AND hourly_rate >= 0) OR
    (base_salary IS NULL AND hourly_rate IS NULL)
  )
);

-- Create indexes for customers table
CREATE INDEX idx_customers_person_id ON public.customers(person_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_person_type ON public.customers(person_type);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_created_by ON public.customers(created_by_user_id);
CREATE INDEX idx_customers_company_id ON public.customers(company_id);
CREATE INDEX idx_customers_name ON public.customers(first_name, last_name);

-- Add updated_at trigger to customers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add audit trigger to customers
CREATE TRIGGER audit_customers
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table

-- Admins can see all customers
CREATE POLICY "Admins can view all customers" ON public.customers
  FOR SELECT USING (is_admin());

-- Employees can see customers they created or all if admin
CREATE POLICY "Employees can view their customers" ON public.customers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      created_by_user_id = auth.uid()::uuid OR
      is_admin()
    )
  );

-- Employees can create customers
CREATE POLICY "Employees can create customers" ON public.customers
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    created_by_user_id = auth.uid()::uuid AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::uuid
      AND role IN ('admin', 'employee')
      AND status = 'active'
    )
  );

-- Employees can update customers they created
CREATE POLICY "Employees can update their customers" ON public.customers
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      created_by_user_id = auth.uid()::uuid OR
      is_admin()
    )
  );

-- Only admins can delete customers
CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE USING (is_admin());

-- Update payslips table to reference customers instead of employees
ALTER TABLE public.payslips ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE;

-- Create index for the new foreign key
CREATE INDEX idx_payslips_customer_id ON public.payslips(customer_id);

-- Update payslips RLS policies for customers
DROP POLICY IF EXISTS "Employees can view their own payslips" ON public.payslips;

CREATE POLICY "Employees can view customer payslips" ON public.payslips
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin() OR
      EXISTS (
        SELECT 1 FROM public.customers c
        WHERE c.id = customer_id AND c.created_by_user_id = auth.uid()::uuid
      )
    )
  );

-- Create a view for easy customer management (excludes employees/users)
CREATE VIEW public.person_management AS
SELECT
  id,
  person_id,
  first_name,
  last_name,
  full_name,
  email,
  phone,
  address,
  person_type,
  work_type,
  status,
  department,
  position,
  base_salary,
  hourly_rate,
  currency,
  payment_method,
  notes,
  custom_fields,
  created_by_user_id,
  company_id,
  created_at,
  updated_at
FROM public.customers
WHERE person_type IN ('customer', 'vendor', 'contractor', 'freelancer', 'consultant');

-- Grant permissions on the view
GRANT SELECT ON public.person_management TO authenticated;

-- Helper function to get current user's customers
CREATE OR REPLACE FUNCTION get_my_customers()
RETURNS TABLE (
  id uuid,
  person_id text,
  full_name text,
  email text,
  person_type person_type,
  status person_status,
  created_at timestamptz
) AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.person_id,
    c.full_name,
    c.email,
    c.person_type,
    c.status,
    c.created_at
  FROM public.customers c
  WHERE
    c.created_by_user_id = auth.uid()::uuid OR
    is_admin()
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to create a customer (with validation)
CREATE OR REPLACE FUNCTION create_customer(
  p_person_id text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_person_type person_type DEFAULT 'customer',
  p_work_type work_type DEFAULT 'customer',
  p_department text DEFAULT NULL,
  p_position text DEFAULT NULL,
  p_base_salary numeric DEFAULT NULL,
  p_currency text DEFAULT 'EUR',
  p_address jsonb DEFAULT '{}',
  p_custom_fields jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  new_customer_id uuid;
BEGIN
  -- Check if user is authenticated and authorized
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()::uuid
    AND role IN ('admin', 'employee')
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'User not authorized to create customers';
  END IF;

  -- Insert the new customer
  INSERT INTO public.customers (
    person_id,
    first_name,
    last_name,
    email,
    phone,
    person_type,
    work_type,
    department,
    position,
    base_salary,
    currency,
    address,
    custom_fields,
    created_by_user_id
  ) VALUES (
    p_person_id,
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_person_type,
    p_work_type,
    p_department,
    p_position,
    p_base_salary,
    p_currency,
    p_address,
    p_custom_fields,
    auth.uid()::uuid
  ) RETURNING id INTO new_customer_id;

  RETURN new_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update specific employee accounts to have correct roles
CREATE OR REPLACE FUNCTION setup_employee_accounts()
RETURNS void AS $$
BEGIN
  -- Update specific email accounts to be employees (if they exist)
  UPDATE public.profiles
  SET role = 'employee', status = 'active'
  WHERE email IN ('poweroftaj@gmail.com', 'users1@hotmail.com')
  AND role != 'admin'; -- Don't change admins

  RAISE NOTICE 'Employee accounts updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to migrate any existing "person" data to customers table
-- This is for data migration if there's existing person data mixed with users
CREATE OR REPLACE FUNCTION migrate_persons_to_customers()
RETURNS void AS $$
DECLARE
  rec RECORD;
  new_person_id text;
BEGIN
  -- This function should be customized based on your existing data structure
  -- For now, it's a placeholder that assumes you might have person data to migrate

  RAISE NOTICE 'Migration function ready. Customize based on existing data structure.';

  -- Example migration logic (customize as needed):
  /*
  FOR rec IN
    SELECT * FROM some_existing_person_table
    WHERE is_employee = false OR person_type != 'user'
  LOOP
    -- Generate a person_id if not exists
    new_person_id := COALESCE(rec.existing_id, 'CUST_' || EXTRACT(EPOCH FROM now())::text);

    INSERT INTO public.customers (
      person_id,
      first_name,
      last_name,
      email,
      person_type,
      created_by_user_id
    ) VALUES (
      new_person_id,
      rec.first_name,
      rec.last_name,
      rec.email,
      'customer',
      rec.created_by_user_id
    );
  END LOOP;
  */
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.customers IS 'Customers/Persons managed by employees - separate from authentication users';
COMMENT ON VIEW public.person_management IS 'View for Person Management UI - shows only customers, not employee users';
COMMENT ON FUNCTION get_my_customers() IS 'Returns customers created by current user or all if admin';
COMMENT ON FUNCTION create_customer IS 'Creates a new customer with proper validation and ownership tracking';
COMMENT ON FUNCTION setup_employee_accounts() IS 'Sets up specific email accounts as employees';

-- Security: Ensure service_role can access for backend operations
GRANT ALL ON public.customers TO service_role;
GRANT SELECT ON public.person_management TO service_role;
GRANT EXECUTE ON FUNCTION get_my_customers() TO service_role;
GRANT EXECUTE ON FUNCTION create_customer TO service_role;