import { CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAiUseCases, useRisks, useControls, useEvidences, useOrganization } from "@/hooks/useGovernanceData";

const steps = [
  { key: "scope", label: "Definir alcance del AIMS", link: "/app/onboarding", clause: "4" },
  { key: "systems", label: "Registrar al menos 1 sistema IA", link: "/app/inventory", clause: "8" },
  { key: "risks", label: "Registrar al menos 1 riesgo", link: "/app/risks", clause: "6" },
  { key: "controls", label: "Implementar al menos 1 control", link: "/app/risks", clause: "6" },
  { key: "evidence", label: "Subir al menos 1 evidencia", link: "/app/evidence", clause: "7" },
];

export function ActivationChecklist() {
  const { data: org } = useOrganization();
  const { data: useCases = [] } = useAiUseCases();
  const { data: risks = [] } = useRisks();
  const { data: controls = [] } = useControls();
  const { data: evidences = [] } = useEvidences();

  const done: Record<string, boolean> = {
    scope: !!org?.aims_scope,
    systems: useCases.length > 0,
    risks: risks.length > 0,
    controls: controls.filter(c => c.status === "implemented").length > 0,
    evidence: evidences.length > 0,
  };

  const completedCount = Object.values(done).filter(Boolean).length;
  const total = steps.length;

  if (completedCount === total) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          Checklist de activación
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount}/{total} completados
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step) => (
            <Link
              key={step.key}
              to={step.link}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/50 transition-colors"
            >
              {done[step.key] ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className={`text-sm ${done[step.key] ? "text-muted-foreground line-through" : "font-medium"}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">Cláusula {step.clause}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
