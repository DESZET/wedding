import { useEffect, useState, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Sparkles, MessageCircle,
  ArrowRight, BookOpen, Check, ShieldCheck, Heart
} from "lucide-react";
import { PackageItem } from "../../shared/api";
import { useSettings } from "../hooks/useSettings";
import WeddingDetailModal from "./WeddingDetailModal";

// Fallback high-resolution photos for packages
const PACKAGE_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80"
];

// Parse images from any DB format
const parseImages = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
    }
    if (trimmed.startsWith('data:')) return [trimmed];
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const getWeddingFallbackImage = (name: string, index = 0) => {
  const n = (name || '').toLowerCase();
  if (n.includes('diamond') || n.includes('royal') || n.includes('luxury')) {
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80';
  } else if (n.includes('platinum') || n.includes('gold')) {
    return 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=80';
  } else if (n.includes('silver')) {
    return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80';
  }
  return PACKAGE_IMAGES[index % PACKAGE_IMAGES.length];
};

// Fallback sample data if API returns empty
const SAMPLE_PACKAGES: PackageItem[] = [
  {
    id: 1,
    name: "Paket Silver Elegance",
    price: 35000000,
    description: "Pilihan ideal untuk pernikahan intimate & sakral bersama keluarga dan kerabat terdekat.",
    highlighted: false,
    features: [
      "Dekorasi Pelaminan 6-8 Meter Fresh Flower",
      "Rias & Gaun Pengantin Akad + Resepsi",
      "Katering Prasmanan 300 Porsi + 2 Gubukan",
      "Dokumentasi Foto & Video Cinematic",
      "Tim Wedding Organizer 6 Orang Hari H"
    ],
    longDescription: "Paket Silver dirancang khusus untuk mewujudkan pernikahan impian dengan sentuhan intimate yang hangat, anggun, dan berkesan tanpa mengesampingkan kualitas vendor kelas premium."
  },
  {
    id: 2,
    name: "Paket Gold Royal Ballroom",
    price: 65000000,
    description: "Paket favorit terpopuler dengan dekorasi megah dan fasilitas lengkap untuk resepsi gedung berkelas.",
    highlighted: true,
    features: [
      "Dekorasi Pelaminan Megah 10-12 Meter + Photobooth 3D",
      "Rias & Gaun Pengantin Premium (Exclusive MUA)",
      "Katering Prasmanan 500 Porsi + 4 Gubukan Favorit",
      "Full Dokumentasi Cinematic, Album Magnetic & Teaser",
      "MC Profesional, Hiburan Musik Akustik & Sound System",
      "Tim Wedding Organizer 8 Orang Full Day"
    ],
    longDescription: "Paket Gold merupakan pilihan terfavorit calon mempelai yang menginginkan pesta megah di gedung / ballroom dengan koordinasi menyeluruh dan vendor premium."
  },
  {
    id: 3,
    name: "Paket Platinum Diamond Luxury",
    price: 110000000,
    description: "Pengalaman pernikahan termewah dengan kustomisasi konsep tanpa batas dan layanan VIP terlengkap.",
    highlighted: false,
    features: [
      "Grand Pelaminan Custom Design 14-18 Meter + Lighting Show",
      "Gaun Pengantin Desainer Terkemuka + Standby MUA Seharian",
      "Katering Prasmanan 800-1000 Porsi + 6 Gubukan Spesial",
      "Drone Aerial Shot, Same Day Edit Video & 2 Album Exclusive",
      "Live Band Orchestra / Akustik + 2 MC Top",
      "Tim Wedding Organizer 12 Orang & Private Bridal Assistant"
    ],
    longDescription: "Paket Platinum menghadirkan kemewahan sejati bagi Anda yang mengidamkan pernikahan spektakuler layaknya perayaan kerajaan dengan kepuasan tanpa kompromi."
  }
];

