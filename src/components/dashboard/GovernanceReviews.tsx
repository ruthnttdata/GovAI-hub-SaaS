import { useState } from "react";
import { Calendar, ClipboardList, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCommittees } from "@/hooks/useGovernanceData";
import { useReviewStatus } from "@/hooks/useReviewStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function useGovernanceReviewsList() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;
  return useQuery({
    queryKey: ["governance_reviews", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_reviews")
        .select("*")
        .order("review_date", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!orgId,
  });
}

export function GovernanceReviewsBlock() {
  const { data: committees = [] } = useCommittees();
  const { data: reviews = [] } = useGovernanceReviewsList();
  const review = useReviewStatus();
  const { profile, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", notes: "", decisions: "" });

  const nextMeeting = committees.find((c) => c.next_meeting);
  const lastReview = reviews[0];
  const openActions = review.overdueItems.length + review.upcomingItems.length;

  const handleCreateReview = async () => {
    if (!form.title || !profile?.organization_id) return;
    setSaving(true);
    const { error } = await supabase.from("governance_reviews").insert({
      organization_id: profile.organization_id,
      title: form.title,
      notes: form.notes || null,
      decisions: form.decisions || null,
      review_type: "management_review",
      created_by: user?.id,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Management Review registrada");
    qc.invalidateQueries({ queryKey: ["governance_reviews"] });
    setOpen(false);
    setForm({ title: "", notes: "", decisions: "" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Revisiones de Gobierno</CardTitle>
            <CardDescription>
              Las revisiones periódicas son obligatorias en cláusula 9.3 de ISO 42001.
            </CardDescription>
          </div>
          {review.reviewMode === "mandatory" && (
            <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">Obligatorio</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Key dates */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-secondary/50 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Próxima revisión</p>
            <p className="text-xs font-medium mt-0.5">
              {nextMeeting?.next_meeting
                ? new Date(nextMeeting.next_meeting).toLocaleDateString("es", { day: "numeric", month: "short" })
                : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Última review</p>
            <p className="text-xs font-medium mt-0.5">
              {lastReview
                ? new Date(lastReview.review_date).toLocaleDateString("es", { day: "numeric", month: "short" })
                : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground">Acciones abiertas</p>
            <p className={`text-xs font-medium mt-0.5 ${openActions > 0 ? "text-warning" : ""}`}>
              {openActions}
            </p>
          </div>
        </div>

        {/* Overdue warnings */}
        {review.overdueItems.length > 0 && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 space-y-1">
            <p className="text-xs font-medium text-destructive">
              ⚠ {review.overdueItems.length} elemento(s) con revisión vencida
            </p>
            {review.overdueItems.slice(0, 3).map((item) => (
              <Link key={item.id} to={item.link} className="flex justify-between text-xs hover:underline">
                <span className="truncate">{item.name}</span>
                <span className="text-destructive shrink-0">{item.daysOverdue}d vencido</span>
              </Link>
            ))}
          </div>
        )}

        {/* Recent reviews */}
        {reviews.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Últimas revisiones</p>
            {reviews.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-xs">
                <ClipboardList className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-muted-foreground">
                    {new Date(r.review_date).toLocaleDateString("es")} · {r.review_type === "management_review" ? "Management Review" : r.review_type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 w-full">
              <Plus className="h-3.5 w-3.5" /> Registrar Management Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Management Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Título</Label>
                <Input placeholder="Ej: Management Review Q1 2026" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notas</Label>
                <Textarea placeholder="Resumen de la revisión…" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Decisiones tomadas</Label>
                <Textarea placeholder="Decisiones clave…" value={form.decisions}
                  onChange={(e) => setForm({ ...form, decisions: e.target.value })} rows={2} />
              </div>
              <Button onClick={handleCreateReview} disabled={saving || !form.title}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {saving ? "Guardando…" : "Registrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
