import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import About from "@/components/About";
import Services from "@/components/Services";
import StatisticsCounter from "@/components/StatisticsCounter";
import FAQ from "@/components/FAQ";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import ScrollProgress from "@/components/ScrollProgress";

export default function Index() {
  useEffect(() => {
    // Scroll to top on page load
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      <Navbar />

      {/* Hero Section - No wrapper needed */}
      <section 
        id="home" 
        className="relative z-section-10"
      >
        <Hero />
      </section>

      {/* Why Choose Us - Appears on scroll */}
      <SectionWrapper 
        id="why" 
        delay={100}
        threshold={0.1}
        animationType="fade-in-up"
        className="z-section-20"
      >
        <WhyChooseUs />
      </SectionWrapper>

      {/* Statistics - Appears later */}
      <SectionWrapper 
        id="statistics" 
        delay={200}
        threshold={0.1}
        animationType="scale-in"
        className="z-section-30"
      >
        <StatisticsCounter />
      </SectionWrapper>

      {/* About - Appears even later */}
      <SectionWrapper 
        id="about" 
        delay={300}
        threshold={0.1}
        animationType="slide-in-left"
        className="z-section-40"
      >
        <About />
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper 
        id="faq" 
        delay={400}
        threshold={0.1}
        animationType="fade-in-up"
        className="z-section-50"
      >
        <FAQ />
      </SectionWrapper>

      {/* Services/Contact */}
      <SectionWrapper 
        id="contact" 
        delay={500}
        threshold={0.1}
        animationType="slide-in-right"
        className="z-section-60"
      >
        <Services />
      </SectionWrapper>

      {/* Booking Form - Last section */}
      <SectionWrapper 
        id="booking" 
        delay={600}
        threshold={0.1}
        animationType="fade-in-up"
        className="z-section-70"
      >
        <BookingForm />
      </SectionWrapper>

      <Footer />
    </div>
  );
}