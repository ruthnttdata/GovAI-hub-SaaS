import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useOrganization } from "@/hooks/useGovernanceData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function ReviewSettingsButton() {
  const { data: org } = useOrganization();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState("suggested");
  const [frequency, setFrequency] = useState(180);
  const [warning, setWarning] = useState(14);
  const [criticalDays, setCriticalDays] = useState(30);
  const [blockingEnabled, setBlockingEnabled] = useState(false);
  const [blockingScope, setBlockingScope] = useState("critical_only");
  const [advanced, setAdvanced] = useState(false);

  // Sync from org when it loads
  useEffect(() => {
    if (org) {
      setMode(org.review_mode ?? "suggested");
      setFrequency(org.review_frequency_days ?? 180);
      setWarning(org.warning_before_days ?? 14);
      setCriticalDays(org.critical_overdue_days ?? 30);
      setBlockingEnabled(org.export_blocking_enabled ?? false);
      setBlockingScope(org.export_blocking_scope ?? "critical_only");
      setAdvanced(org.advanced_mode_enabled ?? false);
    }
  }, [org]);

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);

    // Auto-enable blocking in mandatory mode
    const effectiveBlocking = mode === "mandatory" ? true : blockingEnabled;

    const { error } = await supabase
      .from("organizations")
      .update({
        review_mode: mode,
        review_frequency_days: frequency,
        warning_before_days: warning,
        critical_overdue_days: criticalDays,
        export_blocking_enabled: effectiveBlocking,
        export_blocking_scope: blockingScope,
        advanced_mode_enabled: advanced,
      })
      .eq("id", org.id);
    setSaving(false);
    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      toast.success("Configuración de revisiones guardada");
      qc.invalidateQueries({ queryKey: ["organization"] });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Settings2 className="h-3.5 w-3.5" /> Ajustes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configuración de Revisiones</DialogTitle>
          <DialogDescription>
            Define cómo se gestionan las revisiones periódicas de tu AIMS (cláusula 9.3).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Review mode */}
          <div className="space-y-2">
            <Label>Modo de revisiones</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="suggested">Sugerido</SelectItem>
                <SelectItem value="mandatory">Obligatorio</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {mode === "mandatory"
                ? "Bloquea la generación del Evidence Pack si hay revisiones vencidas. Recomendado para organizaciones en proceso de auditoría."
                : "Muestra avisos y recordatorios, pero permite exportar sin restricciones. Ideal para comenzar."}
            </p>
          </div>

          <Separator />

          {/* Frequency & warning */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Frecuencia (días)</Label>
              <Input type="number" min={30} max={365} value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))} />
              <p className="text-[10px] text-muted-foreground">Por defecto: 180</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Aviso previo (días)</Label>
              <Input type="number" min={1} max={60} value={warning}
                onChange={(e) => setWarning(Number(e.target.value))} />
              <p className="text-[10px] text-muted-foreground">Cuándo alertar</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Crítico si &gt; (días)</Label>
              <Input type="number" min={7} max={180} value={criticalDays}
                onChange={(e) => setCriticalDays(Number(e.target.value))} />
              <p className="text-[10px] text-muted-foreground">Overdue crítico</p>
            </div>
          </div>

          {/* Blocking scope (only in mandatory) */}
          {mode === "mandatory" && (
            <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <Label className="text-xs text-destructive">Alcance del bloqueo de export</Label>
              <Select value={blockingScope} onValueChange={setBlockingScope}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical_only">Solo elementos críticos vencidos</SelectItem>
                  <SelectItem value="any_overdue">Cualquier elemento vencido</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                {blockingScope === "critical_only"
                  ? `Bloquea export solo si un item lleva >${criticalDays} días vencido o pertenece a cláusulas críticas (5-8).`
                  : "Bloquea export si cualquier sistema, riesgo o evidencia tiene revisión vencida."}
              </p>
            </div>
          )}

          <Separator />

          {/* Advanced mode */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Modo Avanzado (Level 3)</p>
              <p className="text-[11px] text-muted-foreground">
                Desbloquea bloques avanzados del dashboard.
              </p>
            </div>
            <Switch checked={advanced} onCheckedChange={setAdvanced} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {saving ? "Guardando…" : "Guardar configuración"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
