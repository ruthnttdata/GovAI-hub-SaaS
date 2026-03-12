
-- Add new review config fields to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS critical_overdue_days integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS export_blocking_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS export_blocking_scope text NOT NULL DEFAULT 'critical_only';

-- Add critical flag to requirement_evidence_map
ALTER TABLE public.requirement_evidence_map
  ADD COLUMN IF NOT EXISTS critical boolean NOT NULL DEFAULT false;

-- Mark critical requirements (scope, policy, roles, risk treatment, evidence index)
UPDATE public.requirement_evidence_map
SET critical = true
WHERE requirement_id IN ('4.1', '4.3', '5.2', '5.3', '6.1.3', '7.5', '9.3')
   OR iso_clause IN ('5', '6', '7', '8');
