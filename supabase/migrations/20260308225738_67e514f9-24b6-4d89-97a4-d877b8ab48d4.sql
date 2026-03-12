
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  message text,
  source text DEFAULT 'contact',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit lead" ON public.leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated can submit lead" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Platform admins view leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'platform_superadmin'));
