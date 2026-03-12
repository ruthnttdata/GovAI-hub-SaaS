import { Brain, AlertTriangle, Eye, Plus, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAiUseCases } from "@/hooks/useGovernanceData";

export function PortfolioOverview() {
  const { data: useCases = [] } = useAiUseCases();

  const now = Date.now();
  const quarterAgo = now - 90 * 86400000;

  const total = useCases.length;
  const critical = useCases.filter((u) => u.criticality === "high" || u.criticality === "critical");
  const inReview = useCases.filter((u) => u.status === "in_review" || u.status === "pending");
  const newThisQuarter = useCases.filter((u) => new Date(u.created_at).getTime() >= quarterAgo);
  const noOwner = useCases.filter((u) => !u.owner_name);

  // Critical systems without recent review
  const criticalNoReview = critical.filter((u) => {
    if (!u.last_reviewed_at) return true;
    const reviewDate = new Date(u.last_reviewed_at).getTime();
    return reviewDate < now - 90 * 86400000;
  });

  const kpis = [
    { label: "Total AI Systems", value: total, icon: Brain, color: "text-accent" },
    {
      label: "Sistemas críticos",
      value: critical.length,
      icon: AlertTriangle,
      color: "text-destructive",
      badge: criticalNoReview.length > 0 ? `${criticalNoReview.length} sin revisión` : null,
    },
    { label: "En revisión", value: inReview.length, icon: Eye, color: "text-warning" },
    { label: "Nuevos (trimestre)", value: newThisQuarter.length, icon: Plus, color: "text-accent" },
    { label: "Sin owner", value: noOwner.length, icon: UserX, color: noOwner.length > 0 ? "text-destructive" : "text-muted-foreground" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" />
          AI Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-background p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <kpi.icon className={`h-3.5 w-3.5 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{kpi.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{kpi.value}</span>
                {kpi.badge && (
                  <Badge variant="destructive" className="text-[9px] h-5">
                    {kpi.badge}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
