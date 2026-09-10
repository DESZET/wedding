import React, { useState } from "react";
import { 
  X, Sparkles, Check, Heart, MessageCircle, Phone, Calendar, 
  Users, Award, Gift, Clock, ShieldCheck, ChevronRight, Share2,
  Camera, Music, Palette, Utensils, Scissors, Eye, ChevronDown,
  Building2, CheckCircle2, Star, ArrowRight
} from "lucide-react";
import { PackageItem } from "../../shared/api";
import { useSettings } from "../hooks/useSettings";

interface WeddingDetailModalProps {
  pkg: PackageItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WeddingDetailModal({ pkg, isOpen, onClose }: WeddingDetailModalProps) {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<"overview" | "vendors" | "bonus" | "terms">("overview");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [expandedVendor, setExpandedVendor] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pkg) return null;

  const whatsappNumber = settings["wedding-whatsapp"] 
    ? settings["wedding-whatsapp"].replace(/\D/g, "") 
    : (settings["whatsapp"] ? settings["whatsapp"].replace(/\D/g, "") : "6285329077987");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Paket Wedding: ${pkg.name} - Galeria Wedding`,
        text: `Lihat detail paket pernikahan mewah ${pkg.name} seharga ${formatPrice(pkg.price)} di Galeria Wedding!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const waMessage = (settings["wedding-whatsapp-pkg-message"] || "Halo Galeria Wedding! Saya ingin berkonsultasi mengenai paket pernikahan {packageName} seharga {packagePrice}. Bisakah kita diskusi lebih lanjut mengenai ketersediaan tanggal dan detailnya?")
    .replace("{packageName}", pkg.name)
    .replace("{packagePrice}", formatPrice(pkg.price));

  const getPackageImages = () => {
    if (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) {
      return pkg.images;
    }
    const name = pkg.name.toLowerCase();
    if (name.includes("diamond") || name.includes("royal") || name.includes("luxury")) {
      return [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80"
      ];
    } else if (name.includes("platinum") || name.includes("gold")) {
      return [
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
      ];
    } else {
      return [
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80"
      ];
    }
  };

  const packageImages = getPackageImages();

