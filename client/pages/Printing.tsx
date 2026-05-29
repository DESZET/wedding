// pages/printing.tsx
import { useState, useEffect } from "react";
import { 
  Printer, ShoppingCart, Upload, Filter, Search, 
  ChevronDown, X, Palette, Ruler, Layers, 
  Clock, Truck, Shield, Star, Sparkles, ArrowRight,
  Plus, Minus, Eye, Download, Heart, Share2, Zap,
  Package, Calculator, Users, TrendingUp, Award,
  Image as ImageIcon, FileText, Smartphone, Monitor,
  Globe, Camera, Video as VideoIcon, Music, Check,
  Phone, Mail, MapPin, CreditCard, Tag, Scissors,
  FileImage, Layout, BookOpen, ShoppingBag
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import Footer from "@/components/Footer";

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
  
  // Data untuk WhatsApp
  const whatsappNumber = "6285329077987"; // Ganti dengan nomor WhatsApp admin
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
        
        if (productsRes.success) {
          const productsData = productsRes.data;
          setProducts(productsData);
          setFilteredProducts(productsData);
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
    
    switch(sortBy) {
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

    let message = `*Halo ${adminName}!* 👋\n\n`;
    message += `Saya ingin memesan produk percetakan:\n\n`;
    
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
    message += `Mohon informasikan langkah selanjutnya. Terima kasih! 😊`;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary text-white py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles size={16} />
              <span className="text-sm font-medium">✨ Percetakan Digital Terbaik</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-300">
                Percetakan & Desain
              </span>
              <br />
              <span className="text-white">Profesional</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Layanan percetakan lengkap untuk kebutuhan bisnis, acara, dan personal.
              Desain gratis untuk order minimal Rp 300.000.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-white text-primary rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1 shadow-2xl flex items-center gap-2"
              >
                <Printer size={20} />
                Lihat Produk
                <ArrowRight size={20} />
              </button>
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-green-500 text-white rounded-full font-bold text-lg hover:bg-green-600 transition-all transform hover:-translate-y-1 flex items-center gap-2"
              >
                <Phone size={20} />
                Konsultasi via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 mt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <Users className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
              <p className="text-3xl font-bold">500+</p>
              <p className="text-white/80">Klien Percetakan</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <Package className="w-12 h-12 mx-auto mb-3 text-green-300" />
              <p className="text-3xl font-bold">2,000+</p>
              <p className="text-white/80">Order Terselesaikan</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <Clock className="w-12 h-12 mx-auto mb-3 text-blue-300" />
              <p className="text-3xl font-bold">3-5</p>
              <p className="text-white/80">Hari Pengerjaan</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <Award className="w-12 h-12 mx-auto mb-3 text-purple-300" />
              <p className="text-3xl font-bold">100%</p>
              <p className="text-white/80">Garansi Kualitas</p>
            </div>
          </div>
        </div>
      </section>

       {/* Proses Order */}
      <SectionWrapper id="order-process" animationType="fade-in-up" delay={800}>
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Cara <span className="text-blue-600">Memesan</span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Proses pemesanan yang mudah dan transparan
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <ShoppingCart className="w-12 h-12 text-white" />, 
                  step: "1", 
                  title: "Pilih Produk", 
                  desc: "Pilih produk " 
                },
                { 
                  icon: <Phone className="w-12 h-12 text-white" />, 
                  step: "2", 
                  title: "Konfirmasi WhatsApp", 
                  desc: "Konfirmasi detail dan pembayaran via WhatsApp" 
                },
                { 
                  icon: <Truck className="w-12 h-12 text-white" />, 
                  step: "3", 
                  title: "Produk Dikirim", 
                  desc: "Produk dikirim sesuai estimasi waktu" 
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                      {item.icon}
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Categories Filter */}
      <SectionWrapper id="categories" animationType="fade-in-up" delay={200}>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Kategori <span className="text-blue-600">Percetakan</span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Pilih kategori produk percetakan yang Anda butuhkan
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button
                className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                  activeCategory === "all" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                    : "bg-white text-gray-800 shadow-md hover:shadow-lg"
                }`}
                onClick={() => setActiveCategory("all")}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <span>Semua Produk</span>
                </div>
              </button>
              {categories.map(category => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <button
                    key={category.id}
                    className={`px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 ${
                      activeCategory === category.id.toString() 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                        : "bg-white text-gray-800 shadow-md hover:shadow-lg"
                    }`}
                    onClick={() => setActiveCategory(category.id.toString())}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent size={18} />
                      <span>{category.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Search and Sort */}
            <div className="bg-white rounded-2xl shadow-xl p-4 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari produk (undangan, banner, kaos, dll)..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="popular">Paling Populer</option>
                    <option value="price-low">Harga Terendah</option>
                    <option value="price-high">Harga Tertinggi</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="new">Produk Baru</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Products Grid */}
      <SectionWrapper id="products" animationType="fade-in-up" delay={400}>
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Memuat produk...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    >
                      {/* Badges */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                        {product.is_featured && (
                          <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            <Sparkles size={10} className="inline mr-1" /> UNGGULAN
                          </span>
                        )}
                        {product.discount_price && (
                          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            DISKON {Math.round((1 - product.discount_price / product.price) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Printer className="w-20 h-20 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          {renderStars(product.rating || 4.5)}
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={16} />
                            <span>{product.estimated_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Package size={16} />
                            <span>Min {product.min_order} pcs</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.features?.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between">
                          <div>
                            {product.discount_price ? (
                              <>
                                <span className="text-3xl font-bold text-red-600">{formatPrice(product.discount_price)}</span>
                                <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.price)}</span>
                              </>
                            ) : (
                              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                            )}
                            <p className="text-xs text-gray-500">per {product.min_order} pcs</p>
                          </div>
                          <button 
                            onClick={() => {
                              // Direct to WhatsApp without showing modal
                              const message = `*Halo ${adminName}!* 👋\n\nSaya ingin memesan produk percetakan:\n\n*📦 Produk:* ${product.name}\n*🏷️ Kategori:* ${product.category_name || '-'}\n\nMohon informasikan langkah selanjutnya. Terima kasih! 😊`;
                              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                          >
                            <ShoppingCart size={18} />
                            <span>Pesan Sekarang</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-16">
                    <Printer className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">Produk tidak ditemukan</h3>
                    <p className="text-gray-500 mb-6">Coba kata kunci lain atau kategori yang berbeda</p>
                    <button 
                      onClick={() => {
                        setSearchTerm("");
                        setActiveCategory("all");
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Reset Pencarian
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <div className="rounded-2xl overflow-hidden mb-4">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <img 
                        src={selectedProduct.images[currentImageIndex]} 
                        alt={selectedProduct.name} 
                        className="w-full h-80 object-cover"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
                        <Printer className="w-20 h-20 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === idx ? 'border-blue-500' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      {renderStars(selectedProduct.rating || 4.5)}
                      <span className="text-gray-500">{selectedProduct.reviews_count || 0} ulasan</span>
                    </div>
                    <p className="text-gray-700 mb-6">{selectedProduct.description}</p>
                  </div>

                  {/* Configuration Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Tag size={16} />
                        Kategori
                      </label>
                      <select
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={calculator.category}
                        onChange={(e) => setCalculator({...calculator, category: e.target.value})}
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Calculator size={16} />
                        Jumlah
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setCalculator({...calculator, quantity: Math.max(selectedProduct.min_order, calculator.quantity - 50)})}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Minus size={20} />
                        </button>
                        <input
                          type="number"
                          min={selectedProduct.min_order}
                          value={calculator.quantity}
                          onChange={(e) => setCalculator({...calculator, quantity: parseInt(e.target.value) || selectedProduct.min_order})}
                          className="flex-1 p-3 text-center border border-gray-300 rounded-lg"
                        />
                        <button
                          onClick={() => setCalculator({...calculator, quantity: calculator.quantity + 50})}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Ruler size={16} />
                        Ukuran
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.size_options?.map((size, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCalculator({...calculator, size})}
                            className={`px-4 py-2 rounded-lg border ${
                              calculator.size === size
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-300 hover:border-primary/50'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Layers size={16} />
                        Bahan
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.material_options?.map((material, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCalculator({...calculator, material})}
                            className={`px-4 py-2 rounded-lg border ${
                              calculator.material === material 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-gray-300 hover:border-primary/50'
                            }`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Palette size={16} />
                        Warna & Finishing
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <select 
                          className="p-3 rounded-lg border border-gray-300"
                          value={calculator.color}
                          onChange={(e) => setCalculator({...calculator, color: e.target.value})}
                        >
                          {selectedProduct.color_options?.map((color, idx) => (
                            <option key={idx} value={color}>{color}</option>
                          ))}
                        </select>
                        <select 
                          className="p-3 rounded-lg border border-gray-300"
                          value={calculator.finishing}
                          onChange={(e) => setCalculator({...calculator, finishing: e.target.value})}
                        >
                          {selectedProduct.finishing_options?.map((finish, idx) => (
                            <option key={idx} value={finish}>{finish}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={calculator.is_double_sided}
                          onChange={(e) => setCalculator({...calculator, is_double_sided: e.target.checked})}
                          className="w-5 h-5"
                        />
                        <span>Cetak 2 Sisi (+30%)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={calculator.is_urgent}
                          onChange={(e) => setCalculator({...calculator, is_urgent: e.target.checked})}
                          className="w-5 h-5"
                        />
                        <span>Order Kilat (+50%)</span>
                      </label>
                    </div>

                    {/* Price Calculator */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Estimasi</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatPrice(calculateTotalPrice())}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Waktu Pengerjaan</p>
                          <p className="text-xl font-bold text-blue-600">
                            {calculator.is_urgent ? "1-2 hari" : selectedProduct.estimated_time}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setShowDesignStudio(true);
                            setShowProductModal(false);
                          }}
                          className="flex-1 bg-white text-primary border border-primary py-3 rounded-xl hover:bg-primary/5 flex items-center justify-center gap-2"
                        >
                          <Upload size={20} />
                          Upload Desain
                        </button>
                        <button 
                          onClick={() => sendToWhatsApp('product')}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={20} />
                          Order via WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 ${
                            uploadedDesign 
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
        <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
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
        <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">FAQ <span className="text-blue-600">Percetakan</span></h2>
              <p className="text-gray-600">Pertanyaan yang sering diajukan</p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  q: "Berapa lama waktu pengerjaan?",
                  a: "Waktu pengerjaan bervariasi tergantung jenis produk. Undangan 3-5 hari, kaos 5-7 hari, banner 2-3 hari. Untuk order kilat tersedia dengan biaya tambahan 50%."
                },
                {
                  q: "Bagaimana cara pembayaran?",
                  a: "Pembayaran dilakukan via transfer bank (BCA, Mandiri, BRI) atau COD untuk area tertentu. DP minimal 50% untuk memulai pengerjaan."
                },
                {
                  q: "Apakah ada biaya desain?",
                  a: "Desain gratis untuk order minimal Rp 300.000. Untuk order di bawah itu, biaya desain mulai dari Rp 50.000 tergantung kompleksitas."
                },
                {
                  q: "Bagaimana jika desain tidak sesuai?",
                  a: "Kami memberikan 2x revisi gratis. Setelah itu, revisi tambahan dikenakan biaya Rp 25.000 per revisi."
                },
                {
                  q: "Apakah ada pengiriman ke seluruh Indonesia?",
                  a: "Ya, kami melayani pengiriman ke seluruh Indonesia dengan kurir pilihan (JNE, J&T, SiCepat, GoSend). Biaya pengiriman ditanggung pembeli."
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

     
       <Footer />
    </div>
  );
}