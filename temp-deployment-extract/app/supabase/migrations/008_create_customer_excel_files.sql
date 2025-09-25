-- Migration: Create customer_excel_files table
-- This table stores Excel files for each customer with versioning support

-- Create the customer_excel_files table
CREATE TABLE public.customer_excel_files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Customer Information
  customer_id text NOT NULL, -- References customers.person_id
  customer_name text NOT NULL,
  
  -- File Information
  file_name text NOT NULL,
  file_data jsonb NOT NULL, -- Excel workbook data stored as JSON
  file_size bigint NOT NULL DEFAULT 0,
  sheet_names text[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  description text,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  
  -- Ownership and Timestamps
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_file_name CHECK (file_name != ''),
  CONSTRAINT valid_customer_name CHECK (customer_name != ''),
  CONSTRAINT valid_version CHECK (version > 0),
  CONSTRAINT valid_file_size CHECK (file_size >= 0)
);

-- Create indexes for better performance
CREATE INDEX idx_customer_excel_files_customer_id ON public.customer_excel_files(customer_id);
CREATE INDEX idx_customer_excel_files_owner_id ON public.customer_excel_files(owner_id);
CREATE INDEX idx_customer_excel_files_file_name ON public.customer_excel_files(file_name);
CREATE INDEX idx_customer_excel_files_is_active ON public.customer_excel_files(is_active);
CREATE INDEX idx_customer_excel_files_created_at ON public.customer_excel_files(created_at);
CREATE INDEX idx_customer_excel_files_updated_at ON public.customer_excel_files(updated_at);

-- Create composite index for common queries
CREATE INDEX idx_customer_excel_files_customer_owner_active ON public.customer_excel_files(customer_id, owner_id, is_active);

-- Add updated_at trigger
CREATE TRIGGER update_customer_excel_files_updated_at 
  BEFORE UPDATE ON public.customer_excel_files 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add audit trigger
CREATE TRIGGER audit_customer_excel_files 
  AFTER INSERT OR UPDATE OR DELETE ON public.customer_excel_files 
  FOR EACH ROW 
  EXECUTE FUNCTION audit_trigger_function();

-- Enable Row Level Security
ALTER TABLE public.customer_excel_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own customer Excel files" ON public.customer_excel_files
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own customer Excel files" ON public.customer_excel_files
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own customer Excel files" ON public.customer_excel_files
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own customer Excel files" ON public.customer_excel_files
  FOR DELETE USING (auth.uid() = owner_id);

-- Admin policy - admins can access all customer Excel files
CREATE POLICY "Admins can access all customer Excel files" ON public.customer_excel_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Create a view for easier customer Excel file management
CREATE VIEW public.customer_excel_file_summary AS
SELECT 
  cef.id,
  cef.customer_id,
  cef.customer_name,
  cef.file_name,
  cef.file_size,
  array_length(cef.sheet_names, 1) as sheet_count,
  cef.description,
  cef.version,
  cef.is_active,
  cef.created_at,
  cef.updated_at,
  p.full_name as owner_name,
  p.email as owner_email
FROM public.customer_excel_files cef
LEFT JOIN public.profiles p ON p.id = cef.owner_id
WHERE cef.is_active = true;

-- Enable RLS on the view
ALTER VIEW public.customer_excel_file_summary SET (security_barrier = true);

-- Create RLS policy for the view
CREATE POLICY "Users can view their own customer Excel file summaries" ON public.customer_excel_file_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.customer_excel_files cef
      WHERE cef.id = customer_excel_file_summary.id 
      AND cef.owner_id = auth.uid()
    )
  );

-- Function to get customer Excel files with pagination
CREATE OR REPLACE FUNCTION get_customer_excel_files(
  p_customer_id text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  customer_id text,
  customer_name text,
  file_name text,
  file_size bigint,
  sheet_count integer,
  description text,
  version integer,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cefs.id,
    cefs.customer_id,
    cefs.customer_name,
    cefs.file_name,
    cefs.file_size,
    cefs.sheet_count,
    cefs.description,
    cefs.version,
    cefs.created_at,
    cefs.updated_at
  FROM public.customer_excel_file_summary cefs
  WHERE (p_customer_id IS NULL OR cefs.customer_id = p_customer_id)
  ORDER BY cefs.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old versions of Excel files (keep only latest N versions)
CREATE OR REPLACE FUNCTION cleanup_old_excel_versions(
  p_customer_id text,
  p_file_name text,
  p_keep_versions integer DEFAULT 5
)
RETURNS integer AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Soft delete old versions, keeping only the latest N versions
  UPDATE public.customer_excel_files
  SET is_active = false, updated_at = now()
  WHERE customer_id = p_customer_id
    AND file_name = p_file_name
    AND owner_id = auth.uid()
    AND is_active = true
    AND id NOT IN (
      SELECT id 
      FROM public.customer_excel_files
      WHERE customer_id = p_customer_id
        AND file_name = p_file_name
        AND owner_id = auth.uid()
        AND is_active = true
      ORDER BY version DESC
      LIMIT p_keep_versions
    );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE public.customer_excel_files IS 'Stores Excel files for customers with versioning support';
COMMENT ON VIEW public.customer_excel_file_summary IS 'Summary view of customer Excel files with owner information';
COMMENT ON FUNCTION get_customer_excel_files IS 'Get customer Excel files with pagination support';
COMMENT ON FUNCTION cleanup_old_excel_versions IS 'Cleanup old versions of Excel files, keeping only the latest N versions';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_excel_files TO authenticated;
GRANT SELECT ON public.customer_excel_file_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_excel_files TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_excel_versions TO authenticated;