-- Add export status and metadata to report_exports
ALTER TABLE public.report_exports 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS manifest jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Add soft delete columns to key tables
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.ai_use_cases ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.risks ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.controls ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.evidences ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add cancelled grace period tracking
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS grace_ends_at timestamptz;

-- Create partner_templates table for reusable content
CREATE TABLE IF NOT EXISTS public.partner_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  template_type text NOT NULL DEFAULT 'control',
  vertical text DEFAULT 'general',
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_templates ENABLE ROW LEVEL SECURITY;

-- Partner users can view their templates
CREATE POLICY "Partner users view own templates"
ON public.partner_templates
FOR SELECT TO authenticated
USING (partner_id = get_user_partner_id(auth.uid()));

-- Partner admins can manage templates
CREATE POLICY "Partner admins manage templates"
ON public.partner_templates
FOR ALL TO authenticated
USING (partner_id = get_user_partner_id(auth.uid()) AND has_role(auth.uid(), 'partner_admin'::app_role))
WITH CHECK (partner_id = get_user_partner_id(auth.uid()) AND has_role(auth.uid(), 'partner_admin'::app_role));

-- Platform admins can manage all templates
CREATE POLICY "Platform admins manage all templates"
ON public.partner_templates
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'platform_superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'platform_superadmin'::app_role));

-- Create vertical_seed_data table for template preloading
CREATE TABLE IF NOT EXISTS public.vertical_seed_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical text NOT NULL,
  entity_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vertical_seed_data ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read seed data
CREATE POLICY "Authenticated read seed data"
ON public.vertical_seed_data
FOR SELECT TO authenticated
USING (true);

-- Only platform admins can manage seed data
CREATE POLICY "Platform admins manage seed data"
ON public.vertical_seed_data
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'platform_superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'platform_superadmin'::app_role));
