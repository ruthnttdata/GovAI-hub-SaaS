
-- =============================================
-- AIGov Evidence Hub - Complete Database Schema
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'viewer');
CREATE TYPE public.risk_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE public.evidence_status AS ENUM ('current', 'obsolete', 'draft');
CREATE TYPE public.use_case_status AS ENUM ('approved', 'in_review', 'pending', 'retired');
CREATE TYPE public.risk_status AS ENUM ('open', 'mitigating', 'closed');
CREATE TYPE public.control_status AS ENUM ('implemented', 'in_progress', 'pending', 'not_applicable');
CREATE TYPE public.action_item_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');

-- 2. PARTNERS (multi-tenant for consultoras)
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#2d9c8f',
  custom_domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sector TEXT,
  country TEXT,
  employee_count INTEGER,
  ai_scope TEXT DEFAULT 'workplace',
  criticality_level TEXT DEFAULT 'medium',
  regulatory_framework TEXT,
  onboarding_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. USER ROLES (separate table per security guidelines)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  UNIQUE (user_id, role, organization_id)
);

-- 6. AI USE CASES
CREATE TABLE public.ai_use_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  owner_name TEXT,
  department TEXT,
  tool_name TEXT,
  provider TEXT,
  data_types TEXT[],
  user_count INTEGER,
  criticality TEXT DEFAULT 'medium',
  impact TEXT,
  model_name TEXT,
  status use_case_status DEFAULT 'pending',
  risk_score INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. RISKS
CREATE TABLE public.risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  impact INTEGER NOT NULL DEFAULT 1 CHECK (impact BETWEEN 1 AND 5),
  probability INTEGER NOT NULL DEFAULT 1 CHECK (probability BETWEEN 1 AND 5),
  score INTEGER GENERATED ALWAYS AS (impact * probability) STORED,
  status risk_status DEFAULT 'open',
  use_case_id UUID REFERENCES public.ai_use_cases(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. CONTROLS
CREATE TABLE public.controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  risk_id UUID REFERENCES public.risks(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status control_status DEFAULT 'pending',
  evidence_ids UUID[],
  owner_name TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. EVIDENCES
CREATE TABLE public.evidences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  file_type TEXT,
  file_url TEXT,
  file_size BIGINT,
  owner_name TEXT,
  version TEXT DEFAULT 'v1.0',
  status evidence_status DEFAULT 'current',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. COMMITTEES
CREATE TABLE public.committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cadence TEXT DEFAULT 'monthly',
  member_count INTEGER DEFAULT 0,
  next_meeting DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. MEETINGS (actas)
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  attendees TEXT[],
  summary TEXT,
  minutes_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. ACTION ITEMS
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  due_date DATE,
  status action_item_status DEFAULT 'todo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. REPORT EXPORTS
CREATE TABLE public.report_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT DEFAULT 'pdf',
  file_url TEXT,
  file_size BIGINT,
  exported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. AUDIT LOG
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. AI TOOLS (registered tools per org)
CREATE TABLE public.ai_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  user_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. GOVERNANCE ROLES (org-level roles like Owner, Security Lead, etc.)
CREATE TABLE public.governance_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  member_count INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. RACI MATRIX
CREATE TABLE public.raci_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  process_name TEXT NOT NULL,
  role_id UUID REFERENCES public.governance_roles(id) ON DELETE CASCADE,
  raci_type TEXT NOT NULL CHECK (raci_type IN ('R', 'A', 'C', 'I')),
  UNIQUE(organization_id, process_name, role_id)
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raci_entries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECURITY DEFINER FUNCTIONS (avoid RLS recursion)
-- =============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_partner_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partner_id FROM public.user_roles WHERE user_id = _user_id AND partner_id IS NOT NULL LIMIT 1
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles in org" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') AND
    organization_id = public.get_user_org_id(auth.uid())
  );

-- USER ROLES
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles in org" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ORGANIZATIONS: members can view their own org
CREATE POLICY "Members can view own org" ON public.organizations
  FOR SELECT USING (id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can update own org" ON public.organizations
  FOR UPDATE USING (
    id = public.get_user_org_id(auth.uid()) AND
    public.has_role(auth.uid(), 'admin')
  );

-- PARTNERS: partner users can view their partner
CREATE POLICY "Partner users can view their partner" ON public.partners
  FOR SELECT USING (id = public.get_user_partner_id(auth.uid()));
CREATE POLICY "Partner admins can manage" ON public.partners
  FOR ALL USING (
    id = public.get_user_partner_id(auth.uid()) AND
    public.has_role(auth.uid(), 'partner')
  );

-- ORG-SCOPED TABLES: same pattern for all
-- AI USE CASES
CREATE POLICY "Org members can view use cases" ON public.ai_use_cases
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage use cases" ON public.ai_use_cases
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- RISKS
CREATE POLICY "Org members can view risks" ON public.risks
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage risks" ON public.risks
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- CONTROLS
CREATE POLICY "Org members can view controls" ON public.controls
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage controls" ON public.controls
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- EVIDENCES
CREATE POLICY "Org members can view evidences" ON public.evidences
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage evidences" ON public.evidences
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- COMMITTEES
CREATE POLICY "Org members can view committees" ON public.committees
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage committees" ON public.committees
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- MEETINGS
CREATE POLICY "Org members can view meetings" ON public.meetings
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage meetings" ON public.meetings
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- ACTION ITEMS
CREATE POLICY "Org members can view action items" ON public.action_items
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage action items" ON public.action_items
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- REPORT EXPORTS
CREATE POLICY "Org members can view reports" ON public.report_exports
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage reports" ON public.report_exports
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- AUDIT LOG (read only for org members)
CREATE POLICY "Org members can view audit log" ON public.audit_log
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "System can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

-- AI TOOLS
CREATE POLICY "Org members can view ai tools" ON public.ai_tools
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage ai tools" ON public.ai_tools
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- GOVERNANCE ROLES
CREATE POLICY "Org members can view governance roles" ON public.governance_roles
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage governance roles" ON public.governance_roles
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- RACI ENTRIES
CREATE POLICY "Org members can view raci" ON public.raci_entries
  FOR SELECT USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage raci" ON public.raci_entries
  FOR ALL USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_use_cases_updated_at BEFORE UPDATE ON public.ai_use_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON public.controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evidences_updated_at BEFORE UPDATE ON public.evidences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_committees_updated_at BEFORE UPDATE ON public.committees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON public.action_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_ai_use_cases_org ON public.ai_use_cases(organization_id);
CREATE INDEX idx_risks_org ON public.risks(organization_id);
CREATE INDEX idx_controls_org ON public.controls(organization_id);
CREATE INDEX idx_controls_risk ON public.controls(risk_id);
CREATE INDEX idx_evidences_org ON public.evidences(organization_id);
CREATE INDEX idx_committees_org ON public.committees(organization_id);
CREATE INDEX idx_meetings_org ON public.meetings(organization_id);
CREATE INDEX idx_action_items_org ON public.action_items(organization_id);
CREATE INDEX idx_audit_log_org ON public.audit_log(organization_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_ai_tools_org ON public.ai_tools(organization_id);
CREATE INDEX idx_governance_roles_org ON public.governance_roles(organization_id);
CREATE INDEX idx_raci_entries_org ON public.raci_entries(organization_id);
