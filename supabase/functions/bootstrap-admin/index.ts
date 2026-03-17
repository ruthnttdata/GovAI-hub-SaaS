import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminEmailsRaw = Deno.env.get("PLATFORM_ADMIN_EMAILS") || "";

    const allowlist = adminEmailsRaw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowlist.length === 0) {
      return new Response(JSON.stringify({ bootstrapped: false, reason: "no_allowlist" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get calling user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth header" }), { status: 401, headers: corsHeaders });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
    }

    const email = user.email?.toLowerCase();
    if (!email || !allowlist.includes(email)) {
      return new Response(JSON.stringify({ bootstrapped: false, reason: "not_in_allowlist" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to check and assign
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Check if already has the role
    const { data: existing } = await admin
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "platform_superadmin")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ bootstrapped: false, reason: "already_assigned" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign role
    const { error: insertError } = await admin.from("user_roles").insert({
      user_id: user.id,
      role: "platform_superadmin",
    });

    if (insertError) throw insertError;

    // Audit log
    await admin.from("platform_audit_log").insert({
      user_id: user.id,
      action: "superadmin_bootstrap",
      entity_type: "user_role",
      entity_id: user.id,
      details: { email, method: "allowlist_auto" },
    });

    return new Response(JSON.stringify({ bootstrapped: true, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[bootstrap-admin] Unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
