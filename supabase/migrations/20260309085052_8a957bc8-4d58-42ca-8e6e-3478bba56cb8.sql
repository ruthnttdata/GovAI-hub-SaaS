
-- Storage RLS policies for evidence-files bucket
CREATE POLICY "Org members can upload evidence files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'evidence-files' AND
  (storage.foldername(name))[1] = (get_user_org_id(auth.uid()))::text
);

CREATE POLICY "Org members can read evidence files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'evidence-files' AND
  (storage.foldername(name))[1] = (get_user_org_id(auth.uid()))::text
);
