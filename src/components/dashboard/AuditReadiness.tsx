import { useState } from "react";
import { FileCheck, AlertTriangle, Download, Lock, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useReportExports, useControls } from "@/hooks/useGovernanceData";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useReviewStatus } from "@/hooks/useReviewStatus";
import { useReadinessKPI } from "@/hooks/useReadinessKPI";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { ExportBlockedModal } from "@/components/dashboard/ExportBlockedModal";

export function AuditReadiness() {
  const { data: exports = [] } = useReportExports();
  const kpi = useReadinessKPI();
  const sub = useSubscriptionLimits();
  const review = useReviewStatus();
  const [blockedOpen, setBlockedOpen] = useState(false);
  const trial = useTrialStatus();

  const exportCheck = sub.checkLimit("max_exports_per_month");
  const recentExports = exports.slice(0, 5);
  const criticalGaps = kpi.health.criticalOverdue;

  const statusColors: Record<string, string> = {
    ready: "bg-success/10 text-success",
    generating: "bg-warning/10 text-warning",
    queued: "bg-secondary text-muted-foreground",
    failed: "bg-destructive/10 text-destructive",
  };

  const isBlocked = !review.canExport || sub.isReadOnly || exportCheck.status === "blocked";

  const handleGenerateClick = () => {
    if (!review.canExport && review.blockReason) {
      setBlockedOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Preparación para Auditoría</CardTitle>
              <CardDescription>
                El Evidence Pack es tu entregable clave para la auditoría externa.
              </CardDescription>
            </div>
            {!review.canExport && (
              <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] gap-1">
                <Lock className="h-3 w-3" /> Bloqueado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Blocking reason */}
          {review.blockReason && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
              <p className="text-xs text-destructive font-medium">{review.blockReason}</p>
              <Button variant="ghost" size="sm" className="text-xs text-destructive mt-1 h-7 px-2"
                onClick={() => setBlockedOpen(true)}>
                Ver elementos bloqueantes →
              </Button>
            </div>
          )}

          {/* Export usage */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Exports este mes</span>
                <span className="font-medium">
                  {exportCheck.current}/{exportCheck.max ?? "∞"}
                </span>
              </div>
              <Progress value={exportCheck.pct} className="h-2" />
            </div>
            {!review.canExport ? (
              <Button size="sm" variant="destructive" className="gap-1" onClick={handleGenerateClick}>
                <Lock className="h-3.5 w-3.5" /> Bloqueado
              </Button>
            ) : (
              <Link to="/app/reports">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                  disabled={sub.isReadOnly || exportCheck.status === "blocked"}>
                  <FileCheck className="h-3.5 w-3.5" /> Generar
                </Button>
              </Link>
            )}
          </div>

          {/* Trial export indicator */}
          {!trial.hasActiveSubscription && trial.isTrialActive && (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span>Trial: {trial.trialExportsUsed}/{trial.trialExportsMax} exportación usada</span>
            </div>
          )}

          {/* Critical overdue count */}
          {criticalGaps > 0 && (
            <div className="flex items-center gap-2 text-xs text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{criticalGaps} elemento(s) con overdue crítico</span>
            </div>
          )}

          {/* Export history */}
          {recentExports.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Historial de Evidence Packs</p>
              {recentExports.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Download className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{exp.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground">
                      {new Date(exp.created_at).toLocaleDateString("es")}
                    </span>
                    <Badge className={`text-[9px] border-0 ${statusColors[exp.status] ?? "bg-secondary text-muted-foreground"}`}>
                      {exp.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-3">
              Aún no has generado ningún Evidence Pack.{" "}
              <Link to="/app/reports" className="text-accent hover:underline">Generar ahora</Link>
            </p>
          )}
        </CardContent>
      </Card>

      <ExportBlockedModal open={blockedOpen} onOpenChange={setBlockedOpen} />
    </>
  );
}
