# Universal Payslip Platform - Admin Dashboard Setup Guide

## 🚀 Production-Ready Admin Dashboard & Backend

This comprehensive guide will help you set up and deploy the Universal Payslip Platform with a complete admin dashboard, authentication system, and employee management capabilities.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Frontend Dependencies](#frontend-dependencies)
7. [First Admin Account](#first-admin-account)
8. [Testing & Verification](#testing--verification)
9. [Production Deployment](#production-deployment)
10. [Security Checklist](#security-checklist)

## 🏗️ Architecture Overview

### Tech Stack
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Frontend**: React 19 + TypeScript + Styled Components
- **Authentication**: Supabase Auth with RLS policies
- **Admin Features**: Employee management, audit logs, system settings

### User Roles & Permissions
- **Admin (CEO)**: Full system access, create/manage employees, system configuration
- **Employee**: Access only to personal data and payslips (owner_id = auth.uid())
- **No Public Signup**: Login-only interface for all users

## 🔧 Supabase Setup

### 1. Create New Project
```bash
# Visit https://supabase.com/dashboard
# Create new project with:
# - Project name: "Universal Payslip Platform"
# - Database password: Generate strong password
# - Region: Choose closest to your users
```

### 2. Get Project Configuration
```bash
# From Supabase Dashboard > Settings > API
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## ⚙️ Environment Configuration

### Frontend Environment (.env)
Create `payslip-web/.env`:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Environment
```bash
# In Supabase Dashboard > Settings > Environment variables
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 💾 Database Migration

### Method 1: Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard > SQL Editor**
2. Run the migration files in order:

#### Step 1: Create Schema
```sql
-- Copy and paste contents of: supabase/migrations/001_create_admin_schema.sql
-- This creates all tables, indexes, triggers (without default settings to avoid FK errors)
```

#### Step 2: Setup RLS Policies
```sql
-- Copy and paste contents of: supabase/migrations/002_create_rls_policies.sql
-- This enables Row Level Security and creates all access policies
```

#### Step 3: Insert Default Settings (Run AFTER creating first admin)
```sql
-- Copy and paste contents of: supabase/migrations/003_insert_default_settings.sql
-- This inserts default admin settings with proper foreign key references
```

#### Step 4: Test Your Setup (Optional but Recommended)
```sql
-- Copy and paste contents of: supabase/migrations/000_test_migrations.sql
-- This validates that all tables, functions, and policies are correctly set up
```

### Method 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## 🚀 Edge Functions Deployment

### Deploy Admin Functions
```bash
# Deploy user creation function
supabase functions deploy admin-create-user --project-ref your-project-id

# Deploy password reset function  
supabase functions deploy admin-reset-password --project-ref your-project-id
```

### Alternative: Manual Upload
1. Go to **Supabase Dashboard > Edge Functions**
2. Create new function: `admin-create-user`
3. Copy code from: `supabase/functions/admin-create-user/index.ts`
4. Create new function: `admin-reset-password`
5. Copy code from: `supabase/functions/admin-reset-password/index.ts`

## 📦 Frontend Dependencies

### Install Dependencies
```bash
cd payslip-web
npm install

# Verify all packages are installed:
# @supabase/supabase-js@^2.56.1
# react@^19.1.1
# styled-components@^6.1.19
# typescript@^4.9.5
```

### Start Development Server
```bash
npm start
# Application will be available at http://localhost:3000
```

## 👑 First Admin Account

### Method 1: Automatic Setup (Recommended)
1. Start the application: `npm start`
2. Visit `http://localhost:3000`
3. You'll see the login screen
4. Create the first user via Supabase Auth manually (see Method 2)
5. Then promote to admin using the promotion function

### Method 2: Manual Admin Creation
```sql
-- Step 1: Go to Supabase Dashboard > Authentication > Users
-- Click "Add user" and create with:
-- Email: admin@yourcompany.com
-- Password: Generate secure password
-- Confirm email: Enable

-- Step 2: Run this SQL to promote to admin and insert default settings:
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@yourcompany.com';
    
    -- Promote to admin
    UPDATE public.profiles 
    SET role = 'admin', status = 'active' 
    WHERE id = admin_id;
    
    -- Insert default settings
    PERFORM insert_default_admin_settings();
END $$;
```

### Method 3: SQL Direct Insert
```sql
-- Run in Supabase SQL Editor
DO $$
DECLARE
    admin_id uuid;
BEGIN
    -- Create auth user (you'll need to adapt this for your auth system)
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        gen_random_uuid(),
        'admin@yourcompany.com',
        crypt('your-secure-password', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"role": "admin", "full_name": "System Administrator"}'::jsonb
    ) RETURNING id INTO admin_id;
    
    -- Create profile
    INSERT INTO public.profiles (
        id, email, full_name, role, status
    ) VALUES (
        admin_id,
        'admin@yourcompany.com',
        'System Administrator',
        'admin',
        'active'
    );
END $$;
```

## ✅ Testing & Verification

### 1. Admin Login Test
- Visit application
- Login with admin credentials
- Verify you see the Admin Dashboard (🔧 icon)

### 2. Employee Management Test
- Click "Employee Management" tab
- Try creating a new employee
- Verify employee receives login credentials
- Test employee activation/deactivation

### 3. Audit Logs Test
- Perform various actions (create/edit/delete)
- Check "Audit Logs" tab
- Verify all actions are logged with user details

### 4. RLS Policy Test
```sql
-- Test admin can see all employees
SELECT * FROM employees; -- Should return all records

-- Test employee can only see own data
-- (Run this as a regular employee user)
SELECT * FROM employees; -- Should return only their record
```

## 🌐 Production Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
# Build for production
npm run build

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Or deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### Environment Variables for Production
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-production-anon-key
```

### Domain Configuration
- Update Supabase Auth settings with your domain
- Configure CORS settings in Supabase
- Update redirect URLs for authentication

## 🔒 Security Checklist

### Database Security
- ✅ RLS enabled on all tables
- ✅ Admin-only functions use service role key
- ✅ Audit logging for all critical operations
- ✅ Input validation on all Edge Functions

### Authentication Security
- ✅ No public signup (admin-only user creation)
- ✅ Strong password requirements
- ✅ Email confirmation required
- ✅ Session management via Supabase

### Application Security
- ✅ HTTPS only (enforced by hosting platform)
- ✅ Environment variables for sensitive data
- ✅ Client-side authorization checks
- ✅ Error boundary for graceful error handling

### Database Security
- ✅ **Sensitive Field Protection**: Employees cannot modify salary, employee_id, bank_details, tax_info
- ✅ **Trigger-based Security**: Database-level protection for sensitive fields
- ✅ **Admin-only Operations**: Only admins can modify sensitive employee data
- ✅ **Audit Trail**: All changes to sensitive data are logged automatically

## 🔧 Customization

### Adding New Admin Features
1. Create new component in `src/components/admin/`
2. Add to `AdminDashboard.tsx` navigation
3. Update database schema if needed
4. Add appropriate RLS policies

### Modifying Employee Fields
1. Update `employees` table schema
2. Modify `EmployeeManagement.tsx` component
3. Update TypeScript interfaces
4. Test with existing data

### Custom Payslip Templates
1. Extend `payslip_templates` table
2. Create template builder components
3. Add validation logic
4. Test template rendering

## 📞 Support & Troubleshooting

### Common Issues

**Login not working:**
- Check Supabase URL and anon key
- Verify user exists in auth.users
- Check profile table has matching record

**Admin dashboard not showing:**
- Verify user role is 'admin' in profiles table
- Check user status is 'active'
- Clear browser cache and retry

**Employee creation failing:**
- Check Edge Functions are deployed
- Verify service role key is set
- Check function logs in Supabase

**Database connection issues:**
- Verify environment variables are set
- Check Supabase project is not paused
- Confirm database migrations ran successfully

### Getting Help
- Check Supabase documentation: https://supabase.com/docs
- Review error logs in browser developer tools
- Check Supabase dashboard logs and metrics
- Verify all migration scripts ran successfully

### Common Migration Errors

**Error: "syntax error at or near 'desc'"**
- ✅ **Fixed**: Updated migration file to use `description_text` instead of reserved keyword `desc`
- **Solution**: Use the corrected migration files provided

**Error: "violates foreign key constraint admin_settings_updated_by_fkey"**
- ✅ **Fixed**: Removed default settings insertion from schema creation
- **Solution**: Run migrations in the correct order (schema → policies → settings)

**Error: "function insert_default_admin_settings() does not exist"**
- ✅ **Fixed**: Separated function definitions and usage into proper migration order
- **Solution**: Run all migration files in numerical order (001 → 002 → 003)

**Error: "missing FROM-clause entry for table 'old'"**
- ✅ **Fixed**: Replaced invalid RLS policy with proper trigger-based sensitive field protection
- **Solution**: Use the corrected migration files (OLD/NEW only work in triggers, not RLS policies)

**Error: "operator does not exist: uuid = text"**
- ✅ **Fixed**: Added explicit type casting `auth.uid()::uuid` to match UUID column types
- **Solution**: Use the corrected migration files with proper type casting

### Migration File Summary

- **`000_test_migrations.sql`** - Validation script (run last to test setup)
- **`001_create_admin_schema.sql`** - Core database schema ✅ **Fixed FK issues**
- **`002_create_rls_policies.sql`** - Security policies ✅ **Fixed syntax errors**
- **`003_insert_default_settings.sql`** - Default admin settings
- **`004_fix_existing_settings.sql`** - Repair script for existing installations

---

## 🎉 You're Ready!

Your Universal Payslip Platform admin dashboard is now fully configured with:

- ✅ Secure admin authentication system
- ✅ Complete employee management interface
- ✅ Row-level security implementation
- ✅ Audit logging for compliance
- ✅ Production-ready architecture
- ✅ Scalable database design

**First Steps After Setup:**
1. Login with your admin account
2. Create your first employee
3. Test the employee login experience
4. Configure company settings
5. Set up your payslip templates

**Next Steps:**
- Integrate with your existing payroll systems
- Configure automated backups
- Set up monitoring and alerts
- Train your team on the admin interface