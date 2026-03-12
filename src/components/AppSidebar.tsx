import {
  LayoutDashboard,
  Settings,
  Brain,
  Users,
  ShieldAlert,
  FileCheck,
  FileBarChart,
  Building2,
  ChevronRight,
  Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const mainNav = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "Definir alcance", url: "/app/onboarding", icon: Settings },
  { title: "Inventario IA", url: "/app/inventory", icon: Brain },
  { title: "Roles y responsables", url: "/app/roles", icon: Users },
  { title: "Riesgos y controles", url: "/app/risks", icon: ShieldAlert },
  { title: "Evidencias", url: "/app/evidence", icon: FileCheck },
  { title: "Exportar Evidence Pack", url: "/app/reports", icon: FileBarChart },
];

const adminNav = [
  { title: "Partner Console", url: "/app/partner", icon: Building2 },
];

const platformNav = [
  { title: "Platform Console", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isAdmin, isPartner, isPlatformUser } = useAuth();

  const isActive = (path: string) =>
    path === "/app" ? location.pathname === "/app" || location.pathname === "/app/" : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-accent-foreground">
                ISO 42001
              </span>
              <span className="text-[10px] text-sidebar-muted leading-none">
                Evidence Pack Hub
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">
            AIMS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {!collapsed && isActive(item.url) && (
                        <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(isAdmin || isPartner) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isPlatformUser && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider">
              Platform
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {platformNav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-[11px] text-sidebar-muted leading-relaxed">
              ISO 42001 Readiness
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-sidebar-border overflow-hidden">
              <div className="h-full rounded-full bg-sidebar-primary transition-all" style={{ width: "0%" }} />
            </div>
            <p className="mt-1 text-[10px] text-sidebar-muted">Start adding data →</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
