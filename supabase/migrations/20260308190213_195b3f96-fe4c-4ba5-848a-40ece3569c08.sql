
-- Step 2: Schema changes, tables, triggers, storage

-- Add ISO fields to organizations
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS vertical_template TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS aims_scope TEXT,
  ADD COLUMN IF NOT EXISTS iso_readiness_pct INTEGER DEFAULT 0;

-- Add ISO clause references
ALTER TABLE public.risks 
  ADD COLUMN IF NOT EXISTS iso_clause TEXT,
  ADD COLUMN IF NOT EXISTS annex_control TEXT;

ALTER TABLE public.controls 
  ADD COLUMN IF NOT EXISTS iso_clause TEXT,
  ADD COLUMN IF NOT EXISTS annex_control TEXT,
  ADD COLUMN IF NOT EXISTS requirement_id TEXT;

ALTER TABLE public.evidences 
  ADD COLUMN IF NOT EXISTS iso_clause TEXT,
  ADD COLUMN IF NOT EXISTS requirement_id TEXT,
  ADD COLUMN IF NOT EXISTS control_id UUID REFERENCES public.controls(id) ON DELETE SET NULL;

-- Requirement-Evidence mapping table
CREATE TABLE IF NOT EXISTS public.requirement_evidence_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requirement_id TEXT NOT NULL,
  iso_clause TEXT NOT NULL,
  requirement_name TEXT NOT NULL,
  control_id UUID REFERENCES public.controls(id) ON DELETE SET NULL,
  evidence_id UUID REFERENCES public.evidences(id) ON DELETE SET NULL,
  owner_name TEXT,
  status TEXT DEFAULT 'gap' CHECK (status IN ('met', 'partial', 'gap', 'not_applicable')),
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.requirement_evidence_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view req map" ON public.requirement_evidence_map
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Editors can manage req map" ON public.requirement_evidence_map
  FOR ALL TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

CREATE INDEX IF NOT EXISTS idx_req_map_org ON public.requirement_evidence_map(organization_id);
CREATE INDEX IF NOT EXISTS idx_req_map_req ON public.requirement_evidence_map(requirement_id);

CREATE TRIGGER update_req_map_updated_at BEFORE UPDATE ON public.requirement_evidence_map 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Partner plan limits
CREATE TABLE IF NOT EXISTS public.partner_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL DEFAULT 'starter' CHECK (plan_tier IN ('starter', 'professional', 'enterprise')),
  max_clients INTEGER DEFAULT 3,
  max_exports_per_month INTEGER DEFAULT 5,
  max_consultant_seats INTEGER DEFAULT 2,
  current_period_exports INTEGER DEFAULT 0,
  period_start DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partner view own plan" ON public.partner_plans
  FOR SELECT TO authenticated USING (partner_id = public.get_user_partner_id(auth.uid()));

CREATE TRIGGER update_partner_plans_updated_at BEFORE UPDATE ON public.partner_plans 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Partner branding fields
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS portal_name TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS pdf_cover_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_footer_text TEXT;

-- Audit log trigger for critical entities
CREATE OR REPLACE FUNCTION public.log_audit_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    organization_id, user_id, action, entity_type, entity_id, details
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'ts', now())
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER audit_ai_use_cases AFTER INSERT OR UPDATE OR DELETE ON public.ai_use_cases
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
CREATE TRIGGER audit_risks AFTER INSERT OR UPDATE OR DELETE ON public.risks
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
CREATE TRIGGER audit_controls AFTER INSERT OR UPDATE OR DELETE ON public.controls
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
CREATE TRIGGER audit_evidences AFTER INSERT OR UPDATE OR DELETE ON public.evidences
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();
CREATE TRIGGER audit_report_exports AFTER INSERT OR UPDATE OR DELETE ON public.report_exports
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- Storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('evidence-files', 'evidence-files', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Org members can view evidence files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'evidence-files');
CREATE POLICY "Admins can upload evidence files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidence-files');
CREATE POLICY "Admins can delete evidence files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'evidence-files');

-- Update setup_organization
CREATE OR REPLACE FUNCTION public.setup_organization(
  _org_name TEXT,
  _sector TEXT DEFAULT NULL,
  _country TEXT DEFAULT NULL,
  _employee_count INTEGER DEFAULT NULL,
  _vertical_template TEXT DEFAULT 'general',
  _aims_scope TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  INSERT INTO public.organizations (name, sector, country, employee_count, vertical_template, aims_scope)
  VALUES (_org_name, _sector, _country, _employee_count, _vertical_template, _aims_scope)
  RETURNING id INTO _org_id;

  UPDATE public.profiles SET organization_id = _org_id WHERE user_id = _user_id;

  INSERT INTO public.user_roles (user_id, role, organization_id)
  VALUES (_user_id, 'admin', _org_id)
  ON CONFLICT DO NOTHING;

  RETURN _org_id;
END;
$$;
