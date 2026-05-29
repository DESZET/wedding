import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, Phone, Mail, Clock, MessageCircle, Navigation, ExternalLink, Sparkles 
} from "lucide-react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { useSettings } from "@/hooks/useSettings";

export default function Index() {
  const { settings } = useSettings();

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, []);

  // Fetch dynamic variables from settings
  const address  = settings["address"]   || "Jl. Contoh No. 123, Purwokerto, Jawa Tengah";
  const phone    = settings["phone"]     || "+62 812 3456 7890";
  const email    = settings["email"]     || "info@galeriawedding.com";
  const wa       = (settings["whatsapp"] || phone).replace(/\D/g, "");
  const siteName = settings["site-name"] || "Galeria Wedding";

  const mapsQuery     = encodeURIComponent(settings["maps-query"] || address);
  const mapsEmbedUrl  = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  const mapsDirectUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const contacts = [
    { icon: <Phone className="w-5 h-5 text-primary" />, label: "Telepon", value: phone, href: `tel:${phone}` },
    { icon: <MessageCircle className="w-5 h-5 text-green-500" />, label: "WhatsApp", value: `+${wa}`, href: `https://wa.me/${wa}` },
    { icon: <Mail className="w-5 h-5 text-blue-500" />, label: "Email", value: email, href: `mailto:${email}` }
  ];

  const hours = [
    { day: "Senin – Jumat", time: settings["hours-weekday"]  || "08.00 – 17.00 WIB" },
    { day: "Sabtu",         time: settings["hours-saturday"] || "08.00 – 15.00 WIB" },
    { day: "Minggu / Libur",time: settings["hours-sunday"]   || "Tutup" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* 1. Hero Section */}
      <section id="home" className="relative z-section-10">
        <Hero />
      </section>

      {/* 2. About Section (Siapa itu Galeria Wedding) */}
      <SectionWrapper id="about" delay={150} threshold={0.1} animationType="slide-in-left" className="z-section-20">
        <About />
      </SectionWrapper>

      {/* 4. Elegant Contact & Location Section (Info Kontak Utama) */}
      <SectionWrapper id="home-contact" delay={250} threshold={0.1} animationType="fade-in-up" className="z-section-40">
        <div className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white relative">
          
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-40 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4 border border-primary/20">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Lokasi & Kontak Resmi</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4">Temukan & Hubungi Kami</h2>
              <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed font-light">
                Kunjungi kantor kami atau hubungi tim administrasi kami secara langsung untuk memulai konsultasi Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              
              {/* Left Column: Contact Cards, Address & Hours */}
              <div className="flex flex-col justify-between gap-6">
                
                {/* Office Address Card */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary flex-shrink-0 shadow-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold block mb-1">Alamat Kantor</span>
                      <p className="text-lg text-white font-medium mb-3 leading-snug">{address}</p>
                      <a 
                        href={mapsDirectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/95 font-semibold transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Petunjuk Arah Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Grid Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {contacts.map((c, i) => (
                    <a
                      key={i}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center text-center p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all h-full"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {c.icon}
                      </div>
                      <span className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">{c.label}</span>
                      <span className="text-sm text-white font-medium break-all leading-tight">{c.value}</span>
                    </a>
                  ))}
                </div>

                {/* Work Hours Card */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-white tracking-wide">Jam Operasional Kantor</h4>
                  </div>
                  <div className="space-y-3">
                    {hours.map((h, i) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-400 font-medium">{h.day}</span>
                        <span className="text-white font-semibold">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Google Maps Embed Container */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[380px] lg:min-h-full">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-semibold text-white tracking-wide">{siteName}</span>
                </div>
                <iframe
                  title={`Lokasi ${siteName}`}
                  src={mapsEmbedUrl}
                  width="100%" 
                  height="100%"
                  style={{ border: 0, minHeight: "380px" }}
                  allowFullScreen 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

            </div>

          </div>
        </div>
      </SectionWrapper>

      <Footer />
    </div>
  );
}
