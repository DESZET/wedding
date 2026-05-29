import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import About from "@/components/About";
import Services from "@/components/Services";
import StatisticsCounter from "@/components/StatisticsCounter";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import ScrollProgress from "@/components/ScrollProgress";

export default function Index() {
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ScrollProgress />
      <Navbar />

      {/* Hero */}
      <section id="home" className="relative z-section-10">
        <Hero />
      </section>

      {/* Why Choose Us */}
      <SectionWrapper id="why" delay={100} threshold={0.1} animationType="fade-in-up" className="z-section-20">
        <WhyChooseUs />
      </SectionWrapper>

      {/* Statistics */}
      <SectionWrapper id="statistics" delay={200} threshold={0.1} animationType="scale-in" className="z-section-30">
        <StatisticsCounter />
      </SectionWrapper>

      {/* About */}
      <SectionWrapper id="about" delay={300} threshold={0.1} animationType="slide-in-left" className="z-section-40">
        <About />
      </SectionWrapper>

      {/* Services */}
      <SectionWrapper id="services" delay={300} threshold={0.1} animationType="fade-in-up" className="z-section-50">
        <Services />
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper id="faq" delay={300} threshold={0.1} animationType="fade-in-up" className="z-section-55">
        <FAQ />
      </SectionWrapper>

      {/* Layanan Lainnya */}
      <SectionWrapper id="other-services" delay={200} threshold={0.1} animationType="fade-in-up" className="z-section-60">
        <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Layanan Lainnya</h2>
            <p className="text-gray-500 mb-10 max-w-xl mx-auto">
              Kami juga menyediakan layanan Umrah & Haji serta percetakan berkualitas tinggi.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link
                to="/umrah-haji"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <span>Umrah & Haji</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/printing"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <span>Percetakan Digital</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <Footer />
    </div>
  );
}
