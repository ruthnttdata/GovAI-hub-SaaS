import { useOrganization } from "@/hooks/useGovernanceData";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export interface TrialState {
  /** Active paid subscription exists */
  hasActiveSubscription: boolean;
  /** Trial is running (no active sub, within 14 days) */
  isTrialActive: boolean;
  /** Trial expired without upgrading */
  isTrialExpired: boolean;
  /** Days remaining in trial */
  trialDaysLeft: number | null;
  /** Number of trial exports used (0 or 1) */
  trialExportsUsed: number;
  /** Max trial exports allowed */
  trialExportsMax: number;
  /** Whether the user can export under trial rules */
  canExportTrial: boolean;
  /** If export is blocked by trial, the reason string (Spanish) */
  exportBlockReason: string | null;
  /** Loading state */
  loading: boolean;
}

export function useTrialStatus(): TrialState {
  const { data: org, isLoading: orgLoading } = useOrganization();
  const sub = useSubscriptionLimits();

  const hasActiveSubscription = sub.status === "active";

  const trialEndsAt = (org as any)?.trial_ends_at as string | null;
  const trialStartedAt = (org as any)?.trial_started_at as string | null;
  const trialExportsUsed: number = (org as any)?.trial_exports_used ?? 0;
  const trialExportsMax = 1;

  let trialDaysLeft: number | null = null;
  let isTrialActive = false;
  let isTrialExpired = false;

  if (!hasActiveSubscription && trialEndsAt) {
    const diff = new Date(trialEndsAt).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    if (diff > 0) {
      isTrialActive = true;
    } else {
      isTrialExpired = true;
    }
  }

  // If no trial was ever started and no subscription, treat as expired
  if (!hasActiveSubscription && !trialStartedAt) {
    isTrialExpired = false; // No trial to expire — org creation should have set it
  }

  const canExportTrial = isTrialActive && trialExportsUsed < trialExportsMax;

  let exportBlockReason: string | null = null;
  if (!hasActiveSubscription) {
    if (isTrialExpired) {
      exportBlockReason = "Tu periodo de prueba ha expirado. Activa un plan para seguir exportando.";
    } else if (isTrialActive && trialExportsUsed >= trialExportsMax) {
      exportBlockReason = "Ya usaste tu exportación gratuita de trial. Activa un plan para más exportaciones.";
    }
  }

  return {
    hasActiveSubscription,
    isTrialActive,
    isTrialExpired,
    trialDaysLeft,
    trialExportsUsed,
    trialExportsMax,
    canExportTrial,
    exportBlockReason,
    loading: orgLoading || sub.loading,
  };
}
