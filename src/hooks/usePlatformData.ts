import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Partners
export function usePlatformPartners() {
  return useQuery({
    queryKey: ["platform-partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Organizations (all, for platform admin)
export function usePlatformOrgs() {
  return useQuery({
    queryKey: ["platform-orgs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Plans
export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("plan_type", { ascending: true }).order("price_monthly", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: any) => {
      if (plan.id) {
        const { error } = await supabase.from("plans").update(plan).eq("id", plan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("plans").insert(plan);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

// Subscriptions
export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscriptions").select("*, plans(name, tier, plan_type)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sub: any) => {
      if (sub.id) {
        const { error } = await supabase.from("subscriptions").update(sub).eq("id", sub.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").insert(sub);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subscriptions"] }),
  });
}

// Usage meters
export function useUsageMeters() {
  return useQuery({
    queryKey: ["usage-meters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usage_meters").select("*").order("period_start", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// Platform audit log
export function usePlatformAuditLog() {
  return useQuery({
    queryKey: ["platform-audit-log"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_audit_log").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
}

// Support sessions
export function useSupportSessions() {
  return useQuery({
    queryKey: ["support-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("support_sessions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSupportSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (session: { target_user_id: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("support_sessions").insert({
        support_user_id: user.id,
        target_user_id: session.target_user_id,
        reason: session.reason,
        is_read_only: true,
      });
      if (error) throw error;
      // Also log to platform audit
      await supabase.from("platform_audit_log").insert({
        user_id: user.id,
        action: "impersonation_start",
        entity_type: "support_session",
        details: { target_user_id: session.target_user_id, reason: session.reason },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-sessions"] });
      qc.invalidateQueries({ queryKey: ["platform-audit-log"] });
    },
  });
}

export function useLogPlatformAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { action: string; entity_type: string; entity_id?: string; details?: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("platform_audit_log").insert({
        user_id: user?.id,
        ...entry,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-audit-log"] }),
  });
}
