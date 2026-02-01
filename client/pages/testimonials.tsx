import Navbar from "@/components/Navbar";
import Testimonials from "@/components/Testimonials";
import VideoShowcase from "@/components/VideoShowcase";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BackToTop from "@/components/BackToTop";

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
     <FloatingWhatsApp />
            <BackToTop />
      <section id="video-showcase">
        <VideoShowcase />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <Footer />
    </div>
  );
}
