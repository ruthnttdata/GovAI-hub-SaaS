import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map Stripe price IDs to our plan names
const PRICE_TO_PLAN: Record<string, string> = {
  "price_1T8pqt4BZWR0QeSaNI4bx1rT": "starter_monthly",
  "price_1T8prL4BZWR0QeSaZ3TOwCtv": "starter_yearly",
  "price_1T8q5c4BZWR0QeSaL8G0ZqsI": "pro_monthly",
  "price_1T8q604BZWR0QeSaIpXTw52w": "pro_yearly",
};

async function resolvePlanId(admin: any, priceId: string | null | undefined): Promise<string | null> {
  if (!priceId) return null;
  const planKey = PRICE_TO_PLAN[priceId];
  if (!planKey) return null;
  const tier = planKey.startsWith("pro") ? "pro" : "starter";
  const { data: plan } = await admin
    .from("plans")
    .select("id")
    .eq("tier", tier)
    .eq("plan_type", "sme")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  return plan?.id ?? null;
}

async function auditLog(admin: any, orgId: string, action: string, details: Record<string, any>) {
  await admin.from("audit_log").insert({
    organization_id: orgId,
    action,
    entity_type: "subscription",
    details,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey) return new Response("STRIPE_SECRET_KEY not set", { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  if (!webhookSecret || !sig) {
    console.error("[STRIPE-WEBHOOK] Missing webhook secret or signature");
    return new Response(JSON.stringify({ error: "Webhook not configured" }), { status: 500 });
  }

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.org_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!orgId || !subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const planId = await resolvePlanId(admin, priceId);

        // Upsert subscription
        const { data: existingSub } = await admin
          .from("subscriptions")
          .select("id")
          .eq("tenant_id", orgId)
          .eq("tenant_type", "org")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const subData = {
          status: "active",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId || null,
          plan_id: planId,
          period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        };

        if (existingSub) {
          await admin.from("subscriptions").update(subData).eq("id", existingSub.id);
        } else {
          await admin.from("subscriptions").insert({
            ...subData,
            tenant_id: orgId,
            tenant_type: "org",
          });
        }

        await auditLog(admin, orgId, "subscription_activated", {
          stripe_subscription_id: subscriptionId,
          price_id: priceId,
          plan_id: planId,
        });

        console.log(`[STRIPE-WEBHOOK] checkout.session.completed for org ${orgId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const planId = await resolvePlanId(admin, priceId);

        // Get previous price for audit
        const previousAttributes = (event.data as any).previous_attributes;
        const oldPriceId = previousAttributes?.items?.data?.[0]?.price?.id ?? null;

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "suspended",
          canceled: "cancelled",
          unpaid: "suspended",
          trialing: "trialing",
        };

        await admin
          .from("subscriptions")
          .update({
            status: statusMap[subscription.status] || subscription.status,
            stripe_price_id: priceId || null,
            plan_id: planId,
            period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("tenant_id", orgId)
          .eq("tenant_type", "org")
          .not("stripe_subscription_id", "is", null);

        await auditLog(admin, orgId, "subscription_changed", {
          stripe_subscription_id: subscription.id,
          old_price_id: oldPriceId,
          new_price_id: priceId,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        console.log(`[STRIPE-WEBHOOK] subscription.updated for org ${orgId}, status: ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.org_id;
        if (!orgId) break;

        const graceEnd = new Date();
        graceEnd.setDate(graceEnd.getDate() + 7);

        await admin
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancel_at_period_end: false,
            grace_ends_at: graceEnd.toISOString(),
          })
          .eq("tenant_id", orgId)
          .eq("tenant_type", "org")
          .not("stripe_subscription_id", "is", null);

        await auditLog(admin, orgId, "subscription_canceled", {
          stripe_subscription_id: subscription.id,
          grace_ends_at: graceEnd.toISOString(),
        });

        console.log(`[STRIPE-WEBHOOK] subscription.deleted for org ${orgId}, grace until ${graceEnd.toISOString()}`);
        break;
      }

      default:
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[STRIPE-WEBHOOK] Error processing ${event.type}:`, err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
