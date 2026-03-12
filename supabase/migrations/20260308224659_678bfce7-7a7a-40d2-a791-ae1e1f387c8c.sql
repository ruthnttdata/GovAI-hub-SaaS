ALTER TABLE public.subscriptions ADD COLUMN stripe_customer_id text;
ALTER TABLE public.subscriptions ADD COLUMN stripe_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN stripe_price_id text;
ALTER TABLE public.subscriptions ADD COLUMN cancel_at_period_end boolean NOT NULL DEFAULT false;
ALTER TABLE public.subscriptions ADD COLUMN current_period_end timestamp with time zone;