import WeddingShow from "@/components/WeddingShow";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";

export default function WeddingShowPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <SectionWrapper id="wedding-header" delay={100} animationType="fade-in-up">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 pt-28 pb-12 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Wedding Show
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Inspirasi dan dokumentasi pernikahan terbaik pilihan kami
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper id="wedding-content" delay={200} animationType="fade-in-up">
        <WeddingShow />
      </SectionWrapper>
      <Footer />
    </div>
  );
}
