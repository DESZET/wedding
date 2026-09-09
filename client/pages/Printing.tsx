import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import {
  Printer, ShoppingCart, Upload, Filter, Search,
  ChevronDown, X, Palette, Ruler, Layers,
  Clock, Truck, Shield, ShieldCheck, Star, Sparkles, ArrowRight,
  Plus, Minus, Eye, Download, Heart, Share2, Zap,
  Package, Calculator, Users, TrendingUp, Award,
  Image as ImageIcon, FileText, Smartphone, Monitor,
  Globe, Camera, Video as VideoIcon, Music, Check,
  Phone, Mail, MapPin, CreditCard, Tag, Scissors,
  FileImage, Layout, BookOpen, ShoppingBag
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import Footer from "@/components/Footer";
import ReviewSection from "@/components/ReviewSection";
import PrintingDetailModal from "@/components/PrintingDetailModal";

interface PrintingProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  size_options: string[];
  material_options: string[];
  color_options: string[];
  finishing_options: string[];
  images: string[];
  estimated_time: string;
  min_order: number;
  features: string[];
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_new: boolean;
  category_id?: number;
  category_name?: string;
}

interface PrintingCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

interface OrderCalculator {
  quantity: number;
  size: string;
  material: string;
  color: string;
  finishing: string;
  category: string;
  is_double_sided: boolean;
  is_urgent: boolean;
}

