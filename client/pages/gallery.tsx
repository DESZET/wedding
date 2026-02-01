import Navbar from "@/components/Navbar";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BackToTop from "@/components/BackToTop";

export default function GalleryPage() {
  return (
    <>
    <BackToTop/>
    <FloatingWhatsApp/>
      <Navbar />
      <Gallery />
      <Footer />
    </>
  );
}
