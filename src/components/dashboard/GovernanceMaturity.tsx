import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LEVELS = [
  { level: 1, name: "Inicial", description: "Inventario y estructura básica.", color: "bg-secondary text-foreground" },
  { level: 2, name: "Estructurado", description: "Riesgos evaluados, controles definidos.", color: "bg-accent/20 text-accent" },
  { level: 3, name: "Operativo", description: "Revisiones periódicas, evidencias vivas.", color: "bg-accent/40 text-accent" },
  { level: 4, name: "Optimizado", description: "Mejora continua, auditoría fluida.", color: "bg-success/20 text-success" },
];

interface Props {
  currentLevel: number;
}

export function GovernanceMaturity({ currentLevel }: Props) {
  // Map internal maturity (1-3) to governance maturity (1-4)
  const displayLevel = Math.min(currentLevel, 4);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" />
          Governance Maturity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {LEVELS.map((lvl) => {
            const isActive = lvl.level <= displayLevel;
            const isCurrent = lvl.level === displayLevel;
            return (
              <div
                key={lvl.level}
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  isCurrent ? "border-accent bg-accent/5" : isActive ? "border-border" : "border-border/50 opacity-50"
                }`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive ? lvl.color : "bg-secondary/50 text-muted-foreground"
                }`}>
                  {lvl.level}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {lvl.name}
                    {isCurrent && (
                      <span className="text-[9px] bg-accent/10 text-accent rounded-full px-2 py-0.5 font-semibold">ACTUAL</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{lvl.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
