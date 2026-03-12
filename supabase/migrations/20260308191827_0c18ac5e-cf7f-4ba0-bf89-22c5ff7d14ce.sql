
-- Plans table (global)
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan_type text NOT NULL DEFAULT 'sme',
  tier text NOT NULL DEFAULT 'starter',
  max_systems integer DEFAULT 5,
  max_users integer DEFAULT 3,
  max_evidences integer DEFAULT 20,
  max_exports_per_month integer DEFAULT 5,
  max_clients integer,
  max_consultants integer,
  feature_flags jsonb DEFAULT '{}'::jsonb,
  price_monthly numeric DEFAULT 0,
  price_annual numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins manage plans" ON public.plans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_superadmin'));

CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Subscriptions table (per tenant)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_type text NOT NULL DEFAULT 'org',
  tenant_id uuid NOT NULL,
  plan_id uuid REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamptz,
  period_start timestamptz DEFAULT now(),
  period_end timestamptz,
  notes_internal text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins manage subscriptions" ON public.subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_superadmin'));

CREATE POLICY "Platform support view subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'platform_support'));

CREATE POLICY "Tenant view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (
    (tenant_type = 'org' AND tenant_id = public.get_user_org_id(auth.uid()))
    OR (tenant_type = 'partner' AND tenant_id = public.get_user_partner_id(auth.uid()))
  );

-- Usage meters
CREATE TABLE public.usage_meters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_type text NOT NULL DEFAULT 'org',
  tenant_id uuid NOT NULL,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  period_end date NOT NULL DEFAULT (CURRENT_DATE + interval '1 month')::date,
  systems_count integer DEFAULT 0,
  users_count integer DEFAULT 0,
  evidences_count integer DEFAULT 0,
  exports_count integer DEFAULT 0,
  clients_count integer DEFAULT 0,
  consultants_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.usage_meters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins manage usage" ON public.usage_meters
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_superadmin'));

CREATE POLICY "Platform support view usage" ON public.usage_meters
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'platform_support'));

CREATE POLICY "Tenant view own usage" ON public.usage_meters
  FOR SELECT TO authenticated
  USING (
    (tenant_type = 'org' AND tenant_id = public.get_user_org_id(auth.uid()))
    OR (tenant_type = 'partner' AND tenant_id = public.get_user_partner_id(auth.uid()))
  );

-- Platform audit log
CREATE TABLE public.platform_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins view platform audit" ON public.platform_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin'));

CREATE POLICY "Platform insert audit" ON public.platform_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'platform_superadmin') OR public.has_role(auth.uid(), 'platform_support'));

-- Support sessions (impersonation)
CREATE TABLE public.support_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  reason text NOT NULL,
  is_read_only boolean DEFAULT true,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour'),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform manage support sessions" ON public.support_sessions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_superadmin') OR public.has_role(auth.uid(), 'platform_support'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_superadmin') OR public.has_role(auth.uid(), 'platform_support'));

-- Triggers
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_meters_updated_at BEFORE UPDATE ON public.usage_meters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to check platform roles
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('platform_superadmin', 'platform_support')
  )
$$;
