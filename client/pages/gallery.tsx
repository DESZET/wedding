import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";
import SectionWrapper from "@/components/SectionWrapper";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <SectionWrapper id="gallery-photos" delay={100} animationType="fade-in-up">
        <Gallery />
      </SectionWrapper>
      <SectionWrapper id="gallery-videos" delay={300} animationType="fade-in-up">
        <VideoShowcase />
      </SectionWrapper>
      <Footer />
    </div>
  );
}
