
-- Fix the overly permissive org insert policy
-- Replace with a check that the user has no org yet (first-time onboarding only)
DROP POLICY IF EXISTS "Authenticated users can create org" ON public.organizations;

-- The setup_organization function is SECURITY DEFINER so it bypasses RLS.
-- No direct INSERT policy needed on organizations table.
