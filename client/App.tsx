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
import MainLayout from "./layouts/MainLayout";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BackToTop from "@/components/BackToTop";
import AdminPanel from "./pages/admin";
import ProtectedRoute from "./components/ProtectedRoute";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>
  {/* Admin Route (Protected) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
