
-- Add tax_id and billing address to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS billing_address_line1 text,
  ADD COLUMN IF NOT EXISTS billing_address_line2 text,
  ADD COLUMN IF NOT EXISTS billing_city text,
  ADD COLUMN IF NOT EXISTS billing_postcode text,
  ADD COLUMN IF NOT EXISTS billing_region text,
  ADD COLUMN IF NOT EXISTS billing_country text;

-- Create office_locations table for multiple offices
CREATE TABLE public.office_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address_line1 text,
  address_line2 text,
  city text,
  postcode text,
  region text,
  country text,
  is_headquarters boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_office_locations_updated_at
  BEFORE UPDATE ON public.office_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: org members can view, admins can manage
CREATE POLICY "Org members can view offices"
  ON public.office_locations FOR SELECT TO authenticated
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Admins can insert offices"
  ON public.office_locations FOR INSERT TO authenticated
  WITH CHECK (organization_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'partner'::app_role)));

CREATE POLICY "Admins can update offices"
  ON public.office_locations FOR UPDATE TO authenticated
  USING (organization_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'partner'::app_role)));

CREATE POLICY "Admins can delete offices"
  ON public.office_locations FOR DELETE TO authenticated
  USING (organization_id = get_user_org_id(auth.uid()) AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'partner'::app_role)));
