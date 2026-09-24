import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";
import VideoShowcase from "@/components/VideoShowcase";
import SectionWrapper from "@/components/SectionWrapper";

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Video dulu — lebih menarik perhatian, tidak perlu scroll jauh */}
      <SectionWrapper id="gallery-videos" delay={100} animationType="fade-in-up">
        <VideoShowcase />
      </SectionWrapper>
      <SectionWrapper id="gallery-photos" delay={200} animationType="fade-in-up">
        <Gallery />
      </SectionWrapper>
      <Footer />
    </div>
  );
}
