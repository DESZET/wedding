import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WeddingShowPage from "./pages/WeddingShowPage";
import GalleryPage from "./pages/gallery";
import PackagesPage from "./pages/PackagesPage";
import TestimonialsPage from "./pages/testimonials";
import ContactPage from "./pages/contact";
import UmrahHaji from "./pages/UmrahHaji";
import Printing from "./pages/Printing";
import MainLayout from "./layouts/MainLayout";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BackToTop from "@/components/BackToTop";
import Admin from "./pages/admin";
import LoginPage from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";
import { SettingsProvider } from "./hooks/useSettings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <FloatingWhatsApp />
        <BackToTop />

        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/wedding-show" element={<WeddingShowPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/umrah-haji" element={<UmrahHaji />} />
              <Route path="/printing" element={<Printing />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>
            <Route path="/login" element={<LoginPage />} />
            {/* Admin Route (Protected) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
