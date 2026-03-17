import { Brain, ShieldAlert, FileCheck, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAiUseCases, useRisks, useControls, useEvidences } from "@/hooks/useGovernanceData";
import { useReadinessKPI } from "@/hooks/useReadinessKPI";

interface ControlCard {
  title: string;
  icon: React.ElementType;
  count: number;
  items: { id: string; name: string; detail: string }[];
  link: string;
  color: string;
  emptyText: string;
}

export function OperationalControl() {
  const { data: useCases = [] } = useAiUseCases();
  const { data: risks = [] } = useRisks();
  const { data: controls = [] } = useControls();
  const { data: evidences = [] } = useEvidences();
  const kpi = useReadinessKPI();

  const pendingSystems = useCases.filter((u) => u.status === "pending" || u.status === "under_review");
  const dueRisks = risks.filter((r) => {
    if (!r.next_review_at) return r.status === "open" && (r.score ?? 0) >= 9;
    return new Date(r.next_review_at).getTime() <= Date.now() + 14 * 86400000;
  });
  const gapControls = controls.filter((c) => c.status === "pending" || c.status === "in_progress");
  const dueEvidences = evidences.filter((e) => {
    if (!e.review_due_at) return false;
    return new Date(e.review_due_at).getTime() <= Date.now() + 30 * 86400000;
  });

  const cards: ControlCard[] = [
    {
      title: "Sistemas pendientes de revisión",
      icon: Brain, count: pendingSystems.length,
      items: pendingSystems.slice(0, 5).map((u) => ({ id: u.id, name: u.name, detail: u.status ?? "" })),
      link: "/app/inventory?filter=due_review", color: "text-accent",
      emptyText: "Todos los sistemas están revisados",
    },
    {
      title: "Riesgos por reevaluar",
      icon: ShieldAlert, count: dueRisks.length,
      items: dueRisks.slice(0, 5).map((r) => ({ id: r.id, name: r.name, detail: `Score: ${r.score}` })),
      link: "/app/risks?filter=due_review", color: "text-destructive",
      emptyText: "Sin riesgos pendientes de revisión",
    },
    {
      title: "Controles en progreso",
      icon: CheckCircle2, count: gapControls.length,
      items: gapControls.slice(0, 5).map((c) => ({ id: c.id, name: c.name, detail: c.status ?? "" })),
      link: "/app/risks", color: "text-warning",
      emptyText: "Todos los controles implementados",
    },
    {
      title: "Evidencias por revisar / próximas a caducar",
      icon: FileCheck, count: dueEvidences.length,
      items: dueEvidences.slice(0, 5).map((e) => ({
        id: e.id, name: e.name,
        detail: e.review_due_at ? new Date(e.review_due_at).toLocaleDateString("es") : "",
      })),
      link: "/app/evidence?filter=due_review", color: "text-accent",
      emptyText: "Todas las evidencias al día",
    },
  ];

  // Add critical gaps card if any
  const criticalGapCount = kpi.health.criticalOverdue;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Control Operativo</CardTitle>
        <CardDescription>
          Elementos que requieren atención para mantener la gobernanza activa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Critical overdue banner */}
        {criticalGapCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-xs font-medium text-destructive">
              {criticalGapCount} elemento(s) con overdue crítico para auditoría
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((card) => (
            <div key={card.title} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-sm font-medium">{card.title}</span>
                </div>
                <Badge variant={card.count > 0 ? "destructive" : "secondary"} className="text-[10px]">
                  {card.count}
                </Badge>
              </div>
              {card.count === 0 ? (
                <p className="text-xs text-muted-foreground">{card.emptyText}</p>
              ) : (
                <div className="space-y-1">
                  {card.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="truncate">{item.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{item.detail}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link to={card.link}>
                <Button variant="ghost" size="sm" className="text-xs gap-1 w-full justify-center mt-1">
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
