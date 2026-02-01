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
import MainLayout from "./layouts/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
     
<BrowserRouter>
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Index />} />
      <Route path="/wedding-show" element={<WeddingShowPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/packages" element={<PackagesPage />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
