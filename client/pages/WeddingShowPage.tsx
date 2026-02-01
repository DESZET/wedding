import PageLoader from "@/components/PageLoader";
import WeddingShow from "@/components/WeddingShow";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function WeddingShowPage() {
  return (
    <div className="min-h-screen bg-background">
    
      <Navbar />
      <div className="pt-16">
        <WeddingShow />
      </div>
      <Footer />
    </div>
  );
}
