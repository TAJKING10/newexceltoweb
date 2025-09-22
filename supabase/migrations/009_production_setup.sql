-- Production Database Setup and Optimizations
-- Migration: 009_production_setup.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON customers(updated_at);

CREATE INDEX IF NOT EXISTS idx_payslips_customer_id ON payslips(customer_id);
CREATE INDEX IF NOT EXISTS idx_payslips_created_at ON payslips(created_at);
CREATE INDEX IF NOT EXISTS idx_payslips_period ON payslips(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at);

CREATE INDEX IF NOT EXISTS idx_excel_files_customer_id ON customer_excel_files(customer_id);
CREATE INDEX IF NOT EXISTS idx_excel_files_created_at ON customer_excel_files(created_at);

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Create function to log changes
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to main tables
DROP TRIGGER IF EXISTS audit_customers ON customers;
CREATE TRIGGER audit_customers
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_payslips ON payslips;
CREATE TRIGGER audit_payslips
    AFTER INSERT OR UPDATE OR DELETE ON payslips
    FOR EACH ROW EXECUTE FUNCTION log_changes();

DROP TRIGGER IF EXISTS audit_templates ON templates;
CREATE TRIGGER audit_templates
    AFTER INSERT OR UPDATE OR DELETE ON templates
    FOR EACH ROW EXECUTE FUNCTION log_changes();

-- Create backup and maintenance functions
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get database statistics
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    total_size TEXT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        n_tup_ins + n_tup_upd + n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
    FROM pg_stat_user_tables 
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up RLS policies for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Create materialized view for reporting (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS customer_summary AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    COUNT(p.id) as total_payslips,
    MAX(p.created_at) as last_payslip_date,
    COUNT(ef.id) as total_excel_files,
    c.created_at as customer_since
FROM customers c
LEFT JOIN payslips p ON c.id = p.customer_id
LEFT JOIN customer_excel_files ef ON c.id = ef.customer_id
GROUP BY c.id, c.first_name, c.last_name, c.email, c.created_at;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_summary_id ON customer_summary(id);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up automatic statistics collection
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Create backup function
CREATE OR REPLACE FUNCTION create_backup_info()
RETURNS TABLE (
    backup_timestamp TIMESTAMP WITH TIME ZONE,
    database_size TEXT,
    table_count INTEGER,
    total_rows BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        NOW() as backup_timestamp,
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        COUNT(*)::INTEGER as table_count,
        SUM(n_tup_ins + n_tup_upd + n_tup_del) as total_rows
    FROM pg_stat_user_tables;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON customer_summary TO authenticated;

-- Insert migration record
INSERT INTO migrations (version, description, applied_at) 
VALUES ('009', 'Production setup with indexes, audit logs, and optimizations', NOW())
ON CONFLICT (version) DO NOTHING;