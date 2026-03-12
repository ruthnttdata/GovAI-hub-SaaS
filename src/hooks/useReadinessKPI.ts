import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAiUseCases, useRisks, useControls, useEvidences, useReportExports } from "@/hooks/useGovernanceData";
import { ISO_42001_CLAUSES } from "@/lib/iso42001";

export interface RequirementRow {
  id: string;
  requirement_id: string;
  requirement_name: string;
  iso_clause: string;
  status: string | null;
  critical: boolean;
  evidence_id: string | null;
  control_id: string | null;
}

export interface ClauseReadiness {
  clause: string;
  title: string;
  totalReqs: number;
  metCount: number;
  partialCount: number;
  gapCount: number;
  score: number; // 0-100
  status: "green" | "amber" | "red";
}

export interface OperationalHealth {
  systemsDueReview: number;
  risksDueReview: number;
  evidencesDueReview: number;
  controlsInProgress: number;
  criticalOverdue: number;
}

export interface ReadinessKPI {
  // Global readiness (null = N/A, no requirement map data)
  globalScore: number | null;
  metCount: number;
  partialCount: number;
  gapCount: number;
  totalRequirements: number;
  // Per-clause
  clauseReadiness: ClauseReadiness[];
  // Operational health
  health: OperationalHealth;
  // Evidence Pack health
  exportsUsed: number;
  exportsMax: number | null;
  lastExportStatus: string | null;
  lastExportDate: string | null;
  // Raw requirement map
  requirements: RequirementRow[];
}

function useRequirementMap() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["requirement_evidence_map", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requirement_evidence_map")
        .select("*")
        .order("iso_clause", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RequirementRow[];
    },
    enabled: !!orgId,
  });
}

export function useReadinessKPI(
  warningDays: number = 14,
  criticalOverdueDays: number = 30
): ReadinessKPI {
  const { data: reqMap = [] } = useRequirementMap();
  const { data: useCases = [] } = useAiUseCases();
  const { data: risks = [] } = useRisks();
  const { data: controls = [] } = useControls();
  const { data: evidences = [] } = useEvidences();
  const { data: exports = [] } = useReportExports();

  return useMemo(() => {
    // ========== Global readiness from requirement_evidence_map ==========
    const totalRequirements = reqMap.length;
    let metCount = 0, partialCount = 0, gapCount = 0;
    let scoreSum = 0;

    reqMap.forEach((r) => {
      const s = r.status ?? "gap";
      if (s === "met") { metCount++; scoreSum += 1; }
      else if (s === "partial") { partialCount++; scoreSum += 0.5; }
      else { gapCount++; }
    });

    // If no requirement_evidence_map rows, score is null (N/A)
    let globalScore: number | null = null;
    if (totalRequirements > 0) {
      globalScore = Math.round((scoreSum / totalRequirements) * 100);
    }

    // ========== Clause readiness ==========
    const clauseReadiness: ClauseReadiness[] = ISO_42001_CLAUSES.map((clause) => {
      const clauseReqs = reqMap.filter((r) => r.iso_clause.startsWith(clause.clause));
      const total = clauseReqs.length || clause.subclauses.length;
      let met = 0, partial = 0, gap = 0, sum = 0;

      if (clauseReqs.length > 0) {
        clauseReqs.forEach((r) => {
          const s = r.status ?? "gap";
          if (s === "met") { met++; sum += 1; }
          else if (s === "partial") { partial++; sum += 0.5; }
          else { gap++; }
        });
      } else {
        // No data: all gaps, score stays 0
        gap = total;
      }

      const score = total > 0 ? Math.round((sum / total) * 100) : 0;
      const status: "green" | "amber" | "red" = score >= 80 ? "green" : score >= 50 ? "amber" : "red";

      return { clause: clause.clause, title: clause.title, totalReqs: total, metCount: met, partialCount: partial, gapCount: gap, score, status };
    });

    // ========== Operational Health ==========
    const now = Date.now();
    const dueThreshold = now + warningDays * 86400000;
    const criticalThreshold = now - criticalOverdueDays * 86400000;

    const systemsDueReview = useCases.filter((u) => {
      const d = u.next_review_at ? new Date(u.next_review_at).getTime() : null;
      return d !== null && d <= dueThreshold;
    }).length;

    const risksDueReview = risks.filter((r) => {
      const d = r.next_review_at ? new Date(r.next_review_at).getTime() : null;
      return d !== null && d <= dueThreshold;
    }).length;

    const evidencesDueReview = evidences.filter((e) => {
      const d = e.review_due_at ? new Date(e.review_due_at).getTime() : null;
      return d !== null && d <= dueThreshold;
    }).length;

    const controlsInProgress = controls.filter((c) => c.status === "in_progress" || c.status === "pending").length;

    // Critical overdue: items overdue by more than critical_overdue_days
    let criticalOverdue = 0;
    useCases.forEach((u) => {
      const d = u.next_review_at ? new Date(u.next_review_at).getTime() : null;
      if (d !== null && d < criticalThreshold) criticalOverdue++;
    });
    risks.forEach((r) => {
      const d = r.next_review_at ? new Date(r.next_review_at).getTime() : null;
      if (d !== null && d < criticalThreshold) criticalOverdue++;
    });
    evidences.forEach((e) => {
      const d = e.review_due_at ? new Date(e.review_due_at).getTime() : null;
      if (d !== null && d < criticalThreshold) criticalOverdue++;
    });

    // ========== Evidence Pack Health ==========
    const lastExport = exports[0] ?? null;

    return {
      globalScore,
      metCount,
      partialCount,
      gapCount,
      totalRequirements,
      clauseReadiness,
      health: { systemsDueReview, risksDueReview, evidencesDueReview, controlsInProgress, criticalOverdue },
      exportsUsed: exports.length, // approximation; real value from usage_meters
      exportsMax: null, // filled from subscription limits externally
      lastExportStatus: lastExport?.status ?? null,
      lastExportDate: lastExport?.completed_at ?? lastExport?.created_at ?? null,
      requirements: reqMap,
    };
  }, [reqMap, useCases, risks, controls, evidences, exports, warningDays, criticalOverdueDays]);
}
