import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Palette, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function AdminOrgDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: org, isLoading: loadingOrg } = useQuery({
    queryKey: ["admin-org", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("organizations").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: sub } = useQuery({
    queryKey: ["admin-org-sub", id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("*, plans(name, tier, plan_type)").eq("tenant_id", id!).eq("tenant_type", "org").maybeSingle();
      return data;
    },
    enabled: !!id,
  });

  const { data: partner } = useQuery({
    queryKey: ["admin-org-partner", org?.partner_id],
    queryFn: async () => {
      const { data } = await supabase.from("partners").select("*").eq("id", org!.partner_id!).single();
      return data;
    },
    enabled: !!org?.partner_id,
  });

  const { data: usage = [] } = useQuery({
    queryKey: ["admin-org-usage", id],
    queryFn: async () => {
      const { data } = await supabase.from("usage_meters").select("*").eq("tenant_id", id!).eq("tenant_type", "org").order("period_start", { ascending: false }).limit(6);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: exports = [] } = useQuery({
    queryKey: ["admin-org-exports", id],
    queryFn: async () => {
      const { data } = await supabase.from("report_exports").select("*").eq("organization_id", id!).order("created_at", { ascending: false }).limit(20);
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["admin-org-reviews", id],
    queryFn: async () => {
      const { data } = await supabase.from("governance_reviews").select("*").eq("organization_id", id!).order("review_date", { ascending: false }).limit(20);
      return data ?? [];
    },
    enabled: !!id,
  });

  if (loadingOrg) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  if (!org) return <div className="p-6 text-center text-muted-foreground">Organization not found</div>;

  const statusColor: Record<string, string> = {
    trial: "bg-warning/10 text-warning", trialing: "bg-warning/10 text-warning",
    active: "bg-success/10 text-success", suspended: "bg-destructive/10 text-destructive",
    none: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link to="/admin/orgs"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <p className="text-sm text-muted-foreground">{org.sector || "—"} · {org.country || "—"} · {org.employee_range || "—"}</p>
        </div>
        <Badge className={statusColor[sub?.status || "none"] || ""} variant="secondary">{sub?.status || "none"}</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription & Limits</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Organization Info</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Legal Name" value={org.legal_company_name} />
                <Row label="Trade Name" value={org.trade_name} />
                <Row label="CIF/NIF" value={org.tax_id} />
                <Row label="Website" value={org.website} />
                <Row label="Compliance Contact" value={org.compliance_contact_name ? `${org.compliance_contact_name} (${org.compliance_contact_email || ""})` : null} />
                <Row label="Vertical" value={org.vertical_template} />
                <Row label="AIMS Scope" value={org.aims_scope} />
                <Row label="Readiness" value={`${org.iso_readiness_pct || 0}%`} />
                <Row label="Partner" value={org.partner_id?.slice(0, 8) || "None"} />
                <Row label="Created" value={format(new Date(org.created_at), "dd/MM/yyyy")} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Billing Address</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Address" value={org.billing_address_line1} />
                <Row label="" value={org.billing_address_line2} />
                <Row label="City" value={org.billing_city} />
                <Row label="Region" value={org.billing_region} />
                <Row label="Postcode" value={org.billing_postcode} />
                <Row label="Country" value={org.billing_country} />
              </CardContent>
            </Card>

            {/* Branding Status Card */}
            <Card className="md:col-span-2 border-accent/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="h-4 w-4 text-accent" /> Branding Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partner ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {partner.logo_url && <img src={partner.logo_url} alt={partner.name} className="h-8 max-w-[120px] object-contain" />}
                        <div>
                          <p className="text-sm font-medium">{partner.brand_name || partner.name}</p>
                          <p className="text-xs text-muted-foreground">Partner branding active</p>
                        </div>
                      </div>
                      <Badge className="bg-success/10 text-success border-0 text-xs">Themed</Badge>
                    </div>
                    {/* Mini theme preview */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Primary:</span>
                        <span className="inline-block h-5 w-5 rounded border" style={{ background: partner.primary_color || "#2d9c8f" }} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Secondary:</span>
                        <span className="inline-block h-5 w-5 rounded border" style={{ background: partner.secondary_color || "#1a1a2e" }} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Accent:</span>
                        <span className="inline-block h-5 w-5 rounded border" style={{ background: partner.accent_color || "#2d9c8f" }} />
                      </div>
                    </div>
                    {/* Preview strip */}
                    <div className="rounded-lg overflow-hidden flex h-8">
                      <div className="flex-1" style={{ background: partner.secondary_color || "#1a1a2e" }} />
                      <div className="flex-1" style={{ background: partner.primary_color || "#2d9c8f" }} />
                      <div className="flex-1" style={{ background: partner.accent_color || "#2d9c8f" }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">No partner assigned — default theme active.</p>
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Subscription</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {sub ? (
                  <>
                    <Row label="Plan" value={(sub as any).plans?.name || "—"} />
                    <Row label="Tier" value={(sub as any).plans?.tier || "—"} />
                    <Row label="Status" value={sub.status} />
                    <Row label="Trial ends" value={sub.trial_ends_at ? format(new Date(sub.trial_ends_at), "dd/MM/yyyy") : "—"} />
                    <Row label="Period" value={sub.current_period_start && sub.current_period_end ? `${format(new Date(sub.current_period_start), "dd/MM/yyyy")} → ${format(new Date(sub.current_period_end), "dd/MM/yyyy")}` : "—"} />
                    <Row label="Notes" value={sub.notes_internal} />
                  </>
                ) : <p className="text-muted-foreground">No subscription</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Usage (Current Period)</CardTitle></CardHeader>
              <CardContent>
                {usage.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Systems</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Evidences</TableHead>
                        <TableHead>Exports</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usage.map((u: any) => (
                        <TableRow key={u.id}>
                          <TableCell className="text-xs">{format(new Date(u.period_start), "dd MMM")} – {format(new Date(u.period_end), "dd MMM yy")}</TableCell>
                          <TableCell>{u.systems_count}</TableCell>
                          <TableCell>{u.users_count}</TableCell>
                          <TableCell>{u.evidences_count}</TableCell>
                          <TableCell>{u.exports_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-sm text-muted-foreground">No usage data</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Exports</CardTitle></CardHeader>
              <CardContent>
                {exports.length > 0 ? (
                  <div className="space-y-2">
                    {exports.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between text-xs border-b pb-1">
                        <span className="font-medium">{e.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                          <span className="text-muted-foreground">{format(new Date(e.created_at), "dd/MM HH:mm")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No exports</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Governance Reviews</CardTitle></CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-2">
                    {reviews.map((r: any) => (
                      <div key={r.id} className="flex items-center justify-between text-xs border-b pb-1">
                        <span className="font-medium">{r.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{r.review_type}</Badge>
                          <span className="text-muted-foreground">{format(new Date(r.review_date), "dd/MM/yyyy")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No reviews</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value && !label) return null;
  return (
    <div className="flex justify-between">
      {label && <span className="text-muted-foreground">{label}</span>}
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}
