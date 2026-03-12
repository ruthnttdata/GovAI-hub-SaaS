import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Building2, Users, CreditCard, Shield, Headset, ScrollText, Package,
  LogOut, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const adminNav = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Organizations", url: "/admin/orgs", icon: Users },
  { title: "Partners", url: "/admin/partners", icon: Building2 },
  { title: "Pricing & Plans", url: "/admin/plans", icon: Package },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Support", url: "/admin/support", icon: Headset },
  { title: "Audit Log", url: "/admin/audit", icon: ScrollText },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, signOut, isPlatformAdmin, isPlatformSupport } = useAuth();

  const isActive = (path: string) =>
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-64 shrink-0 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive flex items-center justify-center">
              <Shield className="h-4 w-4 text-destructive-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold">Platform Console</p>
              <p className="text-[10px] text-muted-foreground">Administration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-auto">
          {adminNav.map((item) => {
            const active = isActive(item.url);
            // Support users can't access plans
            if (isPlatformSupport && !isPlatformAdmin && ["/admin/plans"].includes(item.url)) return null;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {active && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-[10px]">
              {isPlatformAdmin ? "superadmin" : "support"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 text-xs" asChild>
              <Link to="/">← Product</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
