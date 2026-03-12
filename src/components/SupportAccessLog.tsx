import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { format } from "date-fns";

export function SupportAccessLog() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  // Org admins can see support sessions that targeted users in their org
  const { data: sessions = [] } = useQuery({
    queryKey: ["support-access-log", orgId],
    queryFn: async () => {
      // Get all profiles in org to find target user ids
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("organization_id", orgId!);

      if (!profiles || profiles.length === 0) return [];

      const userIds = profiles.map((p) => p.user_id);
      const { data, error } = await supabase
        .from("support_sessions")
        .select("*")
        .in("target_user_id", userIds)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) return [];
      return data ?? [];
    },
    enabled: !!orgId,
  });

  if (sessions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4 text-warning" />
          Support Access Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sessions.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 text-sm">
              <div>
                <p className="font-medium">
                  Support session
                  {s.is_read_only ? " (read-only)" : " (write)"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Reason: {s.reason}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-[10px]">
                  {format(new Date(s.started_at), "dd MMM HH:mm")}
                  {s.ended_at ? ` — ${format(new Date(s.ended_at), "HH:mm")}` : " — active"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
