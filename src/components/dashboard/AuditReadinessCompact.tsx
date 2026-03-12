import { useState } from "react";
import { FileCheck, AlertTriangle, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { useReviewStatus } from "@/hooks/useReviewStatus";
import { useReadinessKPI } from "@/hooks/useReadinessKPI";
import { ExportBlockedModal } from "@/components/dashboard/ExportBlockedModal";

export function AuditReadinessCompact() {
  const kpi = useReadinessKPI();
  const sub = useSubscriptionLimits();
  const review = useReviewStatus();
  const [blockedOpen, setBlockedOpen] = useState(false);

  const score = kpi.globalScore ?? 0;
  const criticalGaps = kpi.health.criticalOverdue;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-accent" />
            Audit Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Readiness bar */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-muted-foreground">Readiness</span>
              <span className="text-lg font-bold">{kpi.globalScore !== null ? `${score}%` : "N/A"}</span>
            </div>
            <Progress value={score} className="h-2.5" />
          </div>

          {/* Critical gaps */}
          {criticalGaps > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-xs font-medium text-destructive">
                {criticalGaps} gap(s) crítico(s)
              </span>
            </div>
          )}

          {/* Requirement summary */}
          {kpi.totalRequirements > 0 && (
            <div className="flex gap-4 text-xs">
              <div><span className="font-semibold text-success">{kpi.metCount}</span> <span className="text-muted-foreground">cumplidos</span></div>
              <div><span className="font-semibold text-warning">{kpi.partialCount}</span> <span className="text-muted-foreground">parciales</span></div>
              <div><span className="font-semibold text-destructive">{kpi.gapCount}</span> <span className="text-muted-foreground">gaps</span></div>
            </div>
          )}

          {/* Generate button */}
          <div className="pt-1">
            {!review.canExport ? (
              <Button
                size="sm"
                variant="destructive"
                className="w-full gap-1"
                onClick={() => setBlockedOpen(true)}
              >
                <Lock className="h-3.5 w-3.5" /> Export bloqueado
              </Button>
            ) : (
              <Link to="/app/reports" className="block">
                <Button
                  size="sm"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                  disabled={sub.isReadOnly}
                >
                  <FileCheck className="h-3.5 w-3.5" /> Generar Evidence Pack
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <ExportBlockedModal open={blockedOpen} onOpenChange={setBlockedOpen} />
    </>
  );
}
