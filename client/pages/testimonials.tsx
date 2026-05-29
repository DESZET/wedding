import Testimonials from "@/components/Testimonials";
import VideoShowcase from "@/components/VideoShowcase";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper id="video-showcase-section" delay={100} animationType="fade-in-up">
        <VideoShowcase />
      </SectionWrapper>

      <SectionWrapper id="testimonials-section" delay={300} animationType="fade-in-up">
        <Testimonials />
      </SectionWrapper>

      <Footer />
    </div>
  );
}
