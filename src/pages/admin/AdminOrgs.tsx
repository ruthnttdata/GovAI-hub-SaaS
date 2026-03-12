import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Pause, Play, RotateCcw, Calendar, Eye, Building2 } from "lucide-react";
import { usePlatformOrgs, useSubscriptions, useUpsertSubscription, useLogPlatformAction, usePlatformPartners } from "@/hooks/usePlatformData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { Link } from "react-router-dom";

export default function AdminOrgs() {
  const { data: orgs = [], isLoading } = usePlatformOrgs();
  const { data: subs = [] } = useSubscriptions();
  const { data: partners = [] } = usePlatformPartners();
  const upsertSub = useUpsertSubscription();
  const logAction = useLogPlatformAction();
  const { isPlatformAdmin } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrgId, setAssignOrgId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const getSub = (orgId: string) => subs.find((s: any) => s.tenant_type === "org" && s.tenant_id === orgId);
  const getSubStatus = (orgId: string) => getSub(orgId)?.status || "none";

  const statusColor: Record<string, string> = {
    trial: "bg-warning/10 text-warning",
    trialing: "bg-warning/10 text-warning",
    active: "bg-success/10 text-success",
    suspended: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
    none: "bg-muted text-muted-foreground",
  };

  const handleQuickAction = (orgId: string, newStatus: string) => {
    const sub = getSub(orgId);
    if (!sub) { toast({ title: "No subscription found for this org", variant: "destructive" }); return; }
    upsertSub.mutate({ id: sub.id, status: newStatus }, {
      onSuccess: () => {
        logAction.mutate({
          action: newStatus === "suspended" ? "org_suspended" : newStatus === "active" ? "org_reactivated" : `org_${newStatus}`,
          entity_type: "organization",
          entity_id: orgId,
          details: { previous: sub.status },
        });
        toast({ title: `Organization ${newStatus}` });
      },
    });
  };

  const handleExtendTrial = (orgId: string) => {
    const sub = getSub(orgId);
    if (!sub) { toast({ title: "No subscription found", variant: "destructive" }); return; }
    const newEnd = addDays(new Date(sub.trial_ends_at || new Date()), 14).toISOString();
    upsertSub.mutate({ id: sub.id, trial_ends_at: newEnd, status: "trial" }, {
      onSuccess: () => {
        logAction.mutate({
          action: "trial_extended",
          entity_type: "organization",
          entity_id: orgId,
          details: { new_trial_ends_at: newEnd },
        });
        toast({ title: "Trial extended +14 days" });
      },
    });
  };

  const handleAssignPartner = async () => {
    if (!assignOrgId) return;
    const { error } = await supabase
      .from("organizations")
      .update({ partner_id: selectedPartnerId || null } as any)
      .eq("id", assignOrgId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    logAction.mutate({
      action: "partner_assigned",
      entity_type: "organization",
      entity_id: assignOrgId,
      details: { partner_id: selectedPartnerId || null },
    });
    qc.invalidateQueries({ queryKey: ["platform-orgs"] });
    setAssignOpen(false);
    toast({ title: "Partner assigned" });
  };

  const filtered = orgs.filter((o: any) =>
    !search || o.name?.toLowerCase().includes(search.toLowerCase()) || o.sector?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-sm text-muted-foreground">All tenant organizations across the platform</p>
        </div>
        <Input placeholder="Search orgs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o: any) => {
                const status = getSubStatus(o.id);
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell>{o.sector || "—"}</TableCell>
                    <TableCell>{o.country || "—"}</TableCell>
                    <TableCell>{o.employee_range || o.employee_count || "—"}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[status] || ""} variant="secondary">{status}</Badge>
                    </TableCell>
                    <TableCell>{o.iso_readiness_pct || 0}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(o.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" title="View detail" asChild>
                          <Link to={`/admin/orgs/${o.id}`}><Eye className="h-3 w-3" /></Link>
                        </Button>
                        {status === "active" && (
                          <Button size="icon" variant="ghost" title="Suspend" onClick={() => handleQuickAction(o.id, "suspended")}>
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        {status === "suspended" && (
                          <Button size="icon" variant="ghost" title="Reactivate" onClick={() => handleQuickAction(o.id, "active")}>
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        {(status === "trial" || status === "trialing") && (
                          <>
                            <Button size="icon" variant="ghost" title="Activate" onClick={() => handleQuickAction(o.id, "active")}>
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="ghost" title="Extend trial +14d" onClick={() => handleExtendTrial(o.id)}>
                              <Calendar className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {isPlatformAdmin && (
                          <Button size="icon" variant="ghost" title="Assign partner" onClick={() => { setAssignOrgId(o.id); setSelectedPartnerId(o.partner_id || ""); setAssignOpen(true); }}>
                            <Building2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No organizations</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Partner</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Partner</Label>
              <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                <SelectTrigger><SelectValue placeholder="Select partner (or none)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No partner</SelectItem>
                  {partners.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignPartner}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
