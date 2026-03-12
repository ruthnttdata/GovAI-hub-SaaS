-- Allow org admins to view support sessions targeting users in their organization
CREATE POLICY "Org admins can view support sessions for their users"
ON public.support_sessions
FOR SELECT
TO authenticated
USING (
  target_user_id IN (
    SELECT p.user_id FROM public.profiles p
    WHERE p.organization_id = get_user_org_id(auth.uid())
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);
