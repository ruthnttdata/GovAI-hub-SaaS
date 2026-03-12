import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Users, CreditCard, AlertTriangle, Loader2, Search } from "lucide-react";
import { usePlatformPartners, usePlatformOrgs, useSubscriptions, usePlatformAuditLog } from "@/hooks/usePlatformData";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { data: partners = [], isLoading: lp } = usePlatformPartners();
  const { data: orgs = [], isLoading: lo } = usePlatformOrgs();
  const { data: subs = [], isLoading: ls } = useSubscriptions();
  const { data: auditLog = [] } = usePlatformAuditLog();
  const [globalSearch, setGlobalSearch] = useState("");

  const activeSubs = subs.filter((s: any) => s.status === "active" || s.status === "trial" || s.status === "trialing");
  const trialExpiring = subs.filter((s: any) => {
    if (!["trial", "trialing"].includes(s.status) || !s.trial_ends_at) return false;
    const diff = new Date(s.trial_ends_at).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  });
  const suspendedCount = subs.filter((s: any) => s.status === "suspended").length;

  const searchResults = globalSearch.length >= 2 ? {
    orgs: orgs.filter((o: any) => o.name?.toLowerCase().includes(globalSearch.toLowerCase())),
    partners: partners.filter((p: any) => p.name?.toLowerCase().includes(globalSearch.toLowerCase())),
  } : null;

  if (lp || lo || ls) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  }

  const stats = [
    { label: "Partners", value: partners.length, icon: Building2, link: "/admin/partners" },
    { label: "Organizations", value: orgs.length, icon: Users, link: "/admin/orgs" },
    { label: "Active Subscriptions", value: activeSubs.length, icon: CreditCard, link: "/admin/subscriptions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Console</h1>
          <p className="text-muted-foreground text-sm">Platform overview and quick actions</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orgs, partners..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-9"
          />
          {searchResults && (searchResults.orgs.length > 0 || searchResults.partners.length > 0) && (
            <div className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
              {searchResults.partners.map((p: any) => (
                <Link key={p.id} to="/admin/partners" className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm">
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                  <span>{p.name}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">Partner</Badge>
                </Link>
              ))}
              {searchResults.orgs.map((o: any) => (
                <Link key={o.id} to={`/admin/orgs/${o.id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span>{o.name}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">Org</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.link}>
            <Card className="hover:border-accent/30 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trialExpiring.length > 0 && (
          <Card className="border-warning/30">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <CardTitle className="text-sm">Trials Expiring Soon ({trialExpiring.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {trialExpiring.map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{s.tenant_type}/{s.tenant_id?.slice(0, 8)}</span>
                    <Badge variant="outline" className="text-warning">{format(new Date(s.trial_ends_at), "dd MMM yyyy")}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {suspendedCount > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm">Suspended Tenants ({suspendedCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {suspendedCount} tenant{suspendedCount > 1 ? "s" : ""} in read-only mode.
                <Link to="/admin/subscriptions" className="text-accent hover:underline ml-1">Manage →</Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">No platform activity yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {auditLog.slice(0, 20).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between text-xs border-b pb-1">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">{log.action}</Badge>
                    <span className="text-muted-foreground">{log.entity_type}</span>
                  </div>
                  <span className="text-muted-foreground">{format(new Date(log.created_at), "dd/MM HH:mm")}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
