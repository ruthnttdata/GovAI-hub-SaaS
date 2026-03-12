import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, LogOut, User, Building2, CreditCard, Zap, Shield, ArrowUpCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, roles, signOut, hasRole, isPlatformUser } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole("admin");
  const trial = useTrialStatus();

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Trial banner */}
          {!trial.loading && trial.isTrialActive && (
            <div className="flex items-center justify-between gap-3 bg-accent/10 border-b border-accent/20 px-4 py-2">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span className="text-foreground">
                  <strong className="text-accent">{trial.trialDaysLeft} días</strong> restantes en tu prueba gratuita
                  {trial.trialExportsUsed >= trial.trialExportsMax && (
                    <span className="text-muted-foreground ml-1">· Exportación gratuita usada</span>
                  )}
                </span>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                onClick={() => navigate("/app/plan")}
              >
                <ArrowUpCircle className="h-3 w-3" />
                Activar plan
              </Button>
            </div>
          )}

          {!trial.loading && trial.isTrialExpired && !trial.hasActiveSubscription && (
            <div className="flex items-center justify-between gap-3 bg-destructive/10 border-b border-destructive/20 px-4 py-2">
              <span className="text-xs text-foreground">
                Tu periodo de prueba ha expirado. Activa un plan para seguir exportando.
              </span>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs gap-1"
                onClick={() => navigate("/app/plan")}
              >
                <ArrowUpCircle className="h-3 w-3" />
                Ver planes
              </Button>
            </div>
          )}

          <header className="h-14 flex items-center justify-between border-b px-4 bg-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{profile?.display_name ?? user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="flex gap-1 mt-1">
                      {roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-[10px]">
                          {role}
                        </Badge>
                      ))}
                      {roles.length === 0 && (
                        <Badge variant="secondary" className="text-[10px]">viewer</Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/app/account")} className="gap-2">
                    <User className="h-4 w-4" /> Mi cuenta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/app/workspace")} className="gap-2">
                    <Building2 className="h-4 w-4" /> Workspace
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/app/billing")} className="gap-2">
                        <CreditCard className="h-4 w-4" /> Facturación
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/app/plan")} className="gap-2">
                        <Zap className="h-4 w-4" /> Plan y uso
                      </DropdownMenuItem>
                    </>
                  )}
                  {isPlatformUser && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2">
                        <Shield className="h-4 w-4" /> Platform Console
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
