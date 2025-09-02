-- Template Database Improvements
-- Additional indexes and constraints for better performance and data integrity

-- Add indexes for payslip_templates table (if not already existing)
CREATE INDEX IF NOT EXISTS idx_payslip_templates_owner_id ON public.payslip_templates(owner_id);
CREATE INDEX IF NOT EXISTS idx_payslip_templates_name ON public.payslip_templates(name);
CREATE INDEX IF NOT EXISTS idx_payslip_templates_is_active ON public.payslip_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_payslip_templates_is_default ON public.payslip_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_payslip_templates_created_at ON public.payslip_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_payslip_templates_updated_at ON public.payslip_templates(updated_at);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_payslip_templates_owner_active ON public.payslip_templates(owner_id, is_active);
CREATE INDEX IF NOT EXISTS idx_payslip_templates_owner_default ON public.payslip_templates(owner_id, is_default) WHERE is_default = true;

-- Add constraint to ensure template names are unique per user
ALTER TABLE public.payslip_templates 
ADD CONSTRAINT unique_template_name_per_user UNIQUE (owner_id, name);

-- Add trigger to ensure only one default template per user
CREATE OR REPLACE FUNCTION ensure_single_default_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If this template is being set as default
  IF NEW.is_default = true THEN
    -- Unset any existing default templates for this user
    UPDATE public.payslip_templates 
    SET is_default = false 
    WHERE owner_id = NEW.owner_id 
      AND is_default = true 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default template constraint
DROP TRIGGER IF EXISTS ensure_single_default_template_trigger ON public.payslip_templates;
CREATE TRIGGER ensure_single_default_template_trigger
  BEFORE INSERT OR UPDATE ON public.payslip_templates
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_template();

-- Add updated_at trigger for payslip_templates (if not already exists)
CREATE TRIGGER IF NOT EXISTS update_payslip_templates_updated_at 
  BEFORE UPDATE ON public.payslip_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add audit trigger for payslip_templates
CREATE TRIGGER IF NOT EXISTS audit_payslip_templates 
  AFTER INSERT OR UPDATE OR DELETE ON public.payslip_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION audit_trigger_function();

-- Add template validation function
CREATE OR REPLACE FUNCTION validate_template_data(template_data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Basic validation to ensure template_data contains required fields
  RETURN (
    template_data ? 'id' AND
    template_data ? 'name' AND
    template_data ? 'sections' AND
    jsonb_typeof(template_data->'sections') = 'array'
  );
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for template data validation
ALTER TABLE public.payslip_templates
ADD CONSTRAINT valid_template_data CHECK (validate_template_data(template_data));

-- Add template search function using GIN index for JSONB
CREATE INDEX IF NOT EXISTS idx_payslip_templates_search ON public.payslip_templates 
USING GIN ((template_data));

-- Comments for documentation
COMMENT ON TABLE public.payslip_templates IS 'Stores payslip templates with JSONB data structure';
COMMENT ON COLUMN public.payslip_templates.template_data IS 'Complete template configuration in JSON format';
COMMENT ON COLUMN public.payslip_templates.is_default IS 'Only one template per user can be default';
COMMENT ON COLUMN public.payslip_templates.is_active IS 'Soft delete flag - false means deleted';