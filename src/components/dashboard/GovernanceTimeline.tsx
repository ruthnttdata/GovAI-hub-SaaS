import { Clock, FileCheck, ShieldAlert, Brain, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditLog, useReportExports } from "@/hooks/useGovernanceData";
import { useMemo } from "react";

interface TimelineEvent {
  id: string;
  date: Date;
  label: string;
  icon: React.ElementType;
  color: string;
}

export function GovernanceTimeline() {
  const { data: auditLog = [] } = useAuditLog();
  const { data: exports = [] } = useReportExports();

  const events = useMemo(() => {
    const items: TimelineEvent[] = [];

    // From audit_log
    auditLog.slice(0, 15).forEach((entry) => {
      const entityType = entry.entity_type;
      const action = entry.action?.toLowerCase() ?? "";
      let label = "";
      let icon: React.ElementType = Settings;
      let color = "text-muted-foreground";

      if (entityType === "ai_use_cases") {
        icon = Brain;
        color = "text-accent";
        label = action === "insert" ? "Nuevo sistema IA registrado" : action === "update" ? "Sistema IA actualizado" : "Sistema IA eliminado";
      } else if (entityType === "risks") {
        icon = ShieldAlert;
        color = "text-destructive";
        label = action === "insert" ? "Nuevo riesgo registrado" : action === "update" ? "Riesgo reevaluado" : "Riesgo eliminado";
      } else if (entityType === "controls") {
        icon = Settings;
        color = "text-warning";
        label = action === "insert" ? "Control añadido" : action === "update" ? "Control actualizado" : "Control eliminado";
      } else if (entityType === "evidences") {
        icon = FileCheck;
        color = "text-accent";
        label = action === "insert" ? "Evidencia subida" : action === "update" ? "Evidencia actualizada" : "Evidencia eliminada";
      } else {
        label = `${entityType} ${action}`;
      }

      items.push({
        id: entry.id,
        date: new Date(entry.created_at),
        label,
        icon,
        color,
      });
    });

    // From exports
    exports.slice(0, 5).forEach((exp) => {
      items.push({
        id: `exp-${exp.id}`,
        date: new Date(exp.completed_at ?? exp.created_at),
        label: `Evidence Pack generado: ${exp.name}`,
        icon: FileCheck,
        color: "text-success",
      });
    });

    // Sort by date descending, take top 8
    return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);
  }, [auditLog, exports]);

  if (events.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          Governance Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {events.map((event, i) => (
            <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div className={`h-6 w-6 rounded-full border-2 border-border bg-background flex items-center justify-center shrink-0`}>
                  <event.icon className={`h-3 w-3 ${event.color}`} />
                </div>
                {i < events.length - 1 && <div className="w-px flex-1 bg-border" />}
              </div>
              {/* Content */}
              <div className="pt-0.5 min-w-0">
                <p className="text-xs font-medium truncate">{event.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {event.date.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
