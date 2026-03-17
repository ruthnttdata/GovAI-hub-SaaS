
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM (
  'admin','partner','viewer',
  'org_admin','org_editor','org_viewer',
  'partner_admin','partner_consultant','partner_viewer',
  'platform_superadmin','platform_support'
);

CREATE TYPE public.use_case_status AS ENUM ('pending','active','retired','under_review');
CREATE TYPE public.risk_status AS ENUM ('open','mitigated','accepted','closed');
CREATE TYPE public.control_status AS ENUM ('pending','in_progress','implemented','not_applicable');
CREATE TYPE public.req_status AS ENUM ('met','partial','gap');

-- ============ PARTNERS ============
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand_name TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  favicon_url TEXT,
  pdf_cover_logo_url TEXT,
  pdf_footer_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- ============ ORGANIZATIONS ============
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT,
  country TEXT,
  employee_count INT,
  aims_scope TEXT,
  vertical_template TEXT DEFAULT 'general',
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  review_mode TEXT DEFAULT 'suggested',
  review_frequency_days INT DEFAULT 180,
  warning_before_days INT DEFAULT 14,
  critical_overdue_days INT DEFAULT 30,
  export_blocking_enabled BOOLEAN DEFAULT false,
  export_blocking_scope TEXT DEFAULT 'critical_only',
  advanced_mode_enabled BOOLEAN DEFAULT false,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  trial_exports_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ PLANS ============
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT,
  plan_type TEXT DEFAULT 'org',
  price_monthly NUMERIC(10,2),
  price_yearly NUMERIC(10,2),
  max_systems INT,
  max_users INT,
  max_evidences INT,
  max_exports_per_month INT,
  max_clients INT,
  max_consultants INT,
  stripe_price_monthly TEXT,
  stripe_price_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ============ SUBSCRIPTIONS ============
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  tenant_type TEXT DEFAULT 'org',
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============ USAGE METERS ============
CREATE TABLE public.usage_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  tenant_type TEXT DEFAULT 'org',
  period_start DATE NOT NULL,
  period_end DATE,
  systems_count INT DEFAULT 0,
  users_count INT DEFAULT 0,
  evidences_count INT DEFAULT 0,
  exports_count INT DEFAULT 0,
  clients_count INT DEFAULT 0,
  consultants_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.usage_meters ENABLE ROW LEVEL SECURITY;

-- ============ AI USE CASES ============
CREATE TABLE public.ai_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  owner_name TEXT,
  department TEXT,
  tool_name TEXT,
  provider TEXT,
  data_types TEXT[],
  user_count INT,
  criticality TEXT,
  status public.use_case_status DEFAULT 'pending',
  created_by UUID,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_note TEXT,
  iso_clause TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_use_cases ENABLE ROW LEVEL SECURITY;

-- ============ RISKS ============
CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  impact INT DEFAULT 1,
  probability INT DEFAULT 1,
  status public.risk_status DEFAULT 'open',
  iso_clause TEXT,
  annex_control TEXT,
  created_by UUID,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

-- ============ CONTROLS ============
CREATE TABLE public.controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  iso_clause TEXT,
  annex_control TEXT,
  status public.control_status DEFAULT 'pending',
  risk_id UUID REFERENCES public.risks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;

-- ============ EVIDENCES ============
CREATE TABLE public.evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  file_type TEXT,
  file_url TEXT,
  file_size BIGINT,
  owner_name TEXT,
  owner_member_id UUID,
  version TEXT,
  iso_clause TEXT,
  uploaded_by UUID,
  last_reviewed_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;

-- ============ COMMITTEES ============
CREATE TABLE public.committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cadence TEXT,
  member_count INT DEFAULT 0,
  next_meeting TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

-- ============ AI TOOLS ============
CREATE TABLE public.ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  user_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

-- ============ GOVERNANCE ROLES ============
CREATE TABLE public.governance_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_roles ENABLE ROW LEVEL SECURITY;

