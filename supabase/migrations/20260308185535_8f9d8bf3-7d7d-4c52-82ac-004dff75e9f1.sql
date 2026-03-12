
-- =============================================
-- FIX: Recreate all RLS policies as PERMISSIVE
-- All policies were created as RESTRICTIVE which blocks all access
-- =============================================

-- DROP ALL EXISTING POLICIES
-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in org" ON public.profiles;

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in org" ON public.user_roles;

-- organizations
DROP POLICY IF EXISTS "Members can view own org" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update own org" ON public.organizations;

-- partners
DROP POLICY IF EXISTS "Partner users can view their partner" ON public.partners;
DROP POLICY IF EXISTS "Partner admins can manage" ON public.partners;

-- ai_use_cases
DROP POLICY IF EXISTS "Org members can view use cases" ON public.ai_use_cases;
DROP POLICY IF EXISTS "Admins can manage use cases" ON public.ai_use_cases;

-- risks
DROP POLICY IF EXISTS "Org members can view risks" ON public.risks;
DROP POLICY IF EXISTS "Admins can manage risks" ON public.risks;

-- controls
DROP POLICY IF EXISTS "Org members can view controls" ON public.controls;
DROP POLICY IF EXISTS "Admins can manage controls" ON public.controls;

-- evidences
DROP POLICY IF EXISTS "Org members can view evidences" ON public.evidences;
DROP POLICY IF EXISTS "Admins can manage evidences" ON public.evidences;

-- committees
DROP POLICY IF EXISTS "Org members can view committees" ON public.committees;
DROP POLICY IF EXISTS "Admins can manage committees" ON public.committees;

-- meetings
DROP POLICY IF EXISTS "Org members can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins can manage meetings" ON public.meetings;

-- action_items
DROP POLICY IF EXISTS "Org members can view action items" ON public.action_items;
DROP POLICY IF EXISTS "Admins can manage action items" ON public.action_items;

-- report_exports
DROP POLICY IF EXISTS "Org members can view reports" ON public.report_exports;
DROP POLICY IF EXISTS "Admins can manage reports" ON public.report_exports;

-- audit_log
DROP POLICY IF EXISTS "Org members can view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;

-- ai_tools
DROP POLICY IF EXISTS "Org members can view ai tools" ON public.ai_tools;
DROP POLICY IF EXISTS "Admins can manage ai tools" ON public.ai_tools;

-- governance_roles
DROP POLICY IF EXISTS "Org members can view governance roles" ON public.governance_roles;
DROP POLICY IF EXISTS "Admins can manage governance roles" ON public.governance_roles;

-- raci_entries
DROP POLICY IF EXISTS "Org members can view raci" ON public.raci_entries;
DROP POLICY IF EXISTS "Admins can manage raci" ON public.raci_entries;

-- =============================================
-- RECREATE ALL POLICIES AS PERMISSIVE
-- =============================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles in org" ON public.profiles
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') AND
    organization_id = public.get_user_org_id(auth.uid())
  );
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- USER ROLES
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles in org" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ORGANIZATIONS
CREATE POLICY "Members can view own org" ON public.organizations
  FOR SELECT TO authenticated USING (id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can update own org" ON public.organizations
  FOR UPDATE TO authenticated USING (
    id = public.get_user_org_id(auth.uid()) AND
    public.has_role(auth.uid(), 'admin')
  );
-- Allow insert for authenticated users (needed for onboarding)
CREATE POLICY "Authenticated users can create org" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (true);

-- PARTNERS
CREATE POLICY "Partner users can view their partner" ON public.partners
  FOR SELECT TO authenticated USING (id = public.get_user_partner_id(auth.uid()));
CREATE POLICY "Partner admins can manage" ON public.partners
  FOR ALL TO authenticated USING (
    id = public.get_user_partner_id(auth.uid()) AND
    public.has_role(auth.uid(), 'partner')
  );

-- ORG-SCOPED TABLES (same pattern)
-- AI USE CASES
CREATE POLICY "Org members can view use cases" ON public.ai_use_cases
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can manage use cases" ON public.ai_use_cases
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update use cases" ON public.ai_use_cases
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete use cases" ON public.ai_use_cases
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- RISKS
CREATE POLICY "Org members can view risks" ON public.risks
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert risks" ON public.risks
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update risks" ON public.risks
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete risks" ON public.risks
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- CONTROLS
CREATE POLICY "Org members can view controls" ON public.controls
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert controls" ON public.controls
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update controls" ON public.controls
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete controls" ON public.controls
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- EVIDENCES
CREATE POLICY "Org members can view evidences" ON public.evidences
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert evidences" ON public.evidences
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update evidences" ON public.evidences
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete evidences" ON public.evidences
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- COMMITTEES
CREATE POLICY "Org members can view committees" ON public.committees
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert committees" ON public.committees
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update committees" ON public.committees
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete committees" ON public.committees
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- MEETINGS
CREATE POLICY "Org members can view meetings" ON public.meetings
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert meetings" ON public.meetings
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update meetings" ON public.meetings
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete meetings" ON public.meetings
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- ACTION ITEMS
CREATE POLICY "Org members can view action items" ON public.action_items
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert action items" ON public.action_items
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update action items" ON public.action_items
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete action items" ON public.action_items
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- REPORT EXPORTS
CREATE POLICY "Org members can view reports" ON public.report_exports
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert reports" ON public.report_exports
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- AUDIT LOG
CREATE POLICY "Org members can view audit log" ON public.audit_log
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Authenticated can insert audit log" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

-- AI TOOLS
CREATE POLICY "Org members can view ai tools" ON public.ai_tools
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert ai tools" ON public.ai_tools
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update ai tools" ON public.ai_tools
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete ai tools" ON public.ai_tools
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- GOVERNANCE ROLES
CREATE POLICY "Org members can view governance roles" ON public.governance_roles
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert governance roles" ON public.governance_roles
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update governance roles" ON public.governance_roles
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete governance roles" ON public.governance_roles
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- RACI ENTRIES
CREATE POLICY "Org members can view raci" ON public.raci_entries
  FOR SELECT TO authenticated USING (organization_id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Admins can insert raci" ON public.raci_entries
  FOR INSERT TO authenticated WITH CHECK (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can update raci" ON public.raci_entries
  FOR UPDATE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );
CREATE POLICY "Admins can delete raci" ON public.raci_entries
  FOR DELETE TO authenticated USING (
    organization_id = public.get_user_org_id(auth.uid()) AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'partner'))
  );

-- =============================================
-- ONBOARDING: Function to setup org + admin role
-- This bypasses RLS for the initial setup
-- =============================================

CREATE OR REPLACE FUNCTION public.setup_organization(
  _org_name TEXT,
  _sector TEXT DEFAULT NULL,
  _country TEXT DEFAULT NULL,
  _employee_count INTEGER DEFAULT NULL
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

  -- Create organization
  INSERT INTO public.organizations (name, sector, country, employee_count)
  VALUES (_org_name, _sector, _country, _employee_count)
  RETURNING id INTO _org_id;

  -- Link user profile to org
  UPDATE public.profiles
  SET organization_id = _org_id
  WHERE user_id = _user_id;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role, organization_id)
  VALUES (_user_id, 'admin', _org_id)
  ON CONFLICT DO NOTHING;

  RETURN _org_id;
END;
$$;
