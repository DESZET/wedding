import PageLoader from "@/components/PageLoader";
import Packages from "@/components/Packages";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageLoader />
      <Navbar />
      <div className="pt-16">
         
        <Packages />
            <Timeline />
      </div>
      <Footer />
    </div>
  );
}
