import { ReactNode } from "react";
import { useSubscriptionLimits, type PlanLimits } from "@/hooks/useSubscriptionLimits";
import { AlertTriangle, Lock, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface LimitGateProps {
  resource: keyof PlanLimits;
  children: ReactNode;
  /** Action label for the blocked CTA */
  actionLabel?: string;
}

export function LimitGate({ resource, children, actionLabel = "Create" }: LimitGateProps) {
  const { checkLimit, isReadOnly } = useSubscriptionLimits();
  const check = checkLimit(resource);

  if (isReadOnly) {
    return <SuspendedBanner />;
  }

  if (check.status === "blocked") {
    return <LimitReached resource={resource} current={check.current} max={check.max!} />;
  }

  return (
    <>
      {check.status === "warning" && (
        <LimitWarning resource={resource} current={check.current} max={check.max!} pct={check.pct} />
      )}
      {children}
    </>
  );
}

export function LimitWarning({ resource, current, max, pct }: { resource: string; current: number; max: number; pct: number }) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex items-center gap-3 mb-4">
      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warning">
          Approaching limit: {current}/{max} {resource.replace("max_", "").replace(/_/g, " ")}
        </p>
        <Progress value={pct} className="h-1.5 mt-1" />
      </div>
      <Button size="sm" variant="outline" className="shrink-0 text-xs border-warning/30 text-warning hover:bg-warning/10">
        <ArrowUpCircle className="h-3 w-3 mr-1" /> Upgrade
      </Button>
    </div>
  );
}

export function LimitReached({ resource, current, max }: { resource: string; current: number; max: number }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
      <Lock className="h-8 w-8 text-destructive mx-auto" />
      <h3 className="font-semibold text-lg">Limit Reached</h3>
      <p className="text-sm text-muted-foreground">
        You've used {current}/{max} {resource.replace("max_", "").replace(/_/g, " ")}.
        Upgrade your plan to continue.
      </p>
      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
        <ArrowUpCircle className="h-4 w-4 mr-2" /> Upgrade Plan
      </Button>
    </div>
  );
}

export function SuspendedBanner() {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
      <Lock className="h-8 w-8 text-destructive mx-auto" />
      <h3 className="font-semibold text-lg">Account Suspended</h3>
      <p className="text-sm text-muted-foreground">
        Your subscription is suspended. Data is read-only. Contact support or upgrade to restore access.
      </p>
      <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
        <ArrowUpCircle className="h-4 w-4 mr-2" /> Reactivate
      </Button>
    </div>
  );
}

export function TrialBanner({ daysLeft, endsAt, expired, trialExportsUsed = 0, trialExportsMax = 1 }: { daysLeft: number; endsAt: string; expired?: boolean; trialExportsUsed?: number; trialExportsMax?: number }) {
  const urgent = expired || daysLeft <= 3;
  return (
    <div className={`rounded-lg border p-3 flex items-center gap-3 ${
      urgent ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"
    }`}>
      <AlertTriangle className={`h-4 w-4 shrink-0 ${urgent ? "text-destructive" : "text-warning"}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${urgent ? "text-destructive" : "text-warning"}`}>
          {expired
            ? "Tu periodo de prueba ha expirado"
            : `Trial activo: quedan ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Exportaciones de trial: {trialExportsUsed}/{trialExportsMax}
        </p>
      </div>
      <Link to="/app/plan">
        <Button size="sm" variant="outline" className="shrink-0 text-xs">
          <ArrowUpCircle className="h-3 w-3 mr-1" /> {expired ? "Activar plan" : "Mejorar plan"}
        </Button>
      </Link>
    </div>
  );
}

export function SupportAccessLog() {
  // This is a placeholder - the actual component fetches support sessions visible to org admin
  return null;
}
