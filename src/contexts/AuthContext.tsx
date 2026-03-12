import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "partner" | "viewer" | "org_admin" | "org_editor" | "org_viewer" | "partner_admin" | "partner_consultant" | "partner_viewer" | "platform_superadmin" | "platform_support";

interface Profile {
  display_name: string | null;
  organization_id: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isPlatformAdmin: boolean;
  isPlatformSupport: boolean;
  isPlatformUser: boolean;
  hasOrganization: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [bootstrapAttempted, setBootstrapAttempted] = useState(false);

  const fetchUserData = useCallback(async (userId: string) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, organization_id, avatar_url")
        .eq("user_id", userId)
        .single(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    const fetchedRoles = rolesRes.data?.map((r) => r.role as AppRole) ?? [];
    setRoles(fetchedRoles);
    setLoading(false);
    return fetchedRoles;
  }, []);

  const tryBootstrapAdmin = useCallback(async () => {
    if (bootstrapAttempted) return;
    setBootstrapAttempted(true);
    try {
      const { data, error } = await supabase.functions.invoke("bootstrap-admin");
      if (!error && data?.bootstrapped) {
        // Re-fetch roles after bootstrap
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await fetchUserData(user.id);
      }
    } catch {
      // Silent fail - bootstrap is best-effort
    }
  }, [bootstrapAttempted, fetchUserData]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchUserData(user.id);
  }, [user, fetchUserData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            const fetchedRoles = await fetchUserData(session.user.id);
            // If no platform role, try bootstrap
            if (!fetchedRoles.includes("platform_superadmin") && !fetchedRoles.includes("platform_support")) {
              // Attempt bootstrap on first login
              setTimeout(() => tryBootstrapAdmin(), 100);
            }
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setLoading(false);
          setBootstrapAttempted(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData, tryBootstrapAdmin]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  const isPlatformAdmin = roles.includes("platform_superadmin");
  const isPlatformSupport = roles.includes("platform_support");

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        roles,
        loading,
        signOut,
        hasRole,
        isAdmin: roles.includes("admin"),
        isPartner: roles.includes("partner"),
        isPlatformAdmin,
        isPlatformSupport,
        isPlatformUser: isPlatformAdmin || isPlatformSupport,
        hasOrganization: !!profile?.organization_id,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
