import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import { PageLoaderProvider } from "@/hooks/usePageLoader";
import PageLoader from "@/components/PageLoader";
import ScrollProgress from "@/components/ScrollProgress";

export default function MainLayout() {
  return (
    <PageLoaderProvider>
      <ScrollProgress />
      <PageLoader />
      <Navbar />
      <Outlet />
    </PageLoaderProvider>
  );
}
