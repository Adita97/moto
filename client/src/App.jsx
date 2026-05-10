import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Toast from "./components/ui/Toast";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

import HomePage from "./pages/public/HomePage";
import MyBikePage from "./pages/public/MyBikePage";
import VideosPage from "./pages/public/VideosPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import VideoManagerPage from "./pages/admin/VideoManagerPage";
import BikeManagerPage from "./pages/admin/BikeManagerPage";

import useAuthStore from "./store/authStore";
import useThemeStore from "./store/themeStore";
import { authApi } from "./api/auth.api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Loader className="animate-spin text-accent" size={32} />
    </div>
  );
}

function AppContent() {
  const { t } = useTranslation();
  const { setAuth, clearAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Attempt silent refresh on app load
  useEffect(() => {
    authApi
      .refresh()
      .then((data) => setAuth(data.accessToken, data.user))
      .catch(() => clearAuth());
  }, [setAuth, clearAuth]);

  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">
        {t("accessibility.skipToContent")}
      </a>
      <Navbar />
      <main id="main-content">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/my-bike" element={<MyBikePage />} />
            <Route path="/videos" element={<VideosPage />} />

            {/* Admin */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="videos" element={<VideoManagerPage />} />
                <Route path="bikes" element={<BikeManagerPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <Toast />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <AppContent />
      </Suspense>
    </QueryClientProvider>
  );
}
