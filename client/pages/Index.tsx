import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProblemsSolutions from "@/components/ProblemsSolutions";
import About from "@/components/About";
import WhyChooseUs from "@/components/WhyChooseUs";
import WeddingShow from "@/components/WeddingShow";
import Gallery from "@/components/Gallery";
import Packages from "@/components/Packages";
import Services from "@/components/Services";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProblemsSolutions />
      <About />
      <WhyChooseUs />
      <WeddingShow />
      <Gallery />
      <Packages />
      <Services />
      <BookingForm />
      <Footer />
    </div>
  );
}
