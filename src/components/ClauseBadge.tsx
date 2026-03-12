import { FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ISO_42001_CLAUSES, ANNEX_A_CONTROLS } from "@/lib/iso42001";

// Build a flat lookup: clause id → title
const CLAUSE_TITLES: Record<string, string> = {};
ISO_42001_CLAUSES.forEach((c) => {
  CLAUSE_TITLES[c.clause] = c.title;
  c.subclauses.forEach((sc) => {
    CLAUSE_TITLES[sc.id] = sc.name;
  });
});
ANNEX_A_CONTROLS.forEach((a) => {
  CLAUSE_TITLES[a.id] = a.name;
});

interface ClauseBadgeProps {
  clause: string;
  /** Override auto-resolved title */
  title?: string;
  /** Show "Cláusula X" label on larger screens */
  showLabel?: boolean;
  /** Extra classes on outer element */
  className?: string;
  /** Warning style (e.g. for gaps) */
  variant?: "default" | "warning";
}

export function ClauseBadge({ clause, title, showLabel = false, className, variant = "default" }: ClauseBadgeProps) {
  const resolvedTitle = title || CLAUSE_TITLES[clause] || "";
  const tooltipText = resolvedTitle ? `Cláusula ${clause} — ${resolvedTitle}` : `Cláusula ${clause}`;

  const variantClasses =
    variant === "warning"
      ? "border-warning/30 text-warning"
      : "border-border text-muted-foreground";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none cursor-default select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              variantClasses,
              className,
            )}
          >
            <FileText className="h-3 w-3 shrink-0" />
            {showLabel && <span className="hidden lg:inline">Cláusula</span>}
            <span>{clause}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
