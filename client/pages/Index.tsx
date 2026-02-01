import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
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
      <About />
      <Gallery />
      <Packages />
      <Services />
      <BookingForm />
      <Footer />
    </div>
  );
}
