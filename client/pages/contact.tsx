import Navbar from "@/components/Navbar";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FAQ />
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Get in touch with us for your wedding planning needs
          </p>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-muted-foreground">
              Contact information and forms will be added here.
            </p>
          </div>
        </div>
      </div>
      <FloatingWhatsApp />
      <BackToTop />
      <Footer />
    </div>
  );
}
