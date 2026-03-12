import { ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRisks } from "@/hooks/useGovernanceData";
import { useMemo } from "react";

const IMPACT_LABELS = ["", "Muy bajo", "Bajo", "Medio", "Alto", "Muy alto"];
const PROB_LABELS = ["", "Rara", "Poco prob.", "Posible", "Probable", "Casi segura"];

export function RiskLandscape() {
  const { data: risks = [] } = useRisks();

  const stats = useMemo(() => {
    const activeRisks = risks.filter((r) => r.status !== "closed");
    const highImpact = activeRisks.filter((r) => (r.score ?? r.impact * r.probability) >= 12);
    const noReeval = activeRisks.filter((r) => {
      if (!r.next_review_at) return !r.last_reviewed_at;
      return new Date(r.next_review_at).getTime() <= Date.now();
    });

    // Build 5x5 heatmap matrix
    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    activeRisks.forEach((r) => {
      const imp = Math.min(Math.max(r.impact, 1), 5);
      const prob = Math.min(Math.max(r.probability, 1), 5);
      matrix[5 - imp][prob - 1]++;
    });

    // Simple trend: compare risks created in last 30d vs previous 30d
    const now = Date.now();
    const d30 = 30 * 86400000;
    const recentCount = risks.filter((r) => new Date(r.created_at).getTime() > now - d30).length;
    const prevCount = risks.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t > now - 2 * d30 && t <= now - d30;
    }).length;
    const trend: "up" | "down" | "stable" = recentCount > prevCount ? "up" : recentCount < prevCount ? "down" : "stable";

    return { total: activeRisks.length, highImpact: highImpact.length, noReeval: noReeval.length, matrix, trend };
  }, [risks]);

  const cellColor = (row: number, col: number, count: number) => {
    if (count === 0) return "bg-secondary/50";
    const severity = (5 - row) * (col + 1); // impact * probability
    if (severity >= 16) return "bg-destructive/70 text-destructive-foreground";
    if (severity >= 9) return "bg-warning/60 text-warning-foreground";
    return "bg-accent/30 text-accent-foreground";
  };

  const TrendIcon = stats.trend === "up" ? TrendingUp : stats.trend === "down" ? TrendingDown : Minus;
  const trendColor = stats.trend === "up" ? "text-destructive" : stats.trend === "down" ? "text-success" : "text-muted-foreground";
  const trendLabel = stats.trend === "up" ? "↑ Subiendo" : stats.trend === "down" ? "↓ Bajando" : "— Estable";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          Risk Landscape
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Impacto × Probabilidad</p>
            <div className="space-y-1">
              {stats.matrix.map((row, ri) => (
                <div key={ri} className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground w-14 text-right shrink-0">
                    {IMPACT_LABELS[5 - ri]}
                  </span>
                  {row.map((count, ci) => (
                    <div
                      key={ci}
                      className={`flex-1 h-8 rounded flex items-center justify-center text-[10px] font-bold ${cellColor(ri, ci, count)}`}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center gap-1 pl-14">
                {PROB_LABELS.slice(1).map((l) => (
                  <span key={l} className="flex-1 text-center text-[8px] text-muted-foreground">{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="space-y-3">
            <div className="rounded-lg border p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Riesgos activos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                <span className={`text-xs font-medium ${trendColor}`}>{trendLabel}</span>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Alto impacto</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.highImpact}</p>
                {stats.highImpact > 0 && (
                  <Badge variant="destructive" className="text-[9px]">Requieren atención</Badge>
                )}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sin reevaluar</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.noReeval}</p>
                {stats.noReeval > 0 && (
                  <Badge variant="outline" className="text-[9px] text-warning border-warning/30">Pendientes</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
