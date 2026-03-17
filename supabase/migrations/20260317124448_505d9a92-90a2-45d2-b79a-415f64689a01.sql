
-- Add missing columns to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS legal_company_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS trade_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS compliance_contact_name TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS compliance_contact_email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS iso_readiness_pct INT DEFAULT 0;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS employee_range TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_address_line1 TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_address_line2 TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_city TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_region TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_postcode TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS billing_country TEXT;

-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'es';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Madrid';

-- Add missing columns to subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS notes_internal TEXT;

-- Add missing columns to report_exports
ALTER TABLE public.report_exports ADD COLUMN IF NOT EXISTS name TEXT;

-- Add missing column to risks (computed score)
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS score INT GENERATED ALWAYS AS (impact * probability) STORED;
