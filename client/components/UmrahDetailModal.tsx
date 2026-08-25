import React, { useState } from "react";
import { 
  X, Plane, Hotel, Calendar, MapPin, Check, Shield, Clock, 
  Users, Gift, Award, Share2, MessageCircle, FileText, 
  Download, ArrowRight, BookOpen, Coffee, Sparkles, ChevronDown,
  ShieldCheck
} from "lucide-react";
import { useSettings } from "../hooks/useSettings";

interface UmrahDetailModalProps {
  pkg: any | null;
  isOpen: boolean;
  onClose: () => void;
  type: "umrah" | "haji";
}

export default function UmrahDetailModal({ pkg, isOpen, onClose, type }: UmrahDetailModalProps) {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "hotel" | "inclusions" | "terms">("overview");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!isOpen || !pkg) return null;

  const whatsappNumber = settings["umrah-whatsapp"] 
    ? settings["umrah-whatsapp"].replace(/\D/g, "") 
    : (settings["whatsapp"] ? settings["whatsapp"].replace(/\D/g, "") : "6285329077987");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const effectivePrice = pkg.discount_price || pkg.price || 0;
  const packageTypeLabel = type === "umrah" ? "Umrah" : "Haji";

  const waMessage = (settings["umrah-booking-message"] || "Halo Galeria Umrah & Haji! Saya tertarik mendaftar {packageType}: {packageName} seharga {packagePrice}. Mohon info ketersediaan seat, jadwal manasik, dan prosedur pendaftarannya.")
    .replace("{packageType}", packageTypeLabel)
    .replace("{packageName}", pkg.name || "")
    .replace("{packagePrice}", formatPrice(effectivePrice));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Paket ${packageTypeLabel}: ${pkg.name}`,
        text: `Lihat rincian paket ${packageTypeLabel} ${pkg.name} seharga ${formatPrice(effectivePrice)} di Galeria Travel!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const packageImages = (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) ? pkg.images : [
    type === "umrah" 
      ? "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80"
  ];

  const defaultItinerary = type === "umrah" ? [
    { day: 1, title: "Keberangkatan Menuju Jeddah / Madinah", desc: "Berkumpul di Bandara Soetta Terminal 3. Briefing Tour Leader, proses imigrasi, dan penerbangan langsung menuju Arab Saudi." },
    { day: 2, title: "Ziarah Kota Madinah & Shalat di Raudhah", desc: "Ziarah Makam Rasulullah SAW, Abu Bakar, Umar bin Khattab, dan masuk Raudhah (Taman Surga) dengan tasreh resmi." },
    { day: 3, title: "Ziarah Luar Madinah (Masjid Quba & Uhud)", desc: "Ziarah ke Masjid Quba (shalat pahala umrah), Jabal Uhud, Masjid Qiblatain, dan Kebun Kurma Madinah." },
    { day: 4, title: "Menuju Makkah & Pelaksanaan Umrah 1", desc: "Mengambil Miqat di Bir Ali, perjalanan Kereta Cepat Haramain ke Makkah, check-in hotel, lalu Thawaf, Sa'i, dan Tahallul." },
    { day: 5, title: "Ibadah Mandiri di Masjidil Haram", desc: "Memperbanyak thawaf sunnah, tilawah Al-Qur'an di depan Ka'bah, serta tausiyah ustadz pembimbing." },
    { day: 6, title: "Ziarah Kota Makkah & Umrah 2 (Miqat Ji'ranah)", desc: "Ziarah Padang Arafah (Jabal Rahmah), Muzdalifah, Mina, dan Jabal Nur (Gua Hira). Mengambil miqat di Ji'ranah." },
    { day: 7, title: "Ziarah Wisata Sejarah Kota Thaif", desc: "Perjalanan ke Kota Thaif yang sejuk, mengunjungi Masjid Ibnu Abbas dan penyulingan parfum mawar." },
    { day: 8, title: "Thawaf Wada' & Kepulangan", desc: "Thawaf perpisahan (Wada') di Masjidil Haram, check-out hotel, menuju Bandara Jeddah untuk terbang ke Jakarta." },
    { day: 9, title: "Tiba di Tanah Air (Jakarta)", desc: "Alhamdulillah rombongan tiba di Jakarta dengan selamat. Pembagian Air Zamzam 5 Liter resmi." }
  ] : [
    { day: 1, title: "Pelepasan Jamaah & Keberangkatan", desc: "Prosesi pelepasan jamaah haji resmi dan penerbangan langsung ke Tanah Suci." },
    { day: 2, title: "Persiapan & Pemantapan Manasik", desc: "Bimbingan intensif manasik haji bersama para ulama dan pembimbing bersertifikasi Kemenag." },
    { day: 3, title: "Puncak Ibadah Haji: Wukuf di Padang Arafah", desc: "Wukuf di tenda VIP Arafah ber-AC. Khutbah wukuf, dzikir, dan doa bersama." },
    { day: 4, title: "Mabit di Muzdalifah & Mengambil Kerikil", desc: "Mabit di Muzdalifah hingga lewat tengah malam dan persiapan menuju Mina." },
    { day: 5, title: "Mabit di Mina & Lempar Jumrah", desc: "Pelaksanaan lempar jumrah dengan pendampingan tim medis dan mutawwif." }
  ];

  const itineraryList = (pkg.itinerary && Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0) ? pkg.itinerary : defaultItinerary;

  const defaultFreeMerchandise = [
    "Koper Fiber Bagasi Eksklusif 24 Inch (Kuat & Roda 360°)",
    "Koper Kabin 20 Inch + Tas Selempang Paspor Anti Maling",
    "Kain Ihram Premium & Sabuk (Pria) / Mukena & Bergo Khusus (Wanita)",
    "Bahan Seragam Batik Eksklusif Jamaah Galeria Travel",
    "Buku Kumpulan Doa Umrah & Manasik Saku",
    "Air Zam-Zam 5 Liter (Resmi dari Kerajaan Arab Saudi)"
  ];

  const defaultAllInIncludes = [
    "Tiket Pesawat PP Internasional Kelas Ekonomi (Direct Saudi Airlines / Garuda)",
    "Akomodasi Hotel Bintang 4 / 5 Dekat Masjidil Haram & Nabawi",
    "Makan 3x Sehari Menu Indonesia (Fullboard Hotel Buffet)",
    "Visa Resmi Umrah / Haji & Asuransi Perjalanan Lengkap",
    "Transportasi Bus AC Eksekutif & Tiket Kereta Cepat Haramain",
    "Bimbingan Mutawwif / Ustadz Berpengalaman dari Tanah Air",
    "City Tour / Ziarah Kota Makkah, Madinah, dan Thaif",
    "Handling Bandara Soetta & Bandara Arab Saudi"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-scale-in text-slate-800">
        
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
                {pkg.name}
              </h3>
              <p className="text-[11px] text-emerald-400 font-medium">
                {formatPrice(effectivePrice)} • {pkg.duration || 9} Hari Program All-In
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

        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto scrollbar-thin">
          
          {/* Compact Header Banner */}
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
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                    {packageTypeLabel} KEMENAG RI
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium text-slate-200">
                    {pkg.airline || "Saudi Airlines Direct"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-extrabold text-white leading-tight">
                  {pkg.name}
                </h2>
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 p-1.5 rounded-xl backdrop-blur-md border border-white/10">
                {packageImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? "border-emerald-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
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
                  ? "bg-slate-900 text-emerald-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>🕋 Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "itinerary"
                  ? "bg-slate-900 text-emerald-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>📅 Itinerary Rundown</span>
            </button>
            <button
              onClick={() => setActiveTab("hotel")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "hotel"
                  ? "bg-slate-900 text-emerald-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>🏨 Hotel & Kereta Cepat</span>
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "inclusions"
                  ? "bg-slate-900 text-emerald-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>🎁 Fasilitas & Perlengkapan</span>
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "terms"
                  ? "bg-slate-900 text-emerald-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>📋 Syarat Dokumen</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border border-emerald-200/80 shadow-sm">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Ibadah Khusyuk & Nyaman</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 mb-3 leading-snug">
                    Menyempurnakan Panggilan ke Baitullah Bersama {pkg.name}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                    {pkg.description || "Rasakan kenyamanan ibadah umrah dengan standar pelayanan premium. Dibimbing langsung oleh ustadz dan mutawwif berpengalaman sesuai Al-Qur'an dan Sunnah, serta menginap di hotel pilihan yang dekat dengan Masjidil Haram dan Masjid Nabawi untuk memudahkan shalat 5 waktu berjamaah."}
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                      <Plane className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Maskapai</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{pkg.airline || "Saudi Airlines / Garuda"}</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Direct Flight</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                      <Hotel className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Hotel Makkah</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{pkg.hotel_mekah || "Hotel Bintang 5 Dekat Ka'bah"}</p>
                    <p className="text-[10px] text-emerald-700 font-medium">{pkg.distance_haram || "±50m ke Pelataran"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                      <Hotel className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Hotel Madinah</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{pkg.hotel_madinah || "Anwar Movenpick / Setaraf"}</p>
                    <p className="text-[10px] text-emerald-700 font-medium">±100m ke Nabawi</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Durasi</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{pkg.duration || 9} Hari Program</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Full Ziarah & Ibadah</p>
                  </div>
                </div>

                {/* Legal & Trust */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm sm:text-base">Izin Resmi PPIU & SISKOPATUH Kemenag</h5>
                      <p className="text-xs text-slate-300">Pemberangkatan bergaransi 5 Pasti Umrah Kementerian Agama RI.</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Cek Seat Tersedia</span>
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: ITINERARY */}
            {activeTab === "itinerary" && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Rundown Kegiatan Hari demi Hari</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-4">Jadwal kegiatan terstruktur demi kenyamanan ibadah dan stamina jamaah.</p>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
                  {itineraryList.map((item: any, idx: number) => (
                    <div key={idx} className="relative flex items-start gap-3.5 pl-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 z-10 shadow-md border-2 border-white">
                        {item.day || idx + 1}
                      </div>
                      <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <h4 className="font-bold text-slate-900 text-sm mb-1">
                          Hari {item.day || idx + 1}: {item.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description || item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: HOTEL */}
            {activeTab === "hotel" && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">HOTEL MAKKAH</span>
                    <h4 className="text-base font-bold text-slate-900">{pkg.hotel_mekah || "Makkah Clock Royal Tower / Setaraf"}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Jarak jalan kaki sangat dekat ({pkg.distance_haram || "±50m"}) memudahkan jamaah shalat 5 waktu di Masjidil Haram.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">HOTEL MADINAH</span>
                    <h4 className="text-base font-bold text-slate-900">{pkg.hotel_madinah || "Anwar Al Madinah Movenpick / Setaraf"}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Dekat gerbang pintu masuk wanita dan pria Masjid Nabawi, aman untuk jamaah lansia dan keluarga.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-bold text-blue-800">
                    <Plane className="w-4 h-4" />
                    <span>Free Kereta Cepat Haramain (Madinah - Makkah)</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    Perjalanan dari Madinah ke Makkah hanya 2 jam menggunakan High Speed Train (300 km/jam), sangat nyaman dan bebas macet.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: INCLUSIONS */}
            {activeTab === "inclusions" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-700 to-slate-900 text-white shadow-xl">
                  <h3 className="text-lg sm:text-xl font-serif font-bold mb-3 flex items-center gap-2">
                    <Gift className="w-6 h-6 text-emerald-300" />
                    <span>Perlengkapan Ibadah Gratis</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {defaultFreeMerchandise.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-emerald-800 text-sm mb-3">Fasilitas Sudah Termasuk (All-In):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    {defaultAllInIncludes.map((inc, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TERMS */}
            {activeTab === "terms" && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Persyaratan Dokumen:</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>• Paspor asli (masa berlaku min. 8 bulan)</li>
                      <li>• Nama di paspor minimal 2 kata</li>
                      <li>• Fotokopi KTP & Kartu Keluarga (KK)</li>
                      <li>• Buku Nikah / Akta Lahir</li>
                      <li>• Pasfoto 4x6 latar putih (2 lembar)</li>
                      <li>• Bukti / Kartu vaksin meningitis</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Alur Pembayaran & Booking:</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li>• <strong>DP Booking Seat:</strong> Rp 5.000.000 / jamaah</li>
                      <li>• <strong>Penyerahan Dokumen:</strong> H-30 keberangkatan</li>
                      <li>• <strong>Pelunasan Biaya:</strong> H-20 keberangkatan</li>
                      <li>• <strong>Manasik Haji/Umrah:</strong> H-14 keberangkatan</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 shadow-2xl">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Harga Paket Per Jamaah</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-serif leading-tight">
              {formatPrice(effectivePrice)}
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
              className="flex-1 sm:flex-none px-7 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950 text-white" />
              <span>Daftar / Konsultasi Seat</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
