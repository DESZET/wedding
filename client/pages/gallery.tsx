import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BackToTop from "@/components/BackToTop";
import VideoShowcase from "@/components/VideoShowcase";

export default function GalleryPage() {
  return (
    <>
    <BackToTop/>
    <FloatingWhatsApp/>
      <Navbar />
      <Gallery />
      <VideoShowcase />
      <Footer />
    </>
  );
}
