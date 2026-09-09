import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, Heart, Globe, Printer, ChevronRight, Check, ArrowRight,
  MessageCircle, Star, Shield, Award, Clock, Users, ExternalLink
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

type CategoryType = "all" | "wedding" | "haji-umrah" | "printing";

interface UnifiedPackage {
  id: number | string;
  type: "wedding" | "haji-umrah" | "printing";
  categoryLabel: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  features: string[];
  image: string;
  badge?: string;
  detailUrl: string;
  whatsappMessage: string;
}

const FALLBACK_IMAGES = {
  wedding: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  umrah: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80",
  haji: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80",
  printing: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80"
};

// Parse images from any DB format: Array, JSON string '["img"]', or CSV
const parseImagesField = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export default function UnifiedPackagesShowcase() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [packages, setPackages] = useState<UnifiedPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  const waNumber = (settings["whatsapp"] || "6285329077987").replace(/\D/g, "");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    const fetchAllPackages = async () => {
      setLoading(true);
      const unifiedList: UnifiedPackage[] = [];

      try {
        // 1. Fetch Wedding Packages
        const weddingRes = await fetch("/api/packages").then(res => res.json()).catch(() => null);
        if (weddingRes && weddingRes.success && Array.isArray(weddingRes.data)) {
          weddingRes.data.slice(0, 3).forEach((pkg: any) => {
            const rawFeatures = parseImagesField(pkg.features);
            const rawImages = parseImagesField(pkg.images);

            unifiedList.push({
              id: `wedding-${pkg.id}`,
              type: "wedding",
              categoryLabel: "Paket Wedding",
              name: pkg.name,
              price: pkg.price || 35000000,
              discountPrice: pkg.discount_price || undefined,
              description: pkg.description || "Layanan paket pernikahan premium terlengkap dan profesional.",
              features: rawFeatures.slice(0, 4),
              image: (rawImages && rawImages.length > 0) ? rawImages[0] : FALLBACK_IMAGES.wedding,
              badge: pkg.highlighted ? "Terpopuler" : undefined,
              detailUrl: "/packages",
              whatsappMessage: `Halo Admin Galeria Wedding, saya tertarik berkonsultasi mengenai ${pkg.name}. Bisakah diberikan informasi lebih lengkap?`
            });
          });
        }

        // 2. Fetch Haji Packages
        const hajiRes = await fetch("/api/haji-packages").then(res => res.json()).catch(() => null);
        if (hajiRes && hajiRes.success && Array.isArray(hajiRes.data)) {
          hajiRes.data.slice(0, 2).forEach((pkg: any) => {
            const rawFeatures = parseImagesField(pkg.included_features);
            const rawImages = parseImagesField(pkg.images);

            unifiedList.push({
              id: `haji-${pkg.id}`,
              type: "haji-umrah",
              categoryLabel: "Paket Haji Khusus",
              name: pkg.name,
              price: pkg.price || 185000000,
              discountPrice: pkg.discount_price || undefined,
              description: pkg.description || "Program haji khusus resmi berizin Kemenag dengan fasilitas maktab VIP.",
              features: rawFeatures.slice(0, 4),
              image: (rawImages && rawImages.length > 0) ? rawImages[0] : FALLBACK_IMAGES.haji,
              badge: pkg.featured ? "Resmi Kemenag" : undefined,
              detailUrl: "/umrah-haji",
              whatsappMessage: `Assalamu'alaikum Admin Galeria Umrah & Haji, saya ingin bertanya tentang ${pkg.name}. Mohon informasi kuota dan syaratnya.`
            });
          });
        }

        // 3. Fetch Umrah Packages
        const umrahRes = await fetch("/api/umrah-packages").then(res => res.json()).catch(() => null);
        if (umrahRes && umrahRes.success && Array.isArray(umrahRes.data)) {
          umrahRes.data.filter((p: any) => p.package_type !== "haji").slice(0, 2).forEach((pkg: any) => {
            const rawFeatures = parseImagesField(pkg.included_features);
            const rawImages = parseImagesField(pkg.images);

            unifiedList.push({
              id: `umrah-${pkg.id}`,
              type: "haji-umrah",
              categoryLabel: "Paket Umrah",
              name: pkg.name,
              price: pkg.price || 28500000,
              discountPrice: pkg.discount_price || undefined,
              description: pkg.description || "Ibadah umrah khusyuk dengan hotel dekat masjid dan bimbingan mutawwif ahli.",
              features: rawFeatures.slice(0, 4),
              image: (rawImages && rawImages.length > 0) ? rawImages[0] : FALLBACK_IMAGES.umrah,
              badge: pkg.best_seller ? "Best Seller" : (pkg.featured ? "Pilihan Utama" : undefined),
              detailUrl: "/umrah-haji",
              whatsappMessage: `Assalamu'alaikum Admin Galeria Umrah, saya ingin mengetahui jadwal dan pendaftaran untuk ${pkg.name}.`
            });
          });
        }

        // 4. Fetch Printing Products/Packages
        const printingRes = await fetch("/api/printing/products").then(res => res.json()).catch(() => null);
        if (printingRes && printingRes.success && Array.isArray(printingRes.data)) {
          printingRes.data.slice(0, 3).forEach((prod: any) => {
            const rawFeatures = parseImagesField(prod.features);
            const rawImages = parseImagesField(prod.images);

            unifiedList.push({
              id: `printing-${prod.id}`,
              type: "printing",
              categoryLabel: prod.category_name || "Paket Percetakan",
              name: prod.name,
              price: prod.price || 15000,
              discountPrice: prod.discount_price || undefined,
              description: prod.description || "Hasil cetak presisi kualitas tinggi dengan teknologi cetak digital offset terkini.",
              features: rawFeatures.length > 0 ? rawFeatures.slice(0, 4) : [
                "Bahan Premium Berkualitas",
                "Pilihan Desain Custom & Eksklusif",
                "Pengerjaan Rapi & Tepat Waktu",
                "Garansi Cetak Ulang Jika Cacat"
              ],
              image: (rawImages && rawImages.length > 0) ? rawImages[0] : FALLBACK_IMAGES.printing,
              badge: prod.is_new ? "Terbaru" : (prod.is_featured ? "Favorit" : undefined),
              detailUrl: "/printing",
              whatsappMessage: `Halo Admin Galeria Printing, saya ingin memesan ${prod.name}. Mohon informasi minimal order dan estimasi waktunya.`
            });
          });
        }

        setPackages(unifiedList);
      } catch (err) {
        console.error("Error fetching unified packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPackages();
  }, []);

  const filteredPackages = activeCategory === "all" 
    ? packages 
    : packages.filter(pkg => pkg.type === activeCategory);

  const tabs = [
    { id: "all", label: "Semua Paket", icon: Sparkles, count: packages.length },
    { id: "wedding", label: "Paket Wedding", icon: Heart, count: packages.filter(p => p.type === "wedding").length },
    { id: "haji-umrah", label: "Paket Haji & Umrah", icon: Globe, count: packages.filter(p => p.type === "haji-umrah").length },
    { id: "printing", label: "Paket Percetakan", icon: Printer, count: packages.filter(p => p.type === "printing").length },
  ];

  return (
    <section id="unified-packages" className="py-20 sm:py-24 bg-gradient-to-b from-background via-slate-50/60 to-background relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Koleksi Layanan Terpadu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight mb-4">
            Pilihan Paket <span className="text-gradient">Galeria Terlengkap</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Temukan seluruh paket terbaik kami mulai dari paket pernikahan eksklusif, program ibadah haji & umrah resmi, hingga layanan cetak digital berkualitas tinggi dalam satu tempat.
          </p>
        </div>

        {/* Category Tabs: Mobile-friendly horizontal scroll track */}
        <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 mb-8 sm:mb-12">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 min-w-max mx-auto px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as CategoryType)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-primary text-white shadow-lg shadow-amber-500/25 scale-105"
                      : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-sm"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-primary"}`} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-slate-200/70 p-6 animate-pulse space-y-4 shadow-sm">
                <div className="h-52 bg-slate-200 rounded-2xl w-full" />
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <p className="text-slate-500 font-medium">Belum ada paket yang tersedia untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPackages.map((pkg) => {
              const effectivePrice = pkg.discountPrice || pkg.price;
              const hasDiscount = pkg.discountPrice && pkg.discountPrice < pkg.price;

              return (
                <div
                  key={pkg.id}
                  className="group bg-white rounded-3xl border border-slate-200/80 hover:border-primary/40 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Image & Badge */}
                  <div>
                    <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-900">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-sm flex items-center gap-1.5 ${
                          pkg.type === "wedding"
                            ? "bg-rose-950/70 border-rose-400/30 text-rose-300"
                            : pkg.type === "haji-umrah"
                            ? "bg-emerald-950/70 border-emerald-400/30 text-emerald-300"
                            : "bg-blue-950/70 border-blue-400/30 text-blue-300"
                        }`}>
                          {pkg.type === "wedding" && <Heart className="w-3 h-3 text-rose-400" />}
                          {pkg.type === "haji-umrah" && <Globe className="w-3 h-3 text-emerald-400" />}
                          {pkg.type === "printing" && <Printer className="w-3 h-3 text-blue-400" />}
                          <span>{pkg.categoryLabel}</span>
                        </span>

                        {pkg.badge && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-primary text-white shadow-md">
                            ★ {pkg.badge}
                          </span>
                        )}
                      </div>

                      {/* Floating Price in Image Bottom */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight drop-shadow-sm">
                            {formatPrice(effectivePrice)}
                          </span>
                          {pkg.type === "printing" && (
                            <span className="text-xs text-slate-300 font-medium">/ pcs</span>
                          )}
                        </div>
                        {hasDiscount && (
                          <div className="text-xs text-slate-300 line-through">
                            {formatPrice(pkg.price)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                          {pkg.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-light">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Feature Checklist */}
                      {pkg.features.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Fasilitas Unggulan:
                          </p>
                          <ul className="space-y-1.5">
                            {pkg.features.map((feat, fi) => (
                              <li key={fi} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 sm:p-6 pt-0 space-y-2">
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(pkg.whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Konsultasi via WhatsApp</span>
                    </a>

                    <Link
                      to={pkg.detailUrl}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Lihat Rincian Halaman Lengkap</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA to Full Pages */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs sm:text-sm text-slate-600 font-medium px-2">Jelajahi halaman khusus:</span>
            <Link
              to="/packages"
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-amber-600" />
              <span>Semua Paket Wedding</span>
            </Link>
            <Link
              to="/umrah-haji"
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Semua Paket Haji & Umrah</span>
            </Link>
            <Link
              to="/printing"
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Semua Paket Percetakan</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
