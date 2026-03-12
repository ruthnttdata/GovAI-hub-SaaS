import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Layout } from "@/components/Layout";
import { PublicLayout } from "@/components/PublicLayout";
import { AdminLayout } from "@/components/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import Inventory from "@/pages/Inventory";
import Roles from "@/pages/Roles";
import Risks from "@/pages/Risks";
import Evidence from "@/pages/Evidence";
import Reports from "@/pages/Reports";
import Partner from "@/pages/Partner";
import Account from "@/pages/Account";
import Workspace from "@/pages/Workspace";
import Billing from "@/pages/Billing";
import Plan from "@/pages/Plan";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import OrgSetupWizard from "@/components/OrgSetupWizard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPartners from "@/pages/admin/AdminPartners";
import AdminOrgs from "@/pages/admin/AdminOrgs";
import AdminPlans from "@/pages/admin/AdminPlans";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminUsage from "@/pages/admin/AdminUsage";
import AdminSupport from "@/pages/admin/AdminSupport";
import AdminAudit from "@/pages/admin/AdminAudit";
import AdminOrgDetail from "@/pages/admin/AdminOrgDetail";
import Home from "@/pages/public/Home";

import Pricing from "@/pages/public/Pricing";
import Contact from "@/pages/public/Contact";
import PartnersPublic from "@/pages/public/Partners";
import FAQ from "@/pages/public/FAQ";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { session, loading, hasOrganization, refreshProfile, isPlatformUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Platform users without org can skip org setup
  if (!hasOrganization && !isPlatformUser) {
    return <OrgSetupWizard onComplete={refreshProfile} />;
  }

  return (
    <ThemeProvider>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/risks" element={<Risks />} />
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/account" element={<Account />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
    </ThemeProvider>
  );
}

function AdminRoutes() {
  const { session, loading, isPlatformUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!session || !isPlatformUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/partners" element={<AdminPartners />} />
        <Route path="/orgs" element={<AdminOrgs />} />
        <Route path="/orgs/:id" element={<AdminOrgDetail />} />
        <Route path="/plans" element={<AdminPlans />} />
        <Route path="/subscriptions" element={<AdminSubscriptions />} />
        <Route path="/usage" element={<AdminUsage />} />
        <Route path="/support" element={<AdminSupport />} />
        <Route path="/audit" element={<AdminAudit />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AdminLayout>
  );
}

function AuthRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/app" replace />;
  }

  return <Auth />;
}

function PublicPage({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/app/*" element={<ProtectedRoutes />} />
            {/* Public routes */}
            
            <Route path="/pricing" element={<PublicPage><Pricing /></PublicPage>} />
            <Route path="/faq" element={<PublicPage><FAQ /></PublicPage>} />
            <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
            <Route path="/partners" element={<PublicPage><PartnersPublic /></PublicPage>} />
            <Route path="/" element={<PublicPage><Home /></PublicPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
