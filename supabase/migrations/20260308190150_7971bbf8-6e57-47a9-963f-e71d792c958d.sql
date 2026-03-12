
-- Step 1: Only add enum values (must be committed separately)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'org_viewer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_consultant';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_viewer';