export default function Printing() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { settings } = useSettings();
  const [categories, setCategories] = useState<PrintingCategory[]>([]);
  const [products, setProducts] = useState<PrintingProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<PrintingProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PrintingProduct | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDesignStudio, setShowDesignStudio] = useState(false);
  const [calculator, setCalculator] = useState<OrderCalculator>({
    quantity: 100,
    size: "A4",
    material: "Art Paper 260gsm",
    color: "Full Color",
    finishing: "Laminating Glossy",
    category: selectedProduct?.category_name || categories[0]?.name || "",
    is_double_sided: false,
    is_urgent: false
  });
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [uploadedDesign, setUploadedDesign] = useState<File | null>(null);
  const [designPreview, setDesignPreview] = useState<string | null>(null);
  const [activeDesignTab, setActiveDesignTab] = useState<'upload' | 'template'>('upload');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const productCarouselRef = useRef<HTMLDivElement>(null);

  // Data untuk WhatsApp
  const whatsappNumber = settings["printing-whatsapp"] ? settings["printing-whatsapp"].replace(/\D/g, "") : (settings["whatsapp"] ? settings["whatsapp"].replace(/\D/g, "") : "6285329077987");
  const adminName = "Admin Percetakan Galeria Wedding";

  // Load data dari database
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/printing/categories').then(res => res.json()),
          fetch('/api/printing/products').then(res => res.json())
        ]);

        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
        }

        if (productsRes.success && Array.isArray(productsRes.data) && productsRes.data.length > 0) {
          const parseSafeList = (val: any): string[] => {
            if (!val) return [];
            if (Array.isArray(val)) return val.filter(Boolean);
            if (typeof val === 'string') {
              const trimmed = val.trim();
              if (!trimmed) return [];
              if (trimmed.startsWith('[')) {
                try {
                  const parsed = JSON.parse(trimmed);
                  if (Array.isArray(parsed)) return parsed.filter(Boolean);
                } catch {}
              }
              if (trimmed.startsWith('data:')) return [trimmed];
              return trimmed.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
            }
            return [];
          };

          const productsData = productsRes.data.map((p: any) => ({
            ...p,
            size_options: parseSafeList(p.size_options),
            material_options: parseSafeList(p.material_options),
            color_options: parseSafeList(p.color_options),
            finishing_options: parseSafeList(p.finishing_options),
            images: parseSafeList(p.images),
            features: parseSafeList(p.features).length > 0 ? parseSafeList(p.features) : ["Kualitas Terjamin", "Harga Kompetitif", "Pengiriman Cepat"],
            rating: Number(p.rating) || 4.8,
            reviews_count: Number(p.reviews_count) || 0,
            is_featured: Boolean(p.is_featured || p.featured),
            is_new: Boolean(p.is_new),
          }));
          setProducts(productsData);
          setFilteredProducts(productsData);
        } else {
          // Fallback sample printing products with high quality visuals
          const samplePrintingProducts: PrintingProduct[] = [
            {
              id: 1,
              name: "Undangan Hardcover Floral Gold Foil",
              description: "Undangan pernikahan hardcover tebal dengan sentuhan hotprint foil emas berkilau dan pita satin mewah.",
              price: 15000,
              discount_price: 12500,
              size_options: ["15 x 20 cm", "A5 Lipat 2"],
              material_options: ["Board 30 + Jasmine Glitter", "Art Paper 260gsm Laminasi Doff"],
              color_options: ["Gold Champagne", "Emerald Green", "Navy Blue", "Maroon Velvet"],
              finishing_options: ["Hotprint Poly Emas", "Emboss 3D", "Pita Satin"],
              images: ["https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80"],
              estimated_time: "5-7 Hari Kerja",
              min_order: 100,
              features: ["Gratis Plastik OPP & Label Nama", "Gratis Denah Lokasi QR", "Gratis Video Undangan Digital"],
              rating: 5.0,
              reviews_count: 240,
              is_featured: true,
              is_new: false,
              category_name: "Undangan Pernikahan"
            },
            {
              id: 2,
              name: "Undangan Akrilik Transparan Eksklusif (UV Print)",
              description: "Kemewahan undangan akrilik bening 2mm dengan cetak tinta UV timbul anti air dan amplop beludru premium.",
              price: 35000,
              discount_price: 29000,
              size_options: ["15 x 21 cm", "12 x 18 cm"],
              material_options: ["Akrilik Bening 2mm", "Akrilik Frosted Doff 2mm"],
              color_options: ["White Ink", "Gold Ink", "Full Color UV"],
              finishing_options: ["Wax Seal Stempel Lilin", "Amplop Beludru / Velvet"],
              images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80"],
              estimated_time: "7-10 Hari Kerja",
              min_order: 50,
              features: ["Tahan Air & Anti Pudar", "Box / Amplop Beludru Eksklusif", "Wax Seal Asli"],
              rating: 5.0,
              reviews_count: 180,
              is_featured: true,
              is_new: true,
              category_name: "Undangan Akrilik"
            },
            {
              id: 3,
              name: "Souvenir Custom & Goodie Bag Pernikahan",
              description: "Pilihan pouch kulit sintetis, tumbler custom grafir nama, dan tote bag kanvas elegan untuk cinderamata tamu.",
              price: 18000,
              discount_price: 15000,
              size_options: ["20 x 12 cm", "Standard Pouch"],
              material_options: ["Kulit Sintetis Premium", "Kanvas Tebal", "Stainless 500ml"],
              color_options: ["Havana Brown", "Black Onyx", "Sage Green", "Dusty Pink"],
              finishing_options: ["Emboss Nama Pengantin", "Sablon 1 Warna", "Packaging Box Mika"],
              images: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80"],
              estimated_time: "7-14 Hari Kerja",
              min_order: 100,
              features: ["Gratis Kemasan Mika & Thank You Card", "Bisa Custom Logo & Tanggal", "Awet & Bermanfaat"],
              rating: 4.9,
              reviews_count: 160,
              is_featured: false,
              is_new: false,
              category_name: "Souvenir & Goodie Bag"
            },
            {
              id: 4,
              name: "Wedding Photobook Magazine (Album Kenangan)",
              description: "Cetak album foto kenangan wedding & prewedding gaya majalah luxury dengan kertas tebal anti air.",
              price: 450000,
              discount_price: 380000,
              size_options: ["20 x 30 cm (A4 Landscape)", "30 x 30 cm Square"],
              material_options: ["Luster Photo Paper 260gsm", "Silk Matte Paper"],
              color_options: ["Full Color HD Print"],
              finishing_options: ["Hardcover Box Kulit", "Laminasi Anti Gores"],
              images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"],
              estimated_time: "3-5 Hari Kerja",
              min_order: 1,
              features: ["Isi 40 Halaman Full Color", "Hardcover Tebal Tahan Puluhan Tahun", "Gratis Box Eksklusif"],
              rating: 5.0,
              reviews_count: 95,
              is_featured: true,
              is_new: false,
              category_name: "Photobook & Album"
            }
          ];
          setProducts(samplePrintingProducts);
          setFilteredProducts(samplePrintingProducts);
        }
      } catch (error) {
        console.error('Error loading printing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter dan sort produk
  useEffect(() => {
    let result = products;

    // Filter by category
    if (activeCategory !== "all") {
      result = result.filter(product =>
        product.category_id?.toString() === activeCategory
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }

    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
        break;
      case "price-high":
        result = [...result].sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        result = [...result].filter(p => p.is_new);
        break;
      default:
        result = [...result].sort((a, b) => b.reviews_count - a.reviews_count);
    }

    setFilteredProducts(result);
  }, [activeCategory, searchTerm, sortBy, products]);

  // Hitung total harga
  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0;

    let basePrice = selectedProduct.discount_price || selectedProduct.price;
    let total = basePrice * calculator.quantity;

    if (calculator.is_double_sided) total *= 1.3;
    if (calculator.is_urgent) total *= 1.5;

    return Math.round(total);
  };

  // Format harga ke Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Fungsi untuk mengarahkan ke WhatsApp
  const sendToWhatsApp = (type: 'product' | 'design') => {
    if (!selectedProduct) return;

    const intro = settings["printing-order-intro"] || `*Halo Admin Percetakan Galeria Wedding!* 👋\n\nSaya ingin memesan produk percetakan:`;
    let message = `${intro}\n\n`;

    message += `*📦 Produk:* ${selectedProduct.name}\n`;
    message += `*🏷️ Kategori:* ${calculator.category || selectedProduct.category_name || '-'}\n`;
    message += `*📏 Ukuran:* ${calculator.size}\n`;
    message += `*📄 Bahan:* ${calculator.material}\n`;
    message += `*🎨 Warna:* ${calculator.color}\n`;
    message += `*✨ Finishing:* ${calculator.finishing}\n`;
    message += `*🔢 Jumlah:* ${calculator.quantity} pcs\n`;
    message += `*🔄 Cetak 2 Sisi:* ${calculator.is_double_sided ? 'Ya' : 'Tidak'}\n`;
    message += `*⚡ Order Kilat:* ${calculator.is_urgent ? 'Ya' : 'Tidak'}\n`;
    message += `*⏱️ Estimasi Waktu:* ${calculator.is_urgent ? "1-2 hari" : selectedProduct.estimated_time}\n\n`;

    if (type === 'design') {
      if (uploadedDesign) {
        message += `*🎨 Desain:* Sudah diupload (${uploadedDesign.name})\n`;
      } else if (selectedTemplate) {
        message += `*🎨 Desain:* Menggunakan template\n`;
      }
    } else {
      message += `*🎨 Desain:* Akan dikirim kemudian\n`;
    }

    message += `\n*💰 Total Estimasi:* ${formatPrice(calculateTotalPrice())}\n\n`;
    message += `Saya ingin melanjutkan untuk:\n`;
    message += `1. Konsultasi desain\n`;
    message += `2. Konfirmasi harga final\n`;
    message += `3. Pembayaran DP 50%\n\n`;

    const outro = settings["printing-order-outro"] || `Mohon informasikan langkah selanjutnya. Terima kasih! 😊`;
    message += outro;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Reset state
    setShowProductModal(false);
    setShowDesignStudio(false);
    setUploadedDesign(null);
    setDesignPreview(null);
    setSelectedTemplate(null);

    // Reset calculator ke default
    setCalculator({
      quantity: 100,
      size: "A4",
      material: "Art Paper 260gsm",
      color: "Full Color",
      finishing: "Laminating Glossy",
      category: selectedProduct?.category_name || categories[0]?.name || "",
      is_double_sided: false,
      is_urgent: false
    });
  };

  // Render stars untuk rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Icon components untuk kategori
  const getIconComponent = (iconName: string) => {
    const icons: any = {
      Printer, Scissors, FileImage, Layout, BookOpen, Package,
      Tag, ShoppingBag, ShoppingCart, FileText, ImageIcon, Camera,
      VideoIcon, Music, CreditCard, Truck, Globe, Award, Users,
      TrendingUp, Zap, Shield, Clock, Calculator, Ruler, Layers,
      Palette, Sparkles, Filter, Search, Eye, Download, Heart,
      Share2, Plus, Minus, ChevronDown, X, Check, Phone, Mail,
      MapPin
    };

    return icons[iconName] || Printer;
  };

  const stats = [
    { icon: <Users className="w-12 h-12 mx-auto mb-3 text-yellow-300" />, value: settings["printing-stat-1-val"] || "500+", label: settings["printing-stat-1-lbl"] || "Klien Percetakan" },
    { icon: <Package className="w-12 h-12 mx-auto mb-3 text-green-300" />, value: settings["printing-stat-2-val"] || "2,000+", label: settings["printing-stat-2-lbl"] || "Order Terselesaikan" },
    { icon: <Clock className="w-12 h-12 mx-auto mb-3 text-blue-300" />, value: settings["printing-stat-3-val"] || "3-5", label: settings["printing-stat-3-lbl"] || "Hari Pengerjaan" },
    { icon: <Award className="w-12 h-12 mx-auto mb-3 text-purple-300" />, value: settings["printing-stat-4-val"] || "100%", label: settings["printing-stat-4-lbl"] || "Garansi Kualitas" }
  ];

  const processes = [
    {
      icon: <ShoppingCart className="w-12 h-12 text-white" />,
      step: "1",
      title: settings["printing-proc-1-title"] || "Pilih Produk",
      desc: settings["printing-proc-1-desc"] || "Pilih produk "
    },
    {
      icon: <Phone className="w-12 h-12 text-white" />,
      step: "2",
      title: settings["printing-proc-2-title"] || "Konfirmasi WhatsApp",
      desc: settings["printing-proc-2-desc"] || "Konfirmasi detail dan pembayaran via WhatsApp"
    },
    {
      icon: <Truck className="w-12 h-12 text-white" />,
      step: "3",
      title: settings["printing-proc-3-title"] || "Produk Dikirim",
      desc: settings["printing-proc-3-desc"] || "Produk dikirim sesuai estimasi waktu"
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Page Header - White section */}
      <SectionWrapper id="printing-header" animationType="fade-in-up" delay={200}>
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 pt-28 pb-8 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Katalog Produk Percetakan Digital Offset</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
            Koleksi Cetak <span className="text-gradient">Galeria Printing</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-light">
            Geser (swipe) ke kiri & kanan untuk melihat produk percetakan, lalu ketuk untuk membaca spesifikasi dan kalkulasi harga lengkap.
          </p>
        </div>
      </SectionWrapper>

      {/* Products Showcase Carousel Section */}
      <SectionWrapper id="products" animationType="fade-in-up" delay={400}>
        <div className="pt-6 pb-16 px-3 sm:px-6 md:px-8 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">

          <div className="max-w-6xl mx-auto relative z-10">

            {/* Quick Product Navigation Tabs (Responsive Horizontal Scroll Track, No Clipping) */}
            <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 mb-6 sm:mb-8">
              <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 min-w-max mx-auto px-2">
                {filteredProducts.map((product, idx) => (
                  <button
                    key={product.id || idx}
                    onClick={() => {
                      setCurrentProductIndex(idx);
                      if (productCarouselRef.current) {
                        const cardWidth = productCarouselRef.current.offsetWidth;
                        productCarouselRef.current.scrollTo({
                          left: idx * cardWidth,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${currentProductIndex === idx
                      ? "bg-gradient-to-r from-primary to-amber-500 text-white shadow-lg shadow-primary/20 scale-105"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                      }`}
                  >
                    <span>{product.name}</span>
                    {product.is_featured && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">UNGGULAN</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile-First Big Showcase Box Carousel */}
            <div className="relative">

              {/* Arrow Controls (Hidden on mobile to avoid overlapping content, visible on tablet/desktop) */}
              {filteredProducts.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const newIdx = Math.max(0, currentProductIndex - 1);
                      setCurrentProductIndex(newIdx);
                      if (productCarouselRef.current) {
                        const cardWidth = productCarouselRef.current.offsetWidth;
                        productCarouselRef.current.scrollTo({ left: newIdx * cardWidth, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentProductIndex === 0}
                    className={`hidden sm:flex absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xl items-center justify-center transition-all ${currentProductIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                      }`}
                    aria-label="Produk Sebelumnya"
                  >
                    <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-primary rotate-180" />
                  </button>

                  <button
                    onClick={() => {
                      const newIdx = Math.min(filteredProducts.length - 1, currentProductIndex + 1);
                      setCurrentProductIndex(newIdx);
                      if (productCarouselRef.current) {
                        const cardWidth = productCarouselRef.current.offsetWidth;
                        productCarouselRef.current.scrollTo({ left: newIdx * cardWidth, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentProductIndex === filteredProducts.length - 1}
                    className={`hidden sm:flex absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xl items-center justify-center transition-all ${currentProductIndex === filteredProducts.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                      }`}
                    aria-label="Produk Selanjutnya"
                  >
                    <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </button>
                </>
              )}

              {/* Swipeable Container */}
              <div
                ref={productCarouselRef}
                onScroll={() => {
                  if (productCarouselRef.current) {
                    const cardWidth = productCarouselRef.current.offsetWidth;
                    const scrollLeft = productCarouselRef.current.scrollLeft;
                    const newIndex = Math.round(scrollLeft / cardWidth);
                    if (newIndex !== currentProductIndex && newIndex >= 0 && newIndex < filteredProducts.length) {
                      setCurrentProductIndex(newIndex);
                    }
                  }
                }}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-3xl touch-pan-x"
                style={{ scrollBehavior: 'smooth' }}
              >
                {filteredProducts.map((product, idx) => {
                  const effectivePrice = product.discount_price || product.price;
                  const bgImage = (product.images && product.images.length > 0)
                    ? product.images[0]
                    : "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80";

                  return (
                    <div
                      key={product.id || idx}
                      className="w-full flex-shrink-0 snap-center p-1 sm:p-2"
                    >
                      <div
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductModal(true);
                        }}
                        className="group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-950 border border-white/15 shadow-2xl transition-all duration-500 hover:border-amber-400/50"
                      >
                        {/* Big Image View */}
                        <div className="relative h-[460px] sm:h-[500px] md:h-[550px] w-full overflow-hidden">
                          <img
                            src={bgImage}
                            alt={product.name}
                            className="w-full h-full object-cover brightness-[0.7] group-hover:scale-105 transition-transform duration-700 ease-out"
                          />

                          {/* Gradient Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

                          {/* Top Badges */}
                          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                            <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                              <Printer className="w-3.5 h-3.5" />
                              <span>{product.category_name || "Percetakan Premium"}</span>
                            </span>

                            {product.is_featured && (
                              <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-primary text-slate-950 font-black text-xs shadow-lg uppercase tracking-wider">
                                ★ BEST SELLER
                              </span>
                            )}
                          </div>

                          {/* Bottom Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-10 space-y-4">

                            {/* Price & Lead Time */}
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <div>
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
                                  Harga Mulai Dari
                                </span>
                                <div className="text-3xl sm:text-5xl font-serif font-extrabold text-amber-400 tracking-tight">
                                  {formatPrice(effectivePrice)}
                                  <span className="text-xs sm:text-sm font-normal text-slate-300 ml-1.5">/ pcs</span>
                                </div>
                              </div>
                              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm text-amber-300 font-semibold">
                                ⏱️ {product.estimated_time || "2-4 Hari Kerja"}
                              </span>
                            </div>

                            {/* Title & Short Description */}
                            <div>
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mb-1 leading-snug group-hover:text-amber-300 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 font-light leading-relaxed">
                                {product.description || "Hasil cetak presisi resolusi tinggi dengan aneka pilihan material kertas dan finishing eksklusif."}
                              </p>
                            </div>

                            {/* 3 Key Feature Tags */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-amber-400" />
                                <span>Min. Order {product.min_order || 100} pcs</span>
                              </span>
                              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pilihan Kertas & Akrilik Premium</span>
                              </span>
                              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>Garansi Cetak Ulang 100%</span>
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

                              {/* Main Button: Detail Selengkapnya */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                  setShowProductModal(true);
                                }}
                                className="relative group/btn overflow-hidden flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-primary to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <div className="absolute inset-0 w-1/2 h-full bg-white/30 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out" />
                                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950/20" />
                                <span className="tracking-wide">Detail Selengkapnya</span>
                                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                              </button>

                              {/* Direct WhatsApp Order */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const template = settings["printing-direct-message"] || "*Halo Admin Percetakan Galeria Wedding!* 👋\n\nSaya ingin memesan produk percetakan:\n\n*📦 Produk:* {productName}\n*🏷️ Kategori:* {categoryName}\n\nMohon informasikan langkah selanjutnya. Terima kasih! 😊";
                                  const message = template
                                    .replace("{productName}", product.name)
                                    .replace("{categoryName}", product.category_name || '-');
                                  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                                  window.open(whatsappUrl, '_blank');
                                }}
                                className="py-3.5 sm:py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
                              >
                                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                                <span>Pesan via WA</span>
                              </button>

                            </div>

                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Dots Pagination & Mobile Controls */}
            <div className="flex items-center justify-between sm:justify-center gap-3 mt-6 px-1">
              <button
                onClick={() => {
                  const newIdx = Math.max(0, currentProductIndex - 1);
                  setCurrentProductIndex(newIdx);
                  if (productCarouselRef.current) {
                    const cardWidth = productCarouselRef.current.offsetWidth;
                    productCarouselRef.current.scrollTo({ left: newIdx * cardWidth, behavior: 'smooth' });
                  }
                }}
                disabled={currentProductIndex === 0}
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                aria-label="Produk Sebelumnya"
              >
                <ArrowRight className="w-4 h-4 text-primary rotate-180" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 overflow-x-auto max-w-[150px] px-1 py-1">
                {filteredProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentProductIndex(idx);
                      if (productCarouselRef.current) {
                        const cardWidth = productCarouselRef.current.offsetWidth;
                        productCarouselRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                      }
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${currentProductIndex === idx
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  const newIdx = Math.min(filteredProducts.length - 1, currentProductIndex + 1);
                  setCurrentProductIndex(newIdx);
                  if (productCarouselRef.current) {
                    const cardWidth = productCarouselRef.current.offsetWidth;
                    productCarouselRef.current.scrollTo({ left: newIdx * cardWidth, behavior: 'smooth' });
                  }
                }}
                disabled={currentProductIndex === filteredProducts.length - 1}
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                aria-label="Produk Selanjutnya"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-3 sm:hidden">
              ← Geser layar ke kiri atau kanan untuk memilih produk percetakan →
            </p>

          </div>
        </div>
      </SectionWrapper>

      {/* Interactive Article-Style Printing Detail Modal */}
      <PrintingDetailModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      {/* Design Studio Modal */}
      {showDesignStudio && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Upload Desain</h3>
                <p className="text-gray-600">Upload desain Anda untuk produk: {selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setShowDesignStudio(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Design Preview */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-6">
                    <div className="aspect-video bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {designPreview ? (
                        <img src={designPreview} alt="Design Preview" className="max-w-full max-h-96 object-contain" />
                      ) : (
                        <div className="text-center p-8">
                          <ImageIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-2">Preview desain akan muncul di sini</p>
                          <p className="text-sm text-gray-400">Upload file desain Anda</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                      <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                        <Download size={16} />
                        Download Spesifikasi
                      </button>
                      <button
                        onClick={() => {
                          setUploadedDesign(null);
                          setDesignPreview(null);
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Hapus Desain
                      </button>
                    </div>
                  </div>

                  {/* Spesifikasi Teknis */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-bold mb-4">📋 Spesifikasi Teknis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Ukuran File</p>
                        <p className="font-medium">Minimal 300 DPI</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Format File</p>
                        <p className="font-medium">JPG, PNG, PDF, AI, PSD</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mode Warna</p>
                        <p className="font-medium">CMYK untuk cetak</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bleed Area</p>
                        <p className="font-medium">3mm di setiap sisi</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Options */}
                <div>
                  <div className="sticky top-6">
                    <div className="space-y-6">


                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h5 className="font-bold mb-3">💡 Butuh Jasa Desain?</h5>
                        <p className="text-sm text-gray-600 mb-4">
                          Kami menyediakan jasa desain profesional dengan biaya mulai dari Rp 50.000.
                          Diskusikan kebutuhan desain Anda via WhatsApp.
                        </p>
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=Saya butuh jasa desain untuk produk percetakan`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                          <Phone size={20} />
                          Konsultasi Desain via WhatsApp
                        </a>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Estimasi</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatPrice(calculateTotalPrice())}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => sendToWhatsApp('design')}
                          disabled={!uploadedDesign}
                          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 ${uploadedDesign
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl transition-all'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          {uploadedDesign ? (
                            <>
                              <ShoppingCart size={24} />
                              Lanjut ke WhatsApp
                            </>
                          ) : (
                            'Upload Desain Terlebih Dahulu'
                          )}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                          Anda akan diarahkan ke WhatsApp untuk konfirmasi detail dan pembayaran
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Layanan Kami */}
      <SectionWrapper id="services" animationType="fade-in-up" delay={600}>
        <div className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Layanan <span className="text-blue-600">Kami</span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Percetakan lengkap untuk semua kebutuhan Anda
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
                  <Printer className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Percetakan Offset & Digital</h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Undangan Pernikahan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Brosur & Flyer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Kartu Nama</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Banner & Spanduk</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6">
                  <Scissors className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Sablon & Merchandise</h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Kaos & Jaket</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Tas & Totebag</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Mug & Gelas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>ID Card & Name Tag</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6">
                  <Layout className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Desain & Packaging</h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Desain Grafis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Packaging Produk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Stiker & Label</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span>Kemasan Eksklusif</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>



      {/* FAQ Section */}
      <SectionWrapper id="faq" animationType="fade-in-up" delay={1000}>
        <div className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                {settings["printing-faq-title"] ? (
                  settings["printing-faq-title"]
                ) : (
                  <>FAQ <span className="text-blue-600">Percetakan</span></>
                )}
              </h2>
              <p className="text-gray-600">
                {settings["printing-faq-subtitle"] || "Pertanyaan yang sering diajukan"}
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: settings["printing-faq-1-q"] || "Berapa lama waktu pengerjaan?",
                  a: settings["printing-faq-1-a"] || "Waktu pengerjaan bervariasi tergantung jenis produk. Undangan 3-5 hari, kaos 5-7 hari, banner 2-3 hari. Untuk order kilat tersedia dengan biaya tambahan 50%."
                },
                {
                  q: settings["printing-faq-2-q"] || "Bagaimana cara pembayaran?",
                  a: settings["printing-faq-2-a"] || "Pembayaran dilakukan via transfer bank (BCA, Mandiri, BRI) atau COD untuk area tertentu. DP minimal 50% untuk memulai pengerjaan."
                },
                {
                  q: settings["printing-faq-3-q"] || "Apakah ada biaya desain?",
                  a: settings["printing-faq-3-a"] || "Desain gratis untuk order minimal Rp 300.000. Untuk order di bawah itu, biaya desain mulai dari Rp 50.000 tergantung kompleksitas."
                },
                {
                  q: settings["printing-faq-4-q"] || "Bagaimana jika desain tidak sesuai?",
                  a: settings["printing-faq-4-a"] || "Kami memberikan 2x revisi gratis. Setelah itu, revisi tambahan dikenakan biaya Rp 25.000 per revisi."
                },
                {
                  q: settings["printing-faq-5-q"] || "Apakah ada pengiriman ke seluruh Indonesia?",
                  a: settings["printing-faq-5-a"] || "Ya, kami melayani pengiriman ke seluruh Indonesia dengan kurir pilihan (JNE, J&T, SiCepat, GoSend). Biaya pengiriman ditanggung pembeli."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                    onClick={(e) => {
                      const content = e.currentTarget.nextElementSibling;
                      const icon = e.currentTarget.querySelector('svg');
                      if (content && icon) {
                        content.classList.toggle('hidden');
                        icon.classList.toggle('rotate-180');
                      }
                    }}
                  >
                    <span className="font-bold text-lg">{faq.q}</span>
                    <ChevronDown className="text-gray-400 transition-transform" />
                  </button>
                  <div className="hidden px-6 pb-4">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>


      {/* Reviews Section */}
      <SectionWrapper id="printing-reviews" animationType="fade-in-up" delay={100}>
        <div className="py-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4">
            <ReviewSection
              type="printing"
              itemId={0}
              itemName="Layanan Percetakan"
              accent="blue"
            />
          </div>
        </div>
      </SectionWrapper>

      <Footer />
    </div>
  );
}