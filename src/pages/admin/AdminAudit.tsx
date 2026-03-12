import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { usePlatformAuditLog } from "@/hooks/usePlatformData";
import { format } from "date-fns";

export default function AdminAudit() {
  const { data: logs = [], isLoading } = usePlatformAuditLog();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Audit Log</h1>
        <p className="text-sm text-muted-foreground">All platform-level actions: plan changes, suspensions, impersonations</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{format(new Date(l.created_at), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{l.action}</Badge></TableCell>
                  <TableCell className="text-xs">{l.entity_type}{l.entity_id ? ` / ${l.entity_id.slice(0, 8)}…` : ""}</TableCell>
                  <TableCell className="font-mono text-xs">{l.user_id?.slice(0, 8) || "system"}…</TableCell>
                  <TableCell className="text-xs max-w-[300px] truncate text-muted-foreground">
                    {l.details ? JSON.stringify(l.details) : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No audit entries</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
