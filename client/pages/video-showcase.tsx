import VideoShowcase from "@/components/VideoShowcase";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";

export default function VideoShowcasePage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <SectionWrapper id="video-showcase-content" delay={100} animationType="fade-in-up">
        <VideoShowcase />
      </SectionWrapper>
      <Footer />
    </div>
  );
}
