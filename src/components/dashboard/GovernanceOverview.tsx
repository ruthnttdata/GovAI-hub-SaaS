import { Shield, FileCheck, Calendar, History, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useReportExports, useCommittees } from "@/hooks/useGovernanceData";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useReviewStatus } from "@/hooks/useReviewStatus";
import { useReadinessKPI } from "@/hooks/useReadinessKPI";

export function GovernanceOverview() {
  const kpi = useReadinessKPI();
  const { data: exports = [] } = useReportExports();
  const { data: committees = [] } = useCommittees();
  const sub = useSubscriptionLimits();
  const review = useReviewStatus();

  const lastExport = exports.find((e) => e.status === "ready");
  const nextMeeting = committees.find((c) => c.next_meeting);

  const isNA = kpi.globalScore === null;
  const donutPct = kpi.globalScore ?? 0;
  const circumference = 2 * Math.PI * 40;
  const filled = (donutPct / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Estado del Gobierno de IA
            </CardTitle>
            <CardDescription>
              Visión global del AIMS y preparación para auditoría
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-6 items-center">
          {/* Donut */}
          <div className="relative shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              {!isNA && (
                <circle cx="48" cy="48" r="40" fill="none"
                  stroke="hsl(var(--accent))" strokeWidth="8"
                  strokeDasharray={`${filled} ${circumference - filled}`}
                  strokeDashoffset={circumference / 4}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isNA ? (
                <>
                  <span className="text-sm font-bold text-muted-foreground">N/A</span>
                  <span className="text-[8px] text-muted-foreground">Sin datos</span>
                </>
              ) : (
                <>
                  <span className="text-xl font-bold">{donutPct}%</span>
                  <span className="text-[9px] text-muted-foreground">Ready</span>
                </>
              )}
            </div>
          </div>

          {/* Stats + clause grid */}
          <div className="flex-1 space-y-3">
            {isNA ? (
              <div className="rounded-lg border border-dashed border-accent/30 bg-accent/5 p-3 space-y-2">
                <p className="text-xs font-medium">Readiness no disponible</p>
                <p className="text-[11px] text-muted-foreground">
                  Carga una plantilla por vertical o inicializa los requisitos ISO para activar el cálculo de readiness.
                </p>
                <Link to="/app/onboarding">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 mt-1">
                    <Layers className="h-3.5 w-3.5" /> Cargar plantilla por vertical
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Requirement stats */}
                {kpi.totalRequirements > 0 && (
                  <div className="flex gap-4 text-xs">
                    <div><span className="font-semibold text-success">{kpi.metCount}</span> <span className="text-muted-foreground">cumplidos</span></div>
                    <div><span className="font-semibold text-warning">{kpi.partialCount}</span> <span className="text-muted-foreground">parciales</span></div>
                    <div><span className="font-semibold text-destructive">{kpi.gapCount}</span> <span className="text-muted-foreground">gaps</span></div>
                  </div>
                )}

                {/* Clause grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {kpi.clauseReadiness.map((clause) => (
                    <div key={clause.clause} className="text-center">
                      <div className={`h-10 w-10 mx-auto rounded-md flex items-center justify-center text-xs font-bold ${
                        clause.status === "green" ? "bg-success/10 text-success"
                        : clause.status === "amber" ? "bg-warning/10 text-warning"
                        : "bg-secondary text-muted-foreground"
                      }`}>
                        {clause.clause}
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight truncate">{clause.title}</p>
                      <Progress value={clause.score} className="h-0.5 mt-0.5" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <FileCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-xs">Último Evidence Pack</p>
              <p className="text-muted-foreground text-xs">
                {lastExport
                  ? `${new Date(lastExport.completed_at ?? lastExport.created_at).toLocaleDateString("es")} · ${lastExport.status}`
                  : "Sin generar aún"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium text-xs">Próxima revisión</p>
              <p className="text-muted-foreground text-xs">
                {nextMeeting?.next_meeting
                  ? new Date(nextMeeting.next_meeting).toLocaleDateString("es")
                  : review.upcomingItems[0]?.dueDate
                    ? `${review.upcomingItems[0].name} en ${review.upcomingItems[0].daysUntilDue}d`
                    : "Sin programar"}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Link to="/app/reports">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <History className="h-3.5 w-3.5" /> Ver historial
              </Button>
            </Link>
            <Link to="/app/reports">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" disabled={sub.isReadOnly}>
                <FileCheck className="h-3.5 w-3.5" /> Generar Evidence Pack
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
