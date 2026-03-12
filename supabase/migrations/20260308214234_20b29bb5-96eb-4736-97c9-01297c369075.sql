
ALTER TABLE public.partners
ADD COLUMN IF NOT EXISTS brand_name text,
ADD COLUMN IF NOT EXISTS accent_color text,
ADD COLUMN IF NOT EXISTS favicon_url text;