export default function Packages() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        const data = await response.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPackages(data.data);
        } else {
          setPackages(SAMPLE_PACKAGES);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setPackages(SAMPLE_PACKAGES);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const whatsappNumber = settings["wedding-whatsapp"]
    ? settings["wedding-whatsapp"].replace(/\D/g, "")
    : (settings["whatsapp"] ? settings["whatsapp"].replace(/\D/g, "") : "6285329077987");

  // Scroll to index smoothly
  const scrollToIndex = (index: number) => {
    if (index < 0) index = 0;
    if (index >= packages.length) index = packages.length - 1;
    setCurrentIndex(index);
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: "smooth"
      });
    }
  };

  // Handle manual scroll / swipe detection
  const handleScroll = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      const scrollLeft = carouselRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < packages.length) {
        setCurrentIndex(newIndex);
      }
    }
  };

  const handleOpenDetail = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <section id="packages" className="pt-28 pb-16 px-3 sm:px-6 md:px-8 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">

      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Koleksi Paket Pernikahan Eksklusif</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
            Pilihan Paket <span className="text-gradient">Galeria Wedding</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-light">
            Geser (swipe) ke kiri & kanan untuk melihat paket impian Anda, lalu ketuk untuk membaca detail lengkapnya.
          </p>
        </div>

        {/* Quick Navigation Tabs (Silver / Gold / Platinum / etc) - Responsive Horizontal Scroll Track */}
        <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 mb-6 sm:mb-8">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 min-w-max mx-auto px-2">
            {packages.map((pkg, idx) => (
              <button
                key={pkg.id || idx}
                onClick={() => scrollToIndex(idx)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${currentIndex === idx
                    ? "bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                  }`}
              >
                <span>{pkg.name.replace(/Paket\s+/i, '')}</span>
                {pkg.highlighted && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">POPULER</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile-First Big Showcase Box Carousel */}
        <div className="relative">

          {/* Left / Right Floating Arrow Controls (Hidden on mobile to prevent overlapping content, visible on tablet/desktop) */}
          {packages.length > 1 && (
            <>
              <button
                onClick={() => scrollToIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
                className={`hidden sm:flex absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xl items-center justify-center transition-all ${currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                  }`}
                aria-label="Paket Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </button>

              <button
                onClick={() => scrollToIndex(currentIndex + 1)}
                disabled={currentIndex === packages.length - 1}
                className={`hidden sm:flex absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xl items-center justify-center transition-all ${currentIndex === packages.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                  }`}
                aria-label="Paket Selanjutnya"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </button>
            </>
          )}

          {/* Swipeable Container */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-3xl touch-pan-x"
            style={{ scrollBehavior: "smooth" }}
          >
            {packages.map((pkg, idx) => {
              const imgs = parseImages(pkg.images);
              const bgImage = (imgs && imgs.length > 0) ? imgs[0] : getWeddingFallbackImage(pkg.name, idx);

              return (
                <div
                  key={pkg.id || idx}
                  className="w-full flex-shrink-0 snap-center p-1 sm:p-2"
                >
                  <div
                    onClick={() => handleOpenDetail(pkg)}
                    className="group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-950 border border-white/15 shadow-2xl transition-all duration-500 hover:border-amber-400/50"
                  >
                    {/* Big Showcase Visual Image */}
                    <div className="relative h-[440px] sm:h-[480px] md:h-[540px] w-full overflow-hidden">
                      <img
                        src={bgImage}
                        alt={pkg.name}
                        className="w-full h-full object-cover brightness-[0.75] group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Gradient Overlays for high readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                        <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{pkg.name}</span>
                        </span>

                        {pkg.highlighted && (
                          <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-primary text-slate-950 font-black text-xs shadow-lg uppercase tracking-wider">
                            ★ PILIHAN TERBAIK
                          </span>
                        )}
                      </div>

                      {/* Content Overlay (Bottom) */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-10 space-y-4">

                        {/* Price Badge */}
                        <div>
                          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                            Mulai Dari
                          </span>
                          <div className="text-3xl sm:text-5xl font-serif font-extrabold text-amber-400 tracking-tight">
                            {formatPrice(pkg.price)}
                          </div>
                        </div>

                        {/* Short Teaser Description */}
                        <p className="text-sm sm:text-base text-slate-200 line-clamp-2 max-w-2xl font-light leading-relaxed">
                          {pkg.description || "Layanan pernikahan lengkap all-in terkoordinasi dengan vendor berkualitas tinggi."}
                        </p>

                        {/* 3 Key Feature Pills */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(pkg.features || []).slice(0, 3).map((feat, fIdx) => (
                            <span
                              key={fIdx}
                              className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5"
                            >
                              <Check className="w-3 h-3 text-amber-400 flex-shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-none">{feat}</span>
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

                          {/* Main Trigger: Detail Selengkapnya */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(pkg);
                            }}
                            className="relative group/btn overflow-hidden flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-primary to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="absolute inset-0 w-1/2 h-full bg-white/30 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out" />
                            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950/20" />
                            <span className="tracking-wide">Detail Selengkapnya</span>
                            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                          </button>

                          {/* Quick WhatsApp Consultation */}
                          <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                              (settings["wedding-whatsapp-pkg-message"] || "Halo Galeria Wedding! Saya ingin konsultasi mengenai paket {packageName} seharga {packagePrice}.")
                                .replace("{packageName}", pkg.name)
                                .replace("{packagePrice}", formatPrice(pkg.price))
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="py-3.5 sm:py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5 text-emerald-400" />
                            <span>Konsultasi WA</span>
                          </a>

                        </div>

                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Dots Pagination Indicator & Mobile Controls */}
        <div className="flex items-center justify-between sm:justify-center gap-3 mt-6 px-1">
          <button
            onClick={() => scrollToIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            aria-label="Paket Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 text-primary" />
            <span>Sebelumnya</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 overflow-x-auto max-w-[150px] px-1 py-1">
            {packages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === idx
                    ? "w-8 bg-primary"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => scrollToIndex(currentIndex + 1)}
            disabled={currentIndex === packages.length - 1}
            className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
            aria-label="Paket Selanjutnya"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Helpful Swipe Hint for Mobile */}
        <p className="text-center text-xs text-muted-foreground mt-3 sm:hidden">
          ← Geser layar ke kiri atau kanan untuk memilih paket →
        </p>

      </div>

      {/* Interactive Article-Style Wedding Detail Modal */}
      <WeddingDetailModal
        pkg={selectedPackage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </section>
  );
}
