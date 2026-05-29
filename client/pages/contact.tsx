import { useRef, useState, useEffect } from "react";
import {
  MapPin, Phone, Mail, Clock, Navigation, ExternalLink,
  MessageCircle, Instagram, Facebook, Youtube,
  Star, CheckCircle2, Quote,
} from "lucide-react";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import { useSettings } from "@/hooks/useSettings";
import { usePageLoader } from "@/hooks/usePageLoader";

export default function ContactPage() {
  const { settings } = useSettings();
  const { isPageLoading } = usePageLoader();
  const mapRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isPageLoading) {
      setIsVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [isPageLoading]);

  const address  = settings["address"]   || "Jl. Contoh No. 123, Purwokerto, Jawa Tengah";
  const phone    = settings["phone"]     || "+62 812 3456 7890";
  const email    = settings["email"]     || "info@galeriawedding.com";
  const wa       = (settings["whatsapp"] || phone).replace(/\D/g, "");
  const siteName = settings["site-name"] || "Galeria Wedding";

  const mapsQuery     = encodeURIComponent(settings["maps-query"] || address);
  const mapsEmbedUrl  = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  const mapsDirectUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const hours = [
    { day: "Senin – Jumat", time: settings["hours-weekday"]  || "08.00 – 17.00 WIB", open: true  },
    { day: "Sabtu",         time: settings["hours-saturday"] || "08.00 – 15.00 WIB", open: true  },
    { day: "Minggu / Libur",time: settings["hours-sunday"]   || "Tutup",              open: false },
  ];

  const contacts = [
    { icon: <Phone       className="w-5 h-5" />, label: "Telepon",   value: phone,  href: `tel:${phone}`,          gradient: "from-green-400 to-emerald-500" },
    { icon: <MessageCircle className="w-5 h-5"/>, label: "WhatsApp", value: `+${wa}`,href: `https://wa.me/${wa}`,   gradient: "from-green-500 to-teal-500"   },
    { icon: <Mail        className="w-5 h-5" />, label: "Email",     value: email,  href: `mailto:${email}`,       gradient: "from-blue-400 to-indigo-500"  },
    { icon: <MapPin      className="w-5 h-5" />, label: "Alamat",    value: address,href: mapsDirectUrl,           gradient: "from-rose-400 to-pink-500"    },
  ];

  const socials = [
    { icon: <Instagram className="w-5 h-5" />, href: settings["instagram"] || "#", label: "Instagram", hover: "hover:bg-pink-500"  },
    { icon: <Facebook  className="w-5 h-5" />, href: settings["facebook"]  || "#", label: "Facebook",  hover: "hover:bg-blue-600"  },
    { icon: <Youtube   className="w-5 h-5" />, href: settings["youtube"]   || "#", label: "YouTube",   hover: "hover:bg-red-500"   },
  ];

  // Form ulasan / testimonial
  const [review, setReview] = useState({ name: "", rating: 5, text: "", date: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testimonialsRefreshKey, setTestimonialsRefreshKey] = useState(0);

  const handleSubmitReview = async () => {
    if (!review.name.trim() || !review.text.trim()) {
      alert("Nama dan ulasan wajib diisi.");
      return;
    }
    setSubmitState("loading");
    try {
      const today = new Date().toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      });
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...review, date: today }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitState("success");
        setReview({ name: "", rating: 5, text: "", date: "" });
        // Trigger Testimonials re-fetch agar langsung tampil
        setTestimonialsRefreshKey(k => k + 1);
      } else {
        setSubmitState("error");
      }
    } catch {
      setSubmitState("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 pt-28 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
          <MessageCircle className="w-4 h-4" />
          Kami siap membantu
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Hubungi &amp; Temukan Kami
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Konsultasikan pernikahan impian Anda bersama tim profesional kami — gratis dan tanpa komitmen.
        </p>
      </div>

      {/* Kontak + Peta + Form */}
      <div ref={mapRef} className="py-20 px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Baris atas: Info kontak + Peta */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Kiri: kartu kontak + jam + sosmed */}
            <div
              className={`flex flex-col gap-5 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
            >
              {/* Kartu kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contacts.map((c, i) => (
                  <a
                    key={i}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {c.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{c.label}</p>
                      <p className="text-sm text-white font-medium break-words leading-snug">{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Jam operasional */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h4 className="font-semibold text-white">Jam Operasional</h4>
                </div>
                <div className="space-y-3">
                  {hours.map((h, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{h.day}</span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        h.open
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sosmed + tombol arah */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-5 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Ikuti Kami</p>
                  <div className="flex gap-3">
                    {socials.map((s, i) => (
                      <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                        aria-label={s.label}
                        className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white transition-all hover:scale-110 ${s.hover}`}
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
                <a
                  href={mapsDirectUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 transition-all text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Petunjuk Arah
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* Kanan: Google Maps */}
            <div
              className={`transition-all duration-700 delay-150 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative h-full min-h-[400px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">{siteName}</span>
                </div>
                <iframe
                  title={`Lokasi ${siteName}`}
                  src={mapsEmbedUrl}
                  width="100%" height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Baris bawah: Form ulasan */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white/5 border border-white/10">

              {submitState === "success" ? (
                /* Sukses */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Terima Kasih!</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Ulasan Anda telah berhasil dikirim dan sudah tampil di halaman testimonial.
                  </p>
                  <button
                    onClick={() => setSubmitState("idle")}
                    className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition text-sm"
                  >
                    Tulis Ulasan Lagi
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                      <Quote className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Bagikan Pengalaman Anda</h2>
                      <p className="text-gray-400 text-xs">Ulasan Anda sangat berarti bagi kami</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    {/* Nama */}
                    <input
                      type="text"
                      placeholder="Nama Lengkap *"
                      value={review.name}
                      onChange={e => setReview({ ...review, name: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/60 focus:bg-white/15 transition"
                    />

                    {/* Rating bintang */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rating</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setReview({ ...review, rating: star })}
                            className="transition-transform hover:scale-125"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoverRating || review.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-400 self-center">
                          {["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"][hoverRating || review.rating]}
                        </span>
                      </div>
                    </div>

                    {/* Ulasan */}
                    <textarea
                      placeholder="Ceritakan pengalaman pernikahan Anda bersama kami... *"
                      rows={4}
                      value={review.text}
                      onChange={e => setReview({ ...review, text: e.target.value })}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/60 focus:bg-white/15 transition resize-none"
                    />

                    {submitState === "error" && (
                      <p className="text-red-400 text-sm">Gagal mengirim ulasan. Silakan coba lagi.</p>
                    )}

                    <button
                      onClick={handleSubmitReview}
                      disabled={submitState === "loading"}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 rounded-xl font-semibold shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Star className="w-5 h-5 fill-slate-900" />
                      {submitState === "loading" ? "Mengirim..." : "Kirim Ulasan"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      <Testimonials refreshKey={testimonialsRefreshKey} />
      <FAQ />

      <Footer />
    </div>
  );
}
