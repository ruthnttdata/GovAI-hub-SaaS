import { useMemo } from "react";
import { useOrganization, useAiUseCases, useRisks, useEvidences } from "@/hooks/useGovernanceData";
import { useReadinessKPI, type RequirementRow } from "@/hooks/useReadinessKPI";

export interface ReviewItem {
  id: string;
  name: string;
  type: "system" | "risk" | "evidence";
  dueDate: string | null;
  isOverdue: boolean;
  isCriticalOverdue: boolean;
  daysOverdue: number;
  daysUntilDue: number | null;
  link: string;
  isoClause?: string;
}

export interface ReviewStatus {
  reviewMode: "suggested" | "mandatory";
  exportBlockingEnabled: boolean;
  exportBlockingScope: "critical_only" | "any_overdue";
  overdueItems: ReviewItem[];
  criticalOverdueItems: ReviewItem[];
  upcomingItems: ReviewItem[];
  hasOverdueCritical: boolean;
  canExport: boolean;
  blockReason: string | null;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Critical clauses for V1
const CRITICAL_CLAUSES = ["5", "6", "7", "8"];

export function useReviewStatus(): ReviewStatus {
  const { data: org } = useOrganization();
  const { data: useCases = [] } = useAiUseCases();
  const { data: risks = [] } = useRisks();
  const { data: evidences = [] } = useEvidences();

  const reviewMode = (org?.review_mode ?? "suggested") as "suggested" | "mandatory";
  const warningDays = org?.warning_before_days ?? 14;
  const criticalOverdueDays = org?.critical_overdue_days ?? 30;
  const exportBlockingEnabled = reviewMode === "mandatory" ? (org?.export_blocking_enabled ?? true) : false;
  const exportBlockingScope = (org?.export_blocking_scope ?? "critical_only") as "critical_only" | "any_overdue";

  const items = useMemo(() => {
    const all: ReviewItem[] = [];

    useCases.forEach((uc) => {
      if (uc.next_review_at) {
        const days = daysUntil(uc.next_review_at);
        const isOverdue = (days ?? 0) < 0;
        const daysOver = isOverdue ? Math.abs(days ?? 0) : 0;
        all.push({
          id: uc.id, name: uc.name, type: "system",
          dueDate: uc.next_review_at, isOverdue,
          isCriticalOverdue: isOverdue && daysOver >= criticalOverdueDays,
          daysOverdue: daysOver, daysUntilDue: days,
          link: "/inventory?filter=due_review", isoClause: "8",
        });
      }
    });

    risks.forEach((r) => {
      if (r.next_review_at) {
        const days = daysUntil(r.next_review_at);
        const isOverdue = (days ?? 0) < 0;
        const daysOver = isOverdue ? Math.abs(days ?? 0) : 0;
        const clause = r.iso_clause?.split(".")[0] ?? "6";
        all.push({
          id: r.id, name: r.name, type: "risk",
          dueDate: r.next_review_at, isOverdue,
          isCriticalOverdue: isOverdue && (daysOver >= criticalOverdueDays || CRITICAL_CLAUSES.includes(clause)),
          daysOverdue: daysOver, daysUntilDue: days,
          link: "/risks?filter=due_review", isoClause: r.iso_clause ?? undefined,
        });
      }
    });

    evidences.forEach((e) => {
      if (e.review_due_at) {
        const days = daysUntil(e.review_due_at);
        const isOverdue = (days ?? 0) < 0;
        const daysOver = isOverdue ? Math.abs(days ?? 0) : 0;
        const clause = e.iso_clause?.split(".")[0] ?? "7";
        all.push({
          id: e.id, name: e.name, type: "evidence",
          dueDate: e.review_due_at, isOverdue,
          isCriticalOverdue: isOverdue && (daysOver >= criticalOverdueDays || CRITICAL_CLAUSES.includes(clause)),
          daysOverdue: daysOver, daysUntilDue: days,
          link: "/evidence?filter=due_review", isoClause: e.iso_clause ?? undefined,
        });
      }
    });

    return all;
  }, [useCases, risks, evidences, criticalOverdueDays]);

  const overdueItems = items.filter((i) => i.isOverdue).sort((a, b) => b.daysOverdue - a.daysOverdue);
  const criticalOverdueItems = overdueItems.filter((i) => i.isCriticalOverdue);
  const upcomingItems = items
    .filter((i) => !i.isOverdue && i.daysUntilDue !== null && i.daysUntilDue <= warningDays)
    .sort((a, b) => (a.daysUntilDue ?? 0) - (b.daysUntilDue ?? 0));

  const hasOverdueCritical = criticalOverdueItems.length > 0;

  // Export blocking logic
  let canExport = true;
  let blockReason: string | null = null;

  if (reviewMode === "mandatory" && exportBlockingEnabled) {
    if (exportBlockingScope === "critical_only" && criticalOverdueItems.length > 0) {
      canExport = false;
      blockReason = `${criticalOverdueItems.length} elemento(s) con revisión vencida crítica (>${criticalOverdueDays} días). Revísalos antes de exportar.`;
    } else if (exportBlockingScope === "any_overdue" && overdueItems.length > 0) {
      canExport = false;
      blockReason = `${overdueItems.length} elemento(s) con revisión vencida. Revísalos antes de exportar.`;
    }
  }

  return {
    reviewMode, exportBlockingEnabled, exportBlockingScope,
    overdueItems, criticalOverdueItems, upcomingItems,
    hasOverdueCritical, canExport, blockReason,
  };
}
