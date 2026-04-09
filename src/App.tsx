import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminGuard from "@/pages/AdminGuard";
import LandingPage from "@/pages/LandingPage";
import TeamPage from "@/pages/TeamPage";
import MatchesPage from "@/pages/MatchesPage";
import StatsPage from "@/pages/StatsPage";
import TrainingPage from "@/pages/TrainingPage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import SuperAdminPage from "@/pages/SuperAdminPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const HIDE_CHROME = ["/admin/login", "/admin", "/admin/super"];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideChrome = HIDE_CHROME.some((p) => location.pathname.startsWith(p));
  return (
    <div className="min-h-screen flex flex-col">
      {!hideChrome && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/training" element={<TrainingPage />} />

                {/* Auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin — any active admin */}
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminPage />
                    </AdminGuard>
                  }
                />

                {/* Super admin only */}
                <Route
                  path="/admin/super"
                  element={
                    <AdminGuard requireSuperAdmin>
                      <SuperAdminPage />
                    </AdminGuard>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;