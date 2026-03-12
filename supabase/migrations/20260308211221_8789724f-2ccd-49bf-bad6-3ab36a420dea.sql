
-- Add new profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Europe/Madrid';

-- Add new organization columns
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS legal_company_name text,
  ADD COLUMN IF NOT EXISTS trade_name text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS compliance_contact_name text,
  ADD COLUMN IF NOT EXISTS compliance_contact_email text,
  ADD COLUMN IF NOT EXISTS employee_range text DEFAULT '1-10';

-- Create billing_profiles table
CREATE TABLE public.billing_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  legal_name text,
  vat_id text,
  billing_email text,
  billing_address_line1 text,
  billing_address_line2 text,
  city text,
  postcode text,
  region text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: org_admin can read/write billing; platform users can read
CREATE POLICY "Org admin can view billing"
  ON public.billing_profiles FOR SELECT TO authenticated
  USING (
    (organization_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
    OR has_role(auth.uid(), 'platform_superadmin'::app_role)
    OR has_role(auth.uid(), 'platform_support'::app_role)
  );

CREATE POLICY "Org admin can insert billing"
  ON public.billing_profiles FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Org admin can update billing"
  ON public.billing_profiles FOR UPDATE TO authenticated
  USING (
    (organization_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
    OR has_role(auth.uid(), 'platform_superadmin'::app_role)
  );

-- updated_at trigger for billing_profiles
CREATE TRIGGER update_billing_profiles_updated_at
  BEFORE UPDATE ON public.billing_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
