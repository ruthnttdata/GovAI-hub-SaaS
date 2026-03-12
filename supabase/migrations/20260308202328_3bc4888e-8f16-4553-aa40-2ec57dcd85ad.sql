
-- Add review settings to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS review_mode text NOT NULL DEFAULT 'suggested',
  ADD COLUMN IF NOT EXISTS review_frequency_days integer NOT NULL DEFAULT 90,
  ADD COLUMN IF NOT EXISTS warning_before_days integer NOT NULL DEFAULT 14,
  ADD COLUMN IF NOT EXISTS advanced_mode_enabled boolean NOT NULL DEFAULT false;

-- Add review fields to ai_use_cases
ALTER TABLE public.ai_use_cases
  ADD COLUMN IF NOT EXISTS next_review_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_reviewed_at timestamp with time zone;

-- Add review fields to risks
ALTER TABLE public.risks
  ADD COLUMN IF NOT EXISTS next_review_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_reviewed_at timestamp with time zone;

-- Add review fields to evidences
ALTER TABLE public.evidences
  ADD COLUMN IF NOT EXISTS review_due_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_reviewed_at timestamp with time zone;

-- Create governance_reviews table
CREATE TABLE IF NOT EXISTS public.governance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  review_type text NOT NULL DEFAULT 'management_review',
  title text NOT NULL,
  review_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  decisions text,
  action_items_count integer DEFAULT 0,
  attendees text[],
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view governance reviews"
  ON public.governance_reviews FOR SELECT
  USING (organization_id = get_user_org_id(auth.uid()));

CREATE POLICY "Admins can insert governance reviews"
  ON public.governance_reviews FOR INSERT
  WITH CHECK (
    organization_id = get_user_org_id(auth.uid())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'partner'::app_role))
  );

CREATE POLICY "Admins can update governance reviews"
  ON public.governance_reviews FOR UPDATE
  USING (
    organization_id = get_user_org_id(auth.uid())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'partner'::app_role))
  );

CREATE POLICY "Admins can delete governance reviews"
  ON public.governance_reviews FOR DELETE
  USING (
    organization_id = get_user_org_id(auth.uid())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'partner'::app_role))
  );
