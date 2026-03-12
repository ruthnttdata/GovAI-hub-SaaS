import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlanLimits {
  max_systems: number | null;
  max_users: number | null;
  max_evidences: number | null;
  max_exports_per_month: number | null;
  max_clients: number | null;
  max_consultants: number | null;
}

export interface UsageCounts {
  systems_count: number;
  users_count: number;
  evidences_count: number;
  exports_count: number;
  clients_count: number;
  consultants_count: number;
}

export type LimitStatus = "ok" | "warning" | "blocked";

export interface LimitCheck {
  status: LimitStatus;
  current: number;
  max: number | null;
  pct: number;
}

export type SubscriptionStatus = "trialing" | "active" | "suspended" | "cancelled" | "none";

export interface SubscriptionState {
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  isSuspended: boolean;
  isReadOnly: boolean;
  isPartnerManaged: boolean;
  planName: string | null;
  limits: PlanLimits;
  usage: UsageCounts;
  checkLimit: (resource: keyof PlanLimits) => LimitCheck;
  canCreate: (resource: keyof PlanLimits) => boolean;
  loading: boolean;
}

const DEFAULT_LIMITS: PlanLimits = {
  max_systems: 5,
  max_users: 3,
  max_evidences: 20,
  max_exports_per_month: 5,
  max_clients: null,
  max_consultants: null,
};

const DEFAULT_USAGE: UsageCounts = {
  systems_count: 0,
  users_count: 0,
  evidences_count: 0,
  exports_count: 0,
  clients_count: 0,
  consultants_count: 0,
};

const RESOURCE_TO_USAGE: Record<keyof PlanLimits, keyof UsageCounts> = {
  max_systems: "systems_count",
  max_users: "users_count",
  max_evidences: "evidences_count",
  max_exports_per_month: "exports_count",
  max_clients: "clients_count",
  max_consultants: "consultants_count",
};

export function useSubscriptionLimits(): SubscriptionState {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const { data, isLoading } = useQuery({
    queryKey: ["subscription-limits", orgId],
    queryFn: async () => {
      if (!orgId) return null;

      // Get subscription with plan
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("tenant_id", orgId)
        .eq("tenant_type", "org")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get usage meters for current period
      const { data: meter } = await supabase
        .from("usage_meters")
        .select("*")
        .eq("tenant_id", orgId)
        .eq("tenant_type", "org")
        .order("period_start", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check if org is partner-managed
      const { data: org } = await supabase
        .from("organizations")
        .select("partner_id")
        .eq("id", orgId)
        .single();

      return { sub, meter, isPartnerManaged: !!org?.partner_id };
    },
    enabled: !!orgId,
    staleTime: 30_000,
  });

  const sub = data?.sub;
  const meter = data?.meter;
  const plan = sub?.plans as any;

  // Map status
  let status: SubscriptionStatus = "none";
  if (sub) {
    const raw = sub.status;
    if (raw === "trial" || raw === "trialing") status = "trialing";
    else if (raw === "active") status = "active";
    else if (raw === "suspended") status = "suspended";
    else if (raw === "cancelled") status = "cancelled";
    else status = raw as SubscriptionStatus;
  }

  const trialEndsAt = sub?.trial_ends_at ?? null;
  let trialDaysLeft: number | null = null;
  if (trialEndsAt) {
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const isSuspended = status === "suspended";
  const isReadOnly = isSuspended || status === "cancelled";

  const limits: PlanLimits = plan
    ? {
        max_systems: plan.max_systems,
        max_users: plan.max_users,
        max_evidences: plan.max_evidences,
        max_exports_per_month: plan.max_exports_per_month,
        max_clients: plan.max_clients,
        max_consultants: plan.max_consultants,
      }
    : DEFAULT_LIMITS;

  const usage: UsageCounts = meter
    ? {
        systems_count: meter.systems_count ?? 0,
        users_count: meter.users_count ?? 0,
        evidences_count: meter.evidences_count ?? 0,
        exports_count: meter.exports_count ?? 0,
        clients_count: meter.clients_count ?? 0,
        consultants_count: meter.consultants_count ?? 0,
      }
    : DEFAULT_USAGE;

  const checkLimit = (resource: keyof PlanLimits): LimitCheck => {
    const max = limits[resource];
    const current = usage[RESOURCE_TO_USAGE[resource]];
    if (max === null || max === undefined) return { status: "ok", current, max: null, pct: 0 };
    const pct = max > 0 ? Math.round((current / max) * 100) : 0;
    const limitStatus: LimitStatus = current >= max ? "blocked" : pct >= 80 ? "warning" : "ok";
    return { status: limitStatus, current, max, pct };
  };

  const canCreate = (resource: keyof PlanLimits): boolean => {
    if (isReadOnly) return false;
    const check = checkLimit(resource);
    return check.status !== "blocked";
  };

  return {
    status,
    trialEndsAt,
    trialDaysLeft,
    isSuspended,
    isReadOnly,
    isPartnerManaged: data?.isPartnerManaged ?? false,
    planName: plan?.name ?? null,
    limits,
    usage,
    checkLimit,
    canCreate,
    loading: isLoading,
  };
}
