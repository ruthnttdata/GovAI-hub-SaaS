import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type MaturityLevel } from "@/hooks/useMaturityLevel";

const LEVEL_CONFIG: Record<MaturityLevel, { label: string; color: string; description: string }> = {
  1: { label: "Básico", color: "bg-secondary text-foreground", description: "Activación inicial del AIMS" },
  2: { label: "Operativo", color: "bg-accent/10 text-accent", description: "Gobernanza activa y control operativo" },
  3: { label: "Avanzado", color: "bg-success/10 text-success", description: "Gobernanza avanzada Enterprise/Partner" },
};

interface Props {
  level: MaturityLevel;
  nextHint: string | null;
}

export function MaturityIndicator({ level, nextHint }: Props) {
  const config = LEVEL_CONFIG[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${config.color} border-0 cursor-default`}>
            Level {level} · {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="font-medium text-xs">{config.description}</p>
          {nextHint && <p className="text-[11px] text-muted-foreground mt-1">{nextHint}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
