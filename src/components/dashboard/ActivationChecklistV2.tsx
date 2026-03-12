import { CheckCircle2, Circle, ArrowRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAiUseCases, useRisks, useEvidences, useReportExports } from "@/hooks/useGovernanceData";

const TARGETS = { systems: 3, risks: 5, evidences: 5, pack: 1 };

export function ActivationChecklistV2() {
  const { data: useCases = [] } = useAiUseCases();
  const { data: risks = [] } = useRisks();
  const { data: evidences = [] } = useEvidences();
  const { data: exports = [] } = useReportExports();

  const readyExports = exports.filter((e) => e.status === "ready").length;

  const steps = [
    {
      key: "systems", label: "Registra 3 sistemas de IA",
      current: useCases.length, target: TARGETS.systems,
      done: useCases.length >= TARGETS.systems,
      link: "/app/inventory", clause: "8",
      why: "Necesitas un inventario completo para la cláusula 8.",
    },
    {
      key: "risks", label: "Evalúa 5 riesgos",
      current: risks.length, target: TARGETS.risks,
      done: risks.length >= TARGETS.risks,
      link: "/app/risks", clause: "6",
      why: "Los riesgos son la base del tratamiento (cláusula 6).",
    },
    {
      key: "evidences", label: "Sube 5 evidencias",
      current: evidences.length, target: TARGETS.evidences,
      done: evidences.length >= TARGETS.evidences,
      link: "/app/evidence", clause: "7",
      why: "Las evidencias demuestran cumplimiento ante auditor.",
    },
    {
      key: "pack", label: "Genera tu primer Evidence Pack",
      current: readyExports, target: TARGETS.pack,
      done: readyExports >= TARGETS.pack,
      link: "/app/reports", clause: "9",
      why: "El Evidence Pack es tu entregable principal de auditoría.",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = Math.round((completedCount / total) * 100);

  if (completedCount === total) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Primeros pasos</CardTitle>
            <CardDescription>
              Completa estos pasos para activar el sistema y generar tu primer Evidence Pack.
            </CardDescription>
          </div>
          <span className="text-sm font-semibold text-accent">{completedCount}/{total}</span>
        </div>
        <Progress value={pct} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {steps.map((step) => (
            <Link
              key={step.key}
              to={step.link}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/50 transition-colors group"
            >
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${step.done ? "text-muted-foreground line-through" : "font-medium"}`}>
                    {step.label}
                  </span>
                  {!step.done && (
                    <span className="text-xs text-muted-foreground">
                      {step.current}/{step.target}
                    </span>
                  )}
                </div>
                {!step.done && (
                  <p className="text-[11px] text-muted-foreground">{step.why}</p>
                )}
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>

        {/* CTA: load vertical template */}
        <div className="pt-3 border-t mt-3">
          <Link to="/app/onboarding">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 w-full text-muted-foreground hover:text-foreground">
              <Layers className="h-3.5 w-3.5" /> Cargar plantilla por vertical
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
