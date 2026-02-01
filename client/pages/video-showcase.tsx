import Navbar from "@/components/Navbar";
import VideoShowcase from "@/components/VideoShowcase";
import Footer from "@/components/Footer";

export default function VideoShowcasePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <VideoShowcase />
      <Footer />
    </div>
  );
}
