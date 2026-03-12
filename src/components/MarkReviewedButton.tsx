import { useState } from "react";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useMarkReviewed } from "@/hooks/useMarkReviewed";
import { useToast } from "@/hooks/use-toast";

interface Props {
  table: "ai_use_cases" | "risks" | "evidences";
  id: string;
  compact?: boolean;
  isOverdue?: boolean;
  isDueSoon?: boolean;
}

export function MarkReviewedButton({ table, id, compact, isOverdue, isDueSoon }: Props) {
  const mutation = useMarkReviewed(table);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const handleQuick = async () => {
    try {
      await mutation.mutateAsync({ id });
      toast({ title: "Marcado como revisado", description: "Próxima revisión programada." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleWithNote = async () => {
    try {
      await mutation.mutateAsync({ id, note });
      toast({ title: "Marcado como revisado" });
      setOpen(false);
      setNote("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (compact) {
    const variant = isOverdue ? "destructive" : "ghost";
    const label = isOverdue ? "Revisión vencida" : isDueSoon ? "Revisar pronto" : "Revisado";
    const className = isOverdue
      ? "text-xs gap-1 h-7 px-2"
      : isDueSoon
        ? "text-xs gap-1 h-7 px-2 border-warning/50 text-warning hover:text-warning"
        : "text-xs gap-1 h-7 px-2 text-success hover:text-success";

    return (
      <Button
        variant={isDueSoon ? "outline" : variant}
        size="sm"
        className={className}
        onClick={handleQuick}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : isOverdue ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
        {label}
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={isOverdue ? "destructive" : "outline"} size="sm" className="text-xs gap-1.5">
          {isOverdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {isOverdue ? "Revisión vencida" : "Marcar como revisado"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-3" align="end">
        <p className="text-xs font-medium">¿Confirmas la revisión?</p>
        <p className="text-[11px] text-muted-foreground">Esto actualiza la fecha de revisión y elimina el bloqueo de auditoría si aplica.</p>
        <Textarea
          placeholder="Nota de revisión (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="text-xs"
        />
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 text-xs" onClick={handleWithNote} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
