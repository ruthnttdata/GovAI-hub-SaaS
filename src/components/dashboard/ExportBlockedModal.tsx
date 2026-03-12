import { Shield, Lock, ArrowRight, ArrowUpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useReviewStatus, type ReviewItem } from "@/hooks/useReviewStatus";
import { useTrialStatus } from "@/hooks/useTrialStatus";

const TYPE_LABELS: Record<string, string> = { system: "Sistema IA", risk: "Riesgo", evidence: "Evidencia" };

export function ExportBlockedModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const review = useReviewStatus();
  const trial = useTrialStatus();

  // Trial-specific block takes priority
  if (trial.exportBlockReason) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-4 w-4" /> Exportación bloqueada
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center py-2">
            <p className="text-sm text-muted-foreground">{trial.exportBlockReason}</p>
            <Link to="/app/plan" onClick={() => onOpenChange(false)}>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
                <ArrowUpCircle className="h-4 w-4" /> Activar plan
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const items = review.exportBlockingScope === "critical_only"
    ? review.criticalOverdueItems
    : review.overdueItems;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Lock className="h-4 w-4" /> Export bloqueado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {review.blockReason}
          </p>
          <div className="max-h-60 overflow-y-auto space-y-1.5">
            {items.slice(0, 10).map((item) => (
              <Link
                key={item.id}
                to={item.link}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="text-[9px] shrink-0">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </Badge>
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-destructive font-medium">
                    {item.daysOverdue}d vencido
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
          {items.length > 10 && (
            <p className="text-[11px] text-muted-foreground text-center">
              …y {items.length - 10} más
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Revisa estos elementos para desbloquear la generación del Evidence Pack.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
