
-- Migration 1: Add trial columns to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_exports_used integer NOT NULL DEFAULT 0;

-- Migration 2: Create export_log table
CREATE TABLE IF NOT EXISTS public.export_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  export_kind text NOT NULL DEFAULT 'evidence_pack',
  evidence_pack_id uuid,
  is_trial_export boolean NOT NULL DEFAULT false,
  stripe_subscription_id text
);

ALTER TABLE public.export_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view export log"
  ON public.export_log FOR SELECT TO authenticated
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Admins can insert export log"
  ON public.export_log FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_org_id(auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'partner'))
  );

-- Migration 3: Atomic trial export RPC
CREATE OR REPLACE FUNCTION public.try_trial_export(_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _row organizations%ROWTYPE;
BEGIN
  SELECT * INTO _row FROM organizations WHERE id = _org_id FOR UPDATE;
  IF _row IS NULL THEN RETURN false; END IF;
  IF _row.trial_ends_at IS NULL OR now() > _row.trial_ends_at THEN RETURN false; END IF;
  IF _row.trial_exports_used >= 1 THEN RETURN false; END IF;
  UPDATE organizations SET trial_exports_used = trial_exports_used + 1 WHERE id = _org_id;
  RETURN true;
END;
$$;

-- Migration 4: Update setup_organization to initialize trial
CREATE OR REPLACE FUNCTION public.setup_organization(
  _org_name text,
  _sector text DEFAULT NULL,
  _country text DEFAULT NULL,
  _employee_count integer DEFAULT NULL,
  _vertical_template text DEFAULT 'general',
  _aims_scope text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _org_id UUID;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  INSERT INTO public.organizations (name, sector, country, employee_count, vertical_template, aims_scope, trial_started_at, trial_ends_at, trial_exports_used)
  VALUES (_org_name, _sector, _country, _employee_count, _vertical_template, _aims_scope, now(), now() + interval '14 days', 0)
  RETURNING id INTO _org_id;

  UPDATE public.profiles SET organization_id = _org_id WHERE user_id = _user_id;

  INSERT INTO public.user_roles (user_id, role, organization_id)
  VALUES (_user_id, 'admin', _org_id)
  ON CONFLICT DO NOTHING;

  RETURN _org_id;
END;
$$;
