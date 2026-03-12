import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No auth" }), { status: 401, headers: corsHeaders });

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub as string;
    const email = claimsData.claims.email as string;

    const { price_id, org_id } = await req.json();
    if (!price_id || !org_id) {
      return new Response(JSON.stringify({ error: "price_id and org_id required" }), { status: 400, headers: corsHeaders });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Verify user is admin of org
    const { data: role } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("organization_id", org_id)
      .in("role", ["admin", "org_admin"])
      .maybeSingle();

    if (!role) {
      return new Response(JSON.stringify({ error: "Not authorized" }), { status: 403, headers: corsHeaders });
    }

    // Check if org is partner-managed
    const { data: org } = await admin
      .from("organizations")
      .select("partner_id")
      .eq("id", org_id)
      .single();

    if (org?.partner_id) {
      return new Response(JSON.stringify({ error: "Partner-managed orgs cannot self-serve. Contact your partner." }), { status: 403, headers: corsHeaders });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check existing customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email, metadata: { org_id, user_id: userId } });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://id-preview--53a9fc93-2c67-4077-90af-2dd9e4d693c0.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/plan?checkout=success`,
      cancel_url: `${origin}/plan?checkout=cancel`,
      metadata: { org_id },
      subscription_data: { metadata: { org_id } },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