  const getVendorIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("rias") || t.includes("mua") || t.includes("busana")) return <Scissors className="w-5 h-5 text-amber-500" />;
    if (t.includes("dekor") || t.includes("pelaminan") || t.includes("hall")) return <Palette className="w-5 h-5 text-amber-500" />;
    if (t.includes("katering") || t.includes("makan") || t.includes("prasmanan")) return <Utensils className="w-5 h-5 text-amber-500" />;
    if (t.includes("foto") || t.includes("video") || t.includes("dokumentasi")) return <Camera className="w-5 h-5 text-amber-500" />;
    if (t.includes("mc") || t.includes("musik") || t.includes("sound") || t.includes("akustik")) return <Music className="w-5 h-5 text-amber-500" />;
    if (t.includes("wo") || t.includes("organizer") || t.includes("kru")) return <Users className="w-5 h-5 text-amber-500" />;
    return <Sparkles className="w-5 h-5 text-amber-500" />;
  };

  const defaultVendorBreakdown = [
    {
      icon: <Scissors className="w-5 h-5 text-amber-500" />,
      title: "Tata Rias & Busana Pengantin (MUA)",
      badge: "MUA Berpengalaman",
      items: [
        "Rias & Gaun Pengantin Akad + Resepsi (Exclusive MUA)",
        "Rias & Busana 2 Pasang Ibu & Besan",
        "Busana & Kain 2 Pasang Bapak & Besan",
        "Rias & Busana 4 Orang Pagar Ayu / Among Tamu",
        "Retouch makeup & standby MUA selama acara berlangsung"
      ]
    },
    {
      icon: <Palette className="w-5 h-5 text-amber-500" />,
      title: "Dekorasi Pelaminan & Wedding Hall",
      badge: "Custom Floral Theme",
      items: [
        "Pelaminan Mewah Modern / Tradisional (Lebar 8 - 12 Meter)",
        "Rangkaian Fresh Flowers & Premium Artificial Flowers",
        "Karpet Jalan Rose Petal & Panggung Musik / Akustik",
        "Dekorasi Meja Akad & Meja Prasmanan VIP",
        "Photobooth Eksklusif 3D + Gazebo Pintu Masuk"
      ]
    },
    {
      icon: <Utensils className="w-5 h-5 text-amber-500" />,
      title: "Katering & Prasmanan Premium",
      badge: "Test Food 6 Orang",
      items: [
        "Menu Utama Lengkap (Nasi, Aneka Daging, Ayam, Sayur, Sup, Dessert)",
        "Aneka Food Stall / Gubukan Favorit (Zuppa Soup, Siomay, Sate, dll.)",
        "Free Flow Aneka Minuman Segar & Soft Drink",
        "Peralatan Katering Mewah & Pelayan Berseragam Rapi",
        "Sesi Food Tasting untuk 6 Orang Sebelum Hari H"
      ]
    },
    {
      icon: <Camera className="w-5 h-5 text-amber-500" />,
      title: "Dokumentasi Foto & Cinematic Film",
      badge: "Full Day Coverage",
      items: [
        "2 Fotografer Profesional + 2 Videografer Cinematic",
        "Liputan Full Day (Akad, Temu Manten, hingga Resepsi Selesai)",
        "1 Album Wedding Magnetic Exclusive + Box Kulit",
        "1 Menit Teaser Instagram + 3-5 Menit Cinematic Film",
        "Semua File Foto Full Resolusi via Flashdisk & Cloud Storage"
      ]
    },
    {
      icon: <Music className="w-5 h-5 text-amber-500" />,
      title: "Master of Ceremony (MC) & Hiburan Musik",
      badge: "Sound 5000W+",
      items: [
        "MC Profesional Bilingual / Tradisional untuk Akad & Resepsi",
        "Band Akustik / Keyboardist + Penyanyi Profesional",
        "Sound System Konser Lengkap (5000 - 10.000 Watt)"
      ]
    },
    {
      icon: <Users className="w-5 h-5 text-amber-500" />,
      title: "Tim Wedding Organizer (WO) Lapangan",
      badge: "Full Kru & HT",
      items: [
        "6 - 10 Orang Kru WO Profesional Berseragam & HT",
        "Penyusunan Rundown, Buku Panduan Acara & Technical Meeting",
        "Pendamping Khusus Pengantin (Bride's Assistant) & Keluarga",
        "Koordinasi Seluruh Vendor dari Pagi Hingga Acara Usai"
      ]
    }
  ];

  const defaultBonuses = [
    { title: "Undangan Digital Website", desc: "Website interaktif dengan fitur RSVP, galeri foto, cerita cinta, dan hitung mundur." },
    { title: "2 Buku Tamu Hardcover", desc: "Buku tamu eksklusif cetak nama pengantin + spidol emas / perak." },
    { title: "50 Porsi Sarapan Akad", desc: "Hidangan sarapan / coffee break akad nikah untuk keluarga inti." },
    { title: "Hand Bouquet Fresh Flower", desc: "Buket bunga mawar segar impor untuk prosesi lempar bunga." },
    { title: "Voucher Diskon Souvenir 20%", desc: "Voucher potongan harga cetak souvenir / goodie bag di Galeria Printing." }
  ];

  const defaultPaymentSteps = [
    { step: "01", title: "Booking Fee (30%)", desc: "Mengamankan tanggal acara dan pengikatan vendor utama." },
    { step: "02", title: "Termin Kedua (40%)", desc: "Setelah finalisasi konsep dekorasi, menu katering, dan fitting busana (H-30)." },
    { step: "03", title: "Pelunasan (30%)", desc: "Pelunasan dilakukan setelah Technical Meeting bersama seluruh vendor (H-14)." }
  ];

  const getCustomVendorBreakdown = () => {
    if (!pkg.vendor_breakdown) return null;
    let raw = pkg.vendor_breakdown;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) raw = parsed;
      } catch {
        const lines = trimmed.split("\n").map((l: string) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          return lines.map((line: string) => {
            const parts = line.split("|").map((s: string) => s.trim());
            const title = parts[0] || "Layanan Vendor";
            const badge = parts[1] || "Included";
            const items = parts[2] ? parts[2].split(";").map((s: string) => s.trim()).filter(Boolean) : [];
            return {
              icon: getVendorIcon(title),
              title,
              badge,
              items: items.length > 0 ? items : [title]
            };
          });
        }
      }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((v: any) => ({
        icon: getVendorIcon(v.title || ""),
        title: v.title || "Layanan Vendor",
        badge: v.badge || "Included",
        items: Array.isArray(v.items) 
          ? v.items 
          : (typeof v.items === "string" ? v.items.split(";").map((s: string) => s.trim()).filter(Boolean) : [v.title || "Included"])
      }));
    }
    return null;
  };

  const getCustomBonuses = () => {
    if (!pkg.bonuses) return null;
    let raw = pkg.bonuses;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) raw = parsed;
      } catch {
        const lines = trimmed.split("\n").map((l: string) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          return lines.map((line: string) => {
            const [title, ...descParts] = line.split("|").map((s: string) => s.trim());
            return {
              title: title || "Bonus",
              desc: descParts.join(" | ") || ""
            };
          });
        }
      }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((b: any) => ({
        title: b.title || b.name || "Bonus",
        desc: b.desc || b.description || ""
      }));
    }
    return null;
  };

  const getCustomPaymentSteps = () => {
    if (!pkg.payment_steps) return null;
    let raw = pkg.payment_steps;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) raw = parsed;
      } catch {
        const lines = trimmed.split("\n").map((l: string) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          return lines.map((line: string, idx: number) => {
            const parts = line.split("|").map((s: string) => s.trim());
            if (parts.length >= 3) {
              return {
                step: parts[0] || `0${idx + 1}`,
                title: parts[1] || "",
                desc: parts.slice(2).join(" | ")
              };
            } else if (parts.length === 2) {
              return {
                step: `0${idx + 1}`,
                title: parts[0],
                desc: parts[1]
              };
            }
            return {
              step: `0${idx + 1}`,
              title: line,
              desc: ""
            };
          });
        }
      }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((s: any, idx: number) => ({
        step: s.step || `0${idx + 1}`,
        title: s.title || "",
        desc: s.desc || s.description || ""
      }));
    }
    return null;
  };

  const vendorBreakdown = getCustomVendorBreakdown() || defaultVendorBreakdown;
  const bonuses = getCustomBonuses() || defaultBonuses;
  const paymentSteps = getCustomPaymentSteps() || defaultPaymentSteps;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 animate-fade-in">
      
      {/* Outer Container with perfectly balanced height on mobile and laptop */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-scale-in text-slate-800">
        
        {/* Sleek Top Glassmorphic Bar */}
        <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
                {pkg.name}
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                {formatPrice(pkg.price)} • All-In Wedding Package
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
              title="Bagikan paket"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-rose-500 text-slate-200 hover:text-white transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container containing Header + Content seamlessly */}
        <div className="flex-grow overflow-y-auto scrollbar-thin">
          
          {/* Compact Luxury Header Banner (Optimized height ~200px so content is never cut off!) */}
          <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-slate-950 flex-shrink-0">
            <img
              src={packageImages[activeImageIdx]}
              alt={pkg.name}
              className="w-full h-full object-cover brightness-[0.75] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                    {pkg.highlighted ? "★ PILIHAN UTAMA" : "PAKET WEDDING"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium text-slate-200">
                    Vendor Terkoordinasi Penuh
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-extrabold text-white leading-tight">
                  {pkg.name}
                </h2>
              </div>

              {/* Image selector thumbnails on desktop & tablet */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 p-1.5 rounded-xl backdrop-blur-md border border-white/10">
                {packageImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? "border-amber-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Tab Switcher */}
          <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-3 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none py-2.5 shadow-sm">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-slate-900 text-amber-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>📖 Ringkasan & Konsep</span>
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "vendors"
                  ? "bg-slate-900 text-amber-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>🌸 Fasilitas Vendor ({vendorBreakdown.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("bonus")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "bonus"
                  ? "bg-slate-900 text-amber-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>🎁 Bonus Gratis</span>
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "terms"
                  ? "bg-slate-900 text-amber-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>💳 Alur Pembayaran</span>
            </button>
          </div>

          {/* Tab Content Section */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Intro Story */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border border-amber-200/70 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Konsep Pernikahan Impian</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 mb-3 leading-snug">
                    Momen Sakral Penuh Makna Bersama {pkg.name}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                    {pkg.longDescription || pkg.description || "Paket pernikahan ini dirancang secara khusus untuk calon mempelai yang menginginkan prosesi pernikahan yang sakral, megah, dan berkesan tanpa perlu repot mengoordinasikan puluhan vendor secara terpisah. Seluruh elemen—mulai dari tata rias pengantin, dekorasi pelaminan, katering berkelas, hingga tim koordinator hari H—kami tangani secara menyeluruh dengan standar mutu terbaik."}
                  </p>
                </div>

                {/* Quick Highlights Grid */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Keunggulan yang Anda Dapatkan:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(pkg.features && pkg.features.length > 0 ? pkg.features : [
                      "Dekorasi Pelaminan Megah & Fresh Flowers",
                      "Rias & Gaun Pengantin Akad + Resepsi",
                      "Katering Lengkap + Aneka Gubukan",
                      "Dokumentasi Foto & Video Cinematic",
                      "Tim Wedding Organizer Profesional Hari H"
                    ]).map((feat, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 hover:border-amber-300 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                          ✓
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-700">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Consultation CTA Card */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <div>
                    <h5 className="font-bold text-sm sm:text-base mb-1">Ingin Kustomisasi Tema / Jumlah Tamu?</h5>
                    <p className="text-xs text-slate-300">Konsultasikan konsep pernikahan Anda dengan wedding planner profesional kami tanpa biaya.</p>
                  </div>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs whitespace-nowrap transition-all text-center flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Diskusi via WhatsApp</span>
                  </a>
                </div>

              </div>
            )}

            {/* TAB 2: VENDORS */}
            {activeTab === "vendors" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Daftar Layanan Vendor Terkoordinasi
                  </h3>
                  <span className="text-xs text-slate-500">Klik untuk melihat rincian item</span>
                </div>

                <div className="space-y-3">
                  {vendorBreakdown.map((sec, idx) => {
                    const isExpanded = expandedVendor === idx;
                    return (
                      <div 
                        key={idx}
                        className="rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 bg-white shadow-sm hover:border-amber-300"
                      >
                        <button
                          onClick={() => setExpandedVendor(isExpanded ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                              {sec.icon}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{sec.title}</h4>
                              <span className="text-[11px] text-amber-700 font-semibold">{sec.badge}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-400 hidden sm:inline">{sec.items.length} Item</span>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-amber-600" : ""}`} />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 pt-2 border-t border-slate-100 bg-white space-y-2 animate-slide-up">
                            {sec.items.map((item, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: BONUS */}
            {activeTab === "bonus" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-8 h-8 text-amber-200 animate-bounce" />
                    <h3 className="text-xl sm:text-2xl font-serif font-bold">Bonus Spesial Pemesanan</h3>
                  </div>
                  <p className="text-amber-100 text-xs sm:text-sm mb-5">
                    Khusus pemesanan paket <strong>{pkg.name}</strong> bulan ini, Anda berhak mendapatkan seluruh benefit gratis berikut:
                  </p>

                  <div className="space-y-3">
                    {bonuses.map((bonus, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-white text-amber-700 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{bonus.title}</h4>
                          <p className="text-xs text-amber-100 font-light">{bonus.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TERMS & PAYMENT */}
            {activeTab === "terms" && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Alur Pemesanan & Pembayaran</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Sistem pembayaran fleksibel dan transparan untuk kenyamanan Anda.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {paymentSteps.map((step, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                      <span className="absolute -top-2 -right-2 text-5xl font-serif font-black text-slate-200 select-none">
                        {step.step}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center mb-3">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs sm:text-sm flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Setiap transaksi dilindungi oleh Surat Perjanjian Kerja Sama (SPK) resmi bermaterai yang menjamin seluruh daftar vendor dan spesifikasi dekorasi/katering terpenuhi secara presisi.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Sleek Fixed Bottom Action Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 shadow-2xl">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Investasi Pernikahan</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-serif leading-tight">
              {formatPrice(pkg.price)}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-3 rounded-full border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs sm:text-sm transition-colors"
            >
              Tutup
            </button>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 to-primary hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl hover:shadow-amber-400/20 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950 text-white" />
              <span>Konsultasi & Amankan Tanggal</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