-- ============ ORG MEMBERS ============
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  job_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- ============ ROLE ASSIGNMENTS ============
CREATE TABLE public.role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.governance_roles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.org_members(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;

-- ============ GOVERNANCE REVIEWS ============
CREATE TABLE public.governance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  review_type TEXT DEFAULT 'management_review',
  notes TEXT,
  decisions TEXT,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_reviews ENABLE ROW LEVEL SECURITY;

-- ============ REPORT EXPORTS ============
CREATE TABLE public.report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  file_url TEXT,
  format TEXT DEFAULT 'pdf',
  created_by UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============ REQUIREMENT EVIDENCE MAP ============
CREATE TABLE public.requirement_evidence_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  requirement_id TEXT NOT NULL,
  requirement_name TEXT NOT NULL,
  iso_clause TEXT NOT NULL,
  status public.req_status DEFAULT 'gap',
  critical BOOLEAN DEFAULT false,
  evidence_id UUID REFERENCES public.evidences(id) ON DELETE SET NULL,
  control_id UUID REFERENCES public.controls(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requirement_evidence_map ENABLE ROW LEVEL SECURITY;

-- ============ SUPPORT SESSIONS ============
CREATE TABLE public.support_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  support_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  is_read_only BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- ============ PLATFORM AUDIT LOG ============
CREATE TABLE public.platform_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_audit_log ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Platform admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_superadmin') OR public.has_role(auth.uid(), 'platform_support'));

-- user_roles
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Platform admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_superadmin'));

-- organizations: members of the org can read, admins can update
CREATE POLICY "Org members read own org" ON public.organizations FOR SELECT TO authenticated
  USING (id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org admins update own org" ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Platform admins manage orgs" ON public.organizations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin'));

-- partners
CREATE POLICY "Anyone authenticated reads partners" ON public.partners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins manage partners" ON public.partners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_superadmin'));

-- plans
CREATE POLICY "Anyone reads active plans" ON public.plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Platform admins manage plans" ON public.plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_superadmin'));

-- subscriptions
CREATE POLICY "Org reads own subs" ON public.subscriptions FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Platform admins manage subs" ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin'));

-- usage_meters
CREATE POLICY "Org reads own meters" ON public.usage_meters FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Platform admins manage meters" ON public.usage_meters FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin'));

-- Macro for org-scoped tables: SELECT/INSERT/UPDATE/DELETE for org members
-- ai_use_cases
CREATE POLICY "Org members read" ON public.ai_use_cases FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.ai_use_cases FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.ai_use_cases FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.ai_use_cases FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- risks
CREATE POLICY "Org members read" ON public.risks FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.risks FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.risks FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.risks FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- controls
CREATE POLICY "Org members read" ON public.controls FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.controls FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.controls FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.controls FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- evidences
CREATE POLICY "Org members read" ON public.evidences FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.evidences FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.evidences FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.evidences FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- committees
CREATE POLICY "Org members read" ON public.committees FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.committees FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.committees FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.committees FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- ai_tools
CREATE POLICY "Org members read" ON public.ai_tools FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.ai_tools FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.ai_tools FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.ai_tools FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- governance_roles
CREATE POLICY "Org members read" ON public.governance_roles FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.governance_roles FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.governance_roles FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.governance_roles FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- org_members
CREATE POLICY "Org members read" ON public.org_members FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.org_members FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.org_members FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.org_members FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- role_assignments
CREATE POLICY "Org members read" ON public.role_assignments FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.role_assignments FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members delete" ON public.role_assignments FOR DELETE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- governance_reviews
CREATE POLICY "Org members read" ON public.governance_reviews FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.governance_reviews FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

-- report_exports
CREATE POLICY "Org members read" ON public.report_exports FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.report_exports FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.report_exports FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- audit_log
CREATE POLICY "Org members read" ON public.audit_log FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

-- requirement_evidence_map
CREATE POLICY "Org members read" ON public.requirement_evidence_map FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()) OR public.has_role(auth.uid(), 'platform_superadmin'));
CREATE POLICY "Org members insert" ON public.requirement_evidence_map FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Org members update" ON public.requirement_evidence_map FOR UPDATE TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));

-- support_sessions
CREATE POLICY "Platform support manages" ON public.support_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'platform_superadmin') OR public.has_role(auth.uid(), 'platform_support'));
CREATE POLICY "Target users read own sessions" ON public.support_sessions FOR SELECT TO authenticated USING (target_user_id = auth.uid());

-- platform_audit_log
CREATE POLICY "Platform admins read" ON public.platform_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_superadmin') OR public.has_role(auth.uid(), 'platform_support'));
CREATE POLICY "Platform admins insert" ON public.platform_audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'platform_superadmin') OR public.has_role(auth.uid(), 'platform_support'));

-- ============ SETUP ORGANIZATION RPC ============
CREATE OR REPLACE FUNCTION public.setup_organization(
  _org_name TEXT,
  _sector TEXT DEFAULT NULL,
  _country TEXT DEFAULT NULL,
  _employee_count INT DEFAULT NULL,
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
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create org
  INSERT INTO public.organizations (name, sector, country, employee_count, vertical_template, aims_scope, trial_started_at, trial_ends_at)
  VALUES (_org_name, _sector, _country, _employee_count, _vertical_template, _aims_scope, now(), now() + interval '14 days')
  RETURNING id INTO _org_id;

  -- Link user to org
  UPDATE public.profiles SET organization_id = _org_id WHERE user_id = _user_id;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'admin') ON CONFLICT DO NOTHING;

  RETURN _org_id;
END;
$$;

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============ UPDATED_AT TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_use_cases_updated_at BEFORE UPDATE ON public.ai_use_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON public.controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evidences_updated_at BEFORE UPDATE ON public.evidences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requirement_evidence_map_updated_at BEFORE UPDATE ON public.requirement_evidence_map FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
