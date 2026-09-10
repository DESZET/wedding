import React, { useState } from "react";
import { 
  X, Printer, ShoppingCart, Clock, Package, Check, 
  Sparkles, Share2, Layers, Ruler, Palette, FileText, 
  Calculator, Truck, ShieldCheck, MessageCircle, ArrowRight
} from "lucide-react";
import { useSettings } from "../hooks/useSettings";

interface PrintingDetailModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PrintingDetailModal({ product, isOpen, onClose }: PrintingDetailModalProps) {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<"overview" | "materials" | "calculator" | "process">("overview");
  const [selectedQty, setSelectedQty] = useState(100);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedFinishing, setSelectedFinishing] = useState<string>("");

  if (!isOpen || !product) return null;

  const whatsappNumber = settings["printing-whatsapp"] 
    ? settings["printing-whatsapp"].replace(/\D/g, "") 
    : (settings["whatsapp"] ? settings["whatsapp"].replace(/\D/g, "") : "6285329077987");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const basePrice = product.discount_price || product.price || 0;
  const totalPrice = basePrice * selectedQty;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Produk Percetakan: ${product.name}`,
        text: `Lihat rincian produk ${product.name} seharga ${formatPrice(basePrice)}/pcs di Percetakan Galeria Wedding!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const waMessage = `*Halo Admin Percetakan Galeria Wedding!* 👋\n\nSaya tertarik memesan produk percetakan:\n\n*📦 Produk:* ${product.name}\n*🏷️ Kategori:* ${product.category_name || '-'}\n*🔢 Jumlah:* ${selectedQty} pcs\n*📄 Bahan:* ${selectedMaterial || 'Sesuai Rekomendasi'}\n*✨ Finishing:* ${selectedFinishing || 'Standar'}\n*💰 Estimasi:* ${formatPrice(totalPrice)}\n\nMohon info mengenai pengiriman file desain dan alur pemesanannya. Terima kasih! 😊`;

  const defaultMaterials = [
    { name: "Art Paper 260 / 310 gsm", desc: "Tebal, licin, warna cetak sangat tajam dan mengkilap. Sangat cocok untuk cover undangan, kalender, brosur." },
    { name: "Kertas Jasmine (Glitter Mewah)", desc: "Permukaan bertekstur butiran glitter mutiara yang berkilau mewah dan elegan untuk undangan pernikahan." },
    { name: "Akrilik Bening (Acrylic 2-3mm)", desc: "Bahan akrilik transparan tebal dengan cetak UV ink tahan air dan anti pudar. Tampilan modern futuristik." },
    { name: "Linen & Concorde Jepang", desc: "Tekstur serat alami klasik dengan sentuhan vintage eksklusif untuk sertifikat dan surat resmi." }
  ];

  const defaultFinishings = [
    { name: "Hotprint Poly Emas / Silver Foil", desc: "Tinta emas/perak mengkilap emboss untuk nama pengantin atau logo." },
    { name: "Laminasi Doff (Matte) / Glossy", desc: "Lapisan plastik pelindung anti gores dan tahan percikan air." },
    { name: "Emboss & Deboss (Timbul/Tenggelam)", desc: "Efek tekstur 3D timbul pada inisial nama atau motif ornamen." },
    { name: "Pita Satin & Segel Lilin (Wax Seal)", desc: "Hiasan pita elegan dan stempel lilin vintage siap pakai." }
  ];

  const defaultSteps = [
    { step: "01", title: "Konsultasi & Kirim Materi", desc: "Kirimkan teks acara / data pengantin atau file desain siap cetak (PDF / AI / PSD)." },
    { step: "02", title: "Digital Proofing & Revisi", desc: "Tim desainer kami membuatkan layout preview digital dan revisi hingga disetujui." },
    { step: "03", title: "Cetak & Finishing Presisi", desc: "Proses produksi menggunakan mesin cetak digital offset resolusi tinggi terbaru." },
    { step: "04", title: "Quality Check & Pengiriman", desc: "Pengecekan kualitas teliti, packing bubble wrap berlapis, dan kirim ke alamat Anda." }
  ];

  const getCustomMaterials = () => {
    if (!product.custom_materials) return null;
    let raw = product.custom_materials;
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
            const [name, ...descParts] = line.split("|").map((s: string) => s.trim());
            return {
              name: name || "Bahan",
              desc: descParts.join(" | ") || ""
            };
          });
        }
      }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((m: any) => ({
        name: m.name || m.title || "Bahan",
        desc: m.desc || m.description || ""
      }));
    }
    return null;
  };

  const getCustomFinishings = () => {
    if (!product.custom_finishings) return null;
    let raw = product.custom_finishings;
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
            const [name, ...descParts] = line.split("|").map((s: string) => s.trim());
            return {
              name: name || "Finishing",
              desc: descParts.join(" | ") || ""
            };
          });
        }
      }
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((f: any) => ({
        name: f.name || f.title || "Finishing",
        desc: f.desc || f.description || ""
      }));
    }
    return null;
  };

  const getCustomSteps = () => {
    if (!product.custom_process_steps) return null;
    let raw = product.custom_process_steps;
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

  const materials = getCustomMaterials() || defaultMaterials;
  const finishings = getCustomFinishings() || defaultFinishings;
  const steps = getCustomSteps() || defaultSteps;

  const productImage = (product.images && product.images.length > 0) 
    ? product.images[0] 
    : "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-scale-in text-slate-800">
        
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
                {product.name}
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                Mulai {formatPrice(basePrice)} / pcs • Min. {product.min_order || 100} pcs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
              title="Bagikan produk"
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
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover brightness-[0.75] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                    {product.category_name || "PRODUK CETAK"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-medium text-slate-200">
                    Estimasi {product.estimated_time || "2-4 Hari Kerja"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-serif font-extrabold text-white leading-tight">
                  {product.name}
                </h2>
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
              <span>📖 Spesifikasi</span>
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "materials"
                  ? "bg-slate-900 text-amber-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>🎨 Bahan & Finishing</span>
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "calculator"
                  ? "bg-slate-900 text-amber-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>🧮 Simulasi Harga</span>
            </button>
            <button
              onClick={() => setActiveTab("process")}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "process"
                  ? "bg-slate-900 text-amber-400 shadow-sm scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
              }`}
            >
              <span>📋 Alur Pemesanan</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border border-amber-200/70 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Kualitas Cetak Tajam & Presisi</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-serif font-bold text-slate-900 mb-3 leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-light">
                    {product.description || "Diproduksi menggunakan teknologi mesin digital offset beresolusi tinggi dengan tinta pigment premium yang anti luntur. Setiap detail potongan rapi, warna tajam, dan bahan kertas terkurasi untuk memberikan kesan pertama yang tak terlupakan bagi para tamu undangan Anda."}
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-primary text-slate-950 flex items-center justify-center mb-2 font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Waktu Produksi</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{product.estimated_time || "2-4 Hari Kerja"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-primary text-slate-950 flex items-center justify-center mb-2 font-bold">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Min. Order</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{product.min_order || 100} pcs</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-primary text-slate-950 flex items-center justify-center mb-2 font-bold">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Ukuran Standar</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">A5 / Custom Size</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-primary text-slate-950 flex items-center justify-center mb-2 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase block">Garansi Cetak</span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">Reprint 100% jika Rusak</p>
                  </div>
                </div>

                {/* Free Inclusions */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-sm sm:text-base">Gratis Ekstra Setiap Pemesanan:</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Gratis Plastik OPP Pelindung & Label Stiker Nama</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Gratis Desain Denah Lokasi & Barcode QR Maps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Gratis Undangan Digital Video untuk Instagram & WA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Packing Kayu / Bubble Wrap Ekstra Tebal Aman</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MATERIALS */}
            {activeTab === "materials" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-primary">
                    1. Pilihan Bahan Material Kertas & Akrilik
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {materials.map((mat, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <h5 className="font-bold text-slate-900 text-sm mb-0.5">{mat.name}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{mat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-primary">
                    2. Pilihan Sentuhan Akhir (Finishing)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {finishings.map((fin, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <h5 className="font-bold text-slate-900 text-sm mb-0.5">{fin.name}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{fin.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CALCULATOR */}
            {activeTab === "calculator" && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">Simulasi Perhitungan Harga</h3>
                    <p className="text-xs text-slate-500">Pilih jumlah pesanan untuk menghitung estimasi biaya cetak secara instan.</p>
                  </div>

                  {/* Quantity Pills */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Jumlah Cetak (Pcs):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[100, 200, 300, 500, 1000].map((qty) => (
                        <button
                          key={qty}
                          onClick={() => setSelectedQty(qty)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                            selectedQty === qty
                              ? "bg-slate-900 text-amber-400 shadow-sm scale-105"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {qty} pcs
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total Box */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold uppercase block">Estimasi Biaya ({selectedQty} Pcs)</span>
                      <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif">
                        {formatPrice(totalPrice)}
                      </div>
                      <span className="text-xs text-slate-300">({formatPrice(basePrice)} / pcs)</span>
                    </div>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors text-center flex items-center justify-center gap-2 shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Pesan Jumlah Ini via WA</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROCESS */}
            {activeTab === "process" && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {steps.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                      <span className="absolute -top-2 -right-2 text-4xl font-serif font-black text-slate-200 select-none">
                        {step.step}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center mb-2">
                        {idx + 1}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 shadow-2xl">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Harga Mulai Dari</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-serif leading-tight">
              {formatPrice(basePrice)} <span className="text-xs font-normal text-slate-400">/ pcs</span>
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
              <span>Pesan Sekarang via WA</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
