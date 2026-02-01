import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import About from "@/components/About";
import Services from "@/components/Services";
import StatisticsCounter from "@/components/StatisticsCounter";
import FAQ from "@/components/FAQ";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section id="home">
        <Hero />
      </section>

      <section id="about">
        <About />
      </section>

      <section id="why">
        <WhyChooseUs />
      </section>

      <section id="statistics">
        <StatisticsCounter />
      </section>

      <section id="faq">
        <FAQ />
      </section>

      <section id="contact">
        <Services />
      </section>

      <section id="booking">
        <BookingForm />
      </section>

      <Footer />
    </div>
  );
}
