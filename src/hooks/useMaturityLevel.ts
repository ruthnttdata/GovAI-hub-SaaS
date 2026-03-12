import { useMemo } from "react";
import { useAiUseCases, useRisks, useControls, useEvidences, useOrganization, useReportExports } from "@/hooks/useGovernanceData";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";

export type MaturityLevel = 1 | 2 | 3;

export interface MaturityState {
  level: MaturityLevel;
  canAccessLevel: (target: MaturityLevel) => boolean;
  levelLabel: string;
  nextLevelHint: string | null;
  counts: {
    systems: number;
    risks: number;
    evidences: number;
    controls: number;
    exports: number;
  };
}

export function useMaturityLevel(): MaturityState {
  const { data: org } = useOrganization();
  const { data: useCases = [] } = useAiUseCases();
  const { data: risks = [] } = useRisks();
  const { data: controls = [] } = useControls();
  const { data: evidences = [] } = useEvidences();
  const { data: exports = [] } = useReportExports();
  const sub = useSubscriptionLimits();

  const counts = useMemo(() => ({
    systems: useCases.length,
    risks: risks.length,
    evidences: evidences.length,
    controls: controls.length,
    exports: exports.filter((e: any) => e.status === "ready").length,
  }), [useCases, risks, evidences, controls, exports]);

  const planTier = sub.planName?.toLowerCase() ?? "";
  const isEnterprise = planTier.includes("enterprise");
  const isPartner = planTier.includes("partner") || planTier.includes("scale") || planTier.includes("growth");
  const isProfessional = planTier.includes("professional");
  const advancedMode = org?.advanced_mode_enabled === true;

  const level: MaturityLevel = useMemo(() => {
    // Level 3: Enterprise/Partner plan OR advanced mode enabled
    if (isEnterprise || isPartner || advancedMode) return 3;

    // Level 2: Professional plan OR data-driven thresholds
    const dataLevel2 =
      (counts.systems >= 3 && counts.risks >= 5 && counts.evidences >= 5) ||
      counts.exports >= 1;

    if (isProfessional || dataLevel2) return 2;

    return 1;
  }, [isEnterprise, isPartner, advancedMode, isProfessional, counts]);

  const canAccessLevel = (target: MaturityLevel): boolean => {
    if (target <= level) return true;
    // Starter can see limited Level 2 read-only if they have exports
    if (target === 2 && counts.exports >= 1) return true;
    return false;
  };

  const labels: Record<MaturityLevel, string> = {
    1: "Básico",
    2: "Operativo",
    3: "Avanzado",
  };

  const nextLevelHint: string | null = useMemo(() => {
    if (level >= 3) return null;
    if (level === 1) {
      const missing: string[] = [];
      if (counts.systems < 3) missing.push(`${3 - counts.systems} sistemas IA más`);
      if (counts.risks < 5) missing.push(`${5 - counts.risks} riesgos más`);
      if (counts.evidences < 5) missing.push(`${5 - counts.evidences} evidencias más`);
      return missing.length > 0
        ? `Añade ${missing.join(", ")} para desbloquear el nivel Operativo.`
        : "Genera tu primer Evidence Pack para desbloquear el nivel Operativo.";
    }
    return "Activa el modo Avanzado en Ajustes o actualiza a Enterprise.";
  }, [level, counts]);

  return {
    level,
    canAccessLevel,
    levelLabel: labels[level],
    nextLevelHint,
    counts,
  };
}
