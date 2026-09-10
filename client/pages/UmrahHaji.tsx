import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/hooks/useSettings";
import {
  Globe, Calendar, Users, MapPin, Plane, Hotel, Utensils, Shield, Check,
  Star, Clock, Award, ChevronRight, Heart, Share2, ZoomIn, X, MessageCircle,
  FileText, CreditCard, Smartphone, Headphones, Truck, BookOpen,
  CheckCircle, Bookmark, Filter, ArrowRight, Video, Instagram,
  Facebook, Twitter, Mail, Phone, Map, Download, Play, Pause,
  Search, Sparkles
} from "lucide-react";
import Footer from "@/components/Footer";
import UmrahHajiTimeline from "@/components/UmrahHajiTimeline";
import SectionWrapper from "@/components/SectionWrapper";
import ReviewSection from "@/components/ReviewSection";
import UmrahDetailModal from "@/components/UmrahDetailModal";


interface UmrahPackage {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  discount_price?: number;
  departure_city: string;
  airline: string;
  airline_logo: string;
  hotel_mekah: string;
  hotel_madinah: string;
  hotel_rating: number;
  distance_haram: string;
  meals_included: boolean;
  tour_guide: boolean;
  visa_assistance: boolean;
  vaccination_assistance: boolean;
  transport_type: string;
  group_size: number;
  availability: number;
  rating: number;
  reviews_count: number;
  included_features: string[];
  excluded_features: string[];
  itinerary: { day: number; title: string; description: string; icon: string }[];
  important_notes: string[];
  departure_dates: { date: string; seats: number; price_variation: number }[];
  images: string[];
  featured: boolean;
  best_seller: boolean;
  early_bird_discount: boolean;
  payment_plans: { name: string; installments: number }[];
  tags: string[];
}

interface HajiPackage {
  id: number;
  name: string;
  description: string;
  quota_year: string;
  price: number;
  discount_price?: number;
  payment_terms: string[];
  included_features: string[];
  excluded_features: string[];
  requirements: string[];
  timeline: { month: string; activities: string[] }[];
  images: string[];
  featured: boolean;
  registration_deadline: string;
  available_quota: number;
  training_sessions: number;
  medical_facility: boolean;
  rating: number;
  reviews_count: number;
  accommodation_details: {
    mekah: { hotel: string; nights: number; distance: string };
    madinah: { hotel: string; nights: number; distance: string };
    jeddah?: { hotel: string; nights: number };
  };
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface Testimonial {
  id: number;
  name: string;
  city: string;
  package: string;
  rating: number;
  comment: string;
  date: string;
  image: string;
}

interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  category: string;
}

export default function ModernUmrahHaji() {
  const [activeTab, setActiveTab] = useState<'umrah' | 'haji'>('umrah');
  const { settings } = useSettings();
  const [umrahPackages, setUmrahPackages] = useState<UmrahPackage[]>([]);
  const [hajiPackages, setHajiPackages] = useState<HajiPackage[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<UmrahPackage | HajiPackage | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPackageDetail, setShowPackageDetail] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookingStep, setBookingStep] = useState(1);
  const [savedPackages, setSavedPackages] = useState<number[]>([]);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const packageCarouselRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    package_type: '',
    package_id: 0,
    pilgrim_name: '',
    pilgrim_email: '',
    pilgrim_phone: '',
    pilgrim_passport: '',
    pilgrim_passport_expiry: '',
    pilgrim_birth_date: '',
    pilgrim_gender: 'male',
    pilgrim_address: '',
    emergency_contact: '',
    emergency_relation: '',
    number_of_people: 1,
    room_type: 'double',
    special_requests: '',
    payment_method: '',
    agree_terms: false
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const loadData = async () => {
      try {
        const [umrahRes, hajiRes, faqRes, testimonialRes, galleryRes] = await Promise.all([
          fetch('/api/umrah-packages').then(res => res.json()).catch(err => ({ success: false, data: [] })),
          fetch('/api/haji-packages').then(res => res.json()).catch(err => ({ success: false, data: [] })),
          fetch('/api/service-faqs?type=umrah-haji').then(res => res.json()).catch(err => ({ success: false, data: [] })),
          fetch('/api/testimonials?type=umrah-haji').then(res => res.json()).catch(err => ({ success: false, data: [] })),
          fetch('/api/gallery?category=umrah-haji').then(res => res.json()).catch(err => ({ success: false, data: [] }))
        ]);

        // Safely set data with validation
        if (umrahRes.success && Array.isArray(umrahRes.data)) {
          // Filter only umrah packages
          setUmrahPackages(umrahRes.data.filter((p: any) => !p.package_type || p.package_type === 'umrah'));
        } else {
          console.warn('Invalid umrah packages data:', umrahRes);
          setUmrahPackages([]);
        }

        const hajiList: any[] = [
          ...(hajiRes.success && Array.isArray(hajiRes.data) ? hajiRes.data : []),
          ...(umrahRes.success && Array.isArray(umrahRes.data) ? umrahRes.data.filter((p: any) => p.package_type === 'haji') : [])
        ];
        setHajiPackages(hajiList);

        if (faqRes.success && Array.isArray(faqRes.data)) {
          setFaqs(faqRes.data);
        } else {
          setFaqs([]);
        }

        if (testimonialRes.success && Array.isArray(testimonialRes.data)) {
          setTestimonials(testimonialRes.data);
        } else {
          setTestimonials([]);
        }

        if (galleryRes.success && Array.isArray(galleryRes.data)) {
          setGallery(galleryRes.data);
        } else {
          setGallery([]);
        }

        // Only load sample data if BOTH are truly empty
        const umrahEmpty = !umrahRes.success || !Array.isArray(umrahRes.data) || umrahRes.data.length === 0;
        const hajiEmpty = !hajiRes.success || !Array.isArray(hajiRes.data) || hajiRes.data.length === 0;

        if (umrahEmpty && hajiEmpty) {
          console.log('Loading sample data as fallback - both APIs empty');
          loadSampleData();
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Load sample data for demonstration
        loadSampleData();
      }
    };

    loadData();
  }, []);

  const loadSampleData = () => {
    // Sample Umrah Packages
    const sampleUmrahPackages: UmrahPackage[] = [
      {
        id: 1,
        name: "Umrah Reguler Barakah 9 Hari",
        description: "Paket umrah favorit dengan penerbangan langsung Saudi Airlines dan hotel bintang 4 dekat Masjidil Haram.",
        duration: 9,
        price: 28500000,
        discount_price: 26900000,
        departure_city: "Jakarta",
        airline: "Saudi Airlines",
        airline_logo: "/airline-logo/saudi.png",
        hotel_mekah: "Le Meridien Towers Makkah",
        hotel_madinah: "Grand Plaza Madinah",
        hotel_rating: 4,
        distance_haram: "150m ke Pelataran",
        meals_included: true,
        tour_guide: true,
        visa_assistance: true,
        vaccination_assistance: true,
        transport_type: "Bus AC Eksekutif & Kereta Cepat Haramain",
        group_size: 40,
        availability: 12,
        rating: 4.9,
        reviews_count: 320,
        included_features: [
          "Tiket pesawat PP Direct Jakarta - Jeddah/Madinah",
          "Hotel Makkah & Madinah Bintang 4",
          "Makan 3x sehari Fullboard Buffet menu Indonesia",
          "Ziarah lengkap Makkah & Madinah + Thaif",
          "Free Kereta Cepat Haramain (Madinah - Makkah)",
          "Perlengkapan Ibadah & Koper Fiber Lengkap",
          "Air Zamzam 5 Liter Resmi"
        ],
        excluded_features: [
          "Pembuatan Paspor",
          "Pengeluaran Pribadi (Laundry/Telepon)"
        ],
        itinerary: [],
        important_notes: ["Paspor minimal berlaku 8 bulan", "Vaksin meningitis"],
        departure_dates: [
          { date: "2024-10-15", seats: 20, price_variation: 0 },
          { date: "2024-11-20", seats: 15, price_variation: 0 }
        ],
        images: [
          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        best_seller: true,
        early_bird_discount: true,
        payment_plans: [{ name: "DP 5 Juta", installments: 1 }],
        tags: ["Paling Populer", "Direct Flight", "Free Kereta Cepat"]
      },
      {
        id: 2,
        name: "Umrah VIP Royal Clock Tower 12 Hari",
        description: "Pengalaman ibadah termewah menginap di Makkah Clock Tower bintang 5 persis di depan Ka'bah.",
        duration: 12,
        price: 42000000,
        discount_price: 38500000,
        departure_city: "Jakarta / Surabaya",
        airline: "Garuda Indonesia",
        airline_logo: "/airline-logo/garuda.png",
        hotel_mekah: "Makkah Clock Royal Tower (Fairmont)",
        hotel_madinah: "Anwar Al Madinah Movenpick",
        hotel_rating: 5,
        distance_haram: "50m (Pelataran Depan)",
        meals_included: true,
        tour_guide: true,
        visa_assistance: true,
        vaccination_assistance: true,
        transport_type: "Private Bus VIP & High Speed Train",
        group_size: 25,
        availability: 8,
        rating: 5.0,
        reviews_count: 185,
        included_features: [
          "Tiket Garuda Indonesia Direct Flight",
          "Hotel Bintang 5 View Ka'bah",
          "Makan 3x Sehari International Buffet",
          "Kereta Cepat Haramain First Class",
          "Ziarah Eksklusif Kota Thaif & Jabal Nur",
          "Perlengkapan Mewah Koper 24 inch + Tas Paspor Anti Maling",
          "Handling VIP Bandara Soetta & Jeddah"
        ],
        excluded_features: [
          "Pembuatan Paspor",
          "Pengeluaran Pribadi"
        ],
        itinerary: [],
        important_notes: ["Paspor minimal berlaku 8 bulan"],
        departure_dates: [
          { date: "2024-11-10", seats: 10, price_variation: 0 }
        ],
        images: [
          "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        best_seller: false,
        early_bird_discount: true,
        payment_plans: [{ name: "DP 5 Juta", installments: 1 }],
        tags: ["Bintang 5", "Clock Tower", "VIP Service"]
      },
      {
        id: 3,
        name: "Umrah Plus Wisata Halal Turki 12 Hari",
        description: "Kombinasi ibadah umrah khusyuk dan napak tilas sejarah Islam di Istanbul & Cappadocia.",
        duration: 12,
        price: 38000000,
        discount_price: 35000000,
        departure_city: "Jakarta",
        airline: "Turkish Airlines",
        airline_logo: "/airline-logo/turkish.png",
        hotel_mekah: "Swissotel Makkah",
        hotel_madinah: "Pullman Zamzam Madinah",
        hotel_rating: 5,
        distance_haram: "100m ke Haram",
        meals_included: true,
        tour_guide: true,
        visa_assistance: true,
        vaccination_assistance: true,
        transport_type: "Bus AC Pariwisata",
        group_size: 35,
        availability: 15,
        rating: 4.9,
        reviews_count: 140,
        included_features: [
          "Tiket Pesawat Turkish Airlines PP",
          "Wisata Blue Mosque, Hagia Sophia & Bosphorus Cruise",
          "Hotel Bintang 5 di Makkah, Madinah & Istanbul",
          "Fullboard Meals & Wisata Kuliner Khas Turki",
          "Visa Umrah + Visa Turki",
          "Perlengkapan Ibadah Lengkap + Air Zamzam 5L"
        ],
        excluded_features: [
          "Optional Hot Air Balloon Cappadocia",
          "Pengeluaran Pribadi"
        ],
        itinerary: [],
        important_notes: ["Paspor minimal berlaku 8 bulan"],
        departure_dates: [
          { date: "2024-12-05", seats: 15, price_variation: 0 }
        ],
        images: [
          "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        best_seller: false,
        early_bird_discount: false,
        payment_plans: [{ name: "DP 5 Juta", installments: 1 }],
        tags: ["Plus Turki", "Bosphorus Cruise", "Sejarah Islam"]
      }
    ];

    const sampleHajiPackages: HajiPackage[] = [
      {
        id: 1,
        name: "Haji Furoda / Mujamalah (Langsung Berangkat)",
        description: "Ibadah haji resmi dengan Visa Mujamalah Kerajaan Arab Saudi tanpa perlu antre bertahun-tahun.",
        quota_year: "1446H / 2025M",
        price: 280000000,
        discount_price: 265000000,
        payment_terms: [
          "DP USD 5,000 saat pendaftaran",
          "Pelunasan setelah visa terbit (H-45)",
          "Garansi uang kembali 100% jika visa tidak terbit"
        ],
        included_features: [
          "Visa Haji Furoda Resmi Kerajaan Arab Saudi",
          "Tiket Pesawat Saudi Airlines Direct PP",
          "Hotel Bintang 5 Dekat Masjidil Haram & Nabawi",
          "Maktab VIP Tenda AC Arafah & Mina",
          "Fullboard Buffet Dining & Snack 24 Jam",
          "Dokter & Tim Medis Standby Khusus",
          "Perlengkapan Haji Eksklusif & Air Zamzam 5L"
        ],
        excluded_features: [
          "Dam / Qurban Pribadi",
          "Pengeluaran Pribadi"
        ],
        requirements: [
          "Paspor asli dengan masa berlaku minimal 1 tahun",
          "KTP & KK",
          "Buku Nikah / Akta Lahir",
          "Vaksin Meningitis & Polio"
        ],
        timeline: [
          { month: "Januari - Maret", activities: ["Pendaftaran & Pembayaran DP"] },
          { month: "April", activities: ["Manasik Haji Intensif"] },
          { month: "Dzulqa'dah", activities: ["Penerbitan Visa & Keberangkatan"] }
        ],
        images: [
          "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80"
        ],
        featured: true,
        registration_deadline: "2025-04-15",
        available_quota: 10,
        training_sessions: 8,
        medical_facility: true,
        rating: 5.0,
        reviews_count: 98,
        accommodation_details: {
          mekah: { hotel: "Makkah Clock Royal Tower (Fairmont)", nights: 15, distance: "50m" },
          madinah: { hotel: "Anwar Al Madinah Movenpick", nights: 8, distance: "50m" },
          jeddah: { hotel: "Hilton Jeddah", nights: 2 }
        }
      },
      {
        id: 2,
        name: "Haji Plus Kuota Kemenag RI",
        description: "Haji khusus resmi kuota pemerintah dengan masa tunggu singkat dan fasilitas hotel bintang 5.",
        quota_year: "1446H - 1448H",
        price: 165000000,
        discount_price: 155000000,
        payment_terms: [
          "Setoran awal BPIH USD 4,500 untuk nomor porsi",
          "Pelunasan saat tahun keberangkatan tiba"
        ],
        included_features: [
          "Nomor Porsi Resmi Haji Khusus Kemenag",
          "Akomodasi Hotel Bintang 5 Dekat Haram",
          "Tenda AC Maktab VIP Mina & Arafah",
          "Bimbingan Manasik Lengkap Bersama Ulama",
          "Konsumsi 3x Sehari Menu Nusantara",
          "Perlengkapan Haji Komplit & Air Zamzam"
        ],
        excluded_features: [
          "Dam Qurban Pribadi",
          "Pengeluaran Pribadi"
        ],
        requirements: [
          "KTP, KK, Buku Nikah/Akta",
          "Paspor Asli"
        ],
        timeline: [
          { month: "Setiap Saat", activities: ["Pendaftaran Nomor Porsi"] }
        ],
        images: [
          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80"
        ],
        featured: false,
        registration_deadline: "2025-05-01",
        available_quota: 20,
        training_sessions: 6,
        medical_facility: true,
        rating: 4.9,
        reviews_count: 145,
        accommodation_details: {
          mekah: { hotel: "Swissotel Al Maqam Makkah", nights: 12, distance: "100m" },
          madinah: { hotel: "Pullman Zamzam Madinah", nights: 8, distance: "100m" }
        }
      }
    ];

    setUmrahPackages(sampleUmrahPackages);
    setHajiPackages(sampleHajiPackages);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const scrollPackageToIndex = (index: number) => {
    const list = activeTab === 'umrah' ? umrahPackages : hajiPackages;
    if (index < 0) index = 0;
    if (index >= list.length) index = list.length - 1;
    setCurrentPackageIndex(index);
    if (packageCarouselRef.current) {
      const cardWidth = packageCarouselRef.current.offsetWidth;
      packageCarouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handlePackageScroll = () => {
    if (packageCarouselRef.current) {
      const cardWidth = packageCarouselRef.current.offsetWidth;
      const scrollLeft = packageCarouselRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      const list = activeTab === 'umrah' ? umrahPackages : hajiPackages;
      if (newIndex !== currentPackageIndex && newIndex >= 0 && newIndex < list.length) {
        setCurrentPackageIndex(newIndex);
      }
    }
  };

  const handleBookingClick = (pkg: UmrahPackage | HajiPackage, type: 'umrah' | 'haji') => {
    try {
      const whatsappNumber = settings["umrah-whatsapp"] ? settings["umrah-whatsapp"].replace(/\D/g, "") : (settings["whatsapp"] ? settings["whatsapp"].replace(/\D/g, "") : '6285329077987');
      const packageType = type === 'umrah' ? 'Umrah' : 'Haji';

      const template = settings["umrah-booking-message"] || "Halo! Saya tertarik dengan paket {packageType}: {packageName}\n\nDetail Paket:\n- Nama Paket: {packageName}\n- Harga: {packagePrice}";
      let message = template
        .replace(/{packageType}/g, packageType)
        .replace(/{packageName}/g, pkg.name)
        .replace(/{packagePrice}/g, `Rp ${pkg.discount_price ? pkg.discount_price.toLocaleString() : pkg.price.toLocaleString()}`);

      if (type === 'umrah') {
        const umrahPkg = pkg as UmrahPackage;
        message += `\n- Durasi: ${umrahPkg.duration || 'N/A'} hari\n- Keberangkatan dari: ${umrahPkg.departure_city || 'Jakarta'}`;
      } else {
        const HajiPkg = pkg as HajiPackage;
        message += `\n- Kuota Tahun: ${HajiPkg.quota_year || 'N/A'}\n- Kuota Tersedia: ${HajiPkg.available_quota || 'N/A'}`;
      }

      message += `\n\nMohon informasi lebih lanjut dan cara pendaftaran. Terima kasih!`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const toggleSavePackage = (id: number) => {
    setSavedPackages(prev =>
      prev.includes(id)
        ? prev.filter(pkgId => pkgId !== id)
        : [...prev, id]
    );
  };

  const toggleCompare = (id: number) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(pkgId => pkgId !== id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, id]);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderUmrahPackageCard = (pkg: UmrahPackage) => {
    try {
      return (
        <div key={pkg.id || Math.random()} className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          {/* Card Header with Badges */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
              {pkg.images && pkg.images.length > 0 ? (
                <img
                  src={pkg.images[0]}
                  alt={pkg.name || 'Package'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Hotel className="w-16 h-16 text-white opacity-30" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {pkg.featured && (
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ FEATURED
                  </span>
                )}
                {pkg.best_seller && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🏆 BEST SELLER
                  </span>
                )}
                {pkg.early_bird_discount && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🐦 EARLY BIRD
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSavePackage(pkg.id);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${savedPackages.includes(pkg.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  <Heart className={`w-5 h-5 ${savedPackages.includes(pkg.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompare(pkg.id);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${compareList.includes(pkg.id) ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {/* Package Info */}
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {pkg.name || 'Paket Umrah'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Berangkat dari {pkg.departure_city || 'Jakarta'}</span>
                  </div>
                </div>
                <div className="text-right">
                  {pkg.discount_price ? (
                    <>
                      <span className="text-2xl font-bold text-red-600">{formatPrice(pkg.discount_price)}</span>
                      <span className="text-sm text-gray-500 line-through block">{formatPrice(pkg.price)}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(pkg.price || 0)}</span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{pkg.duration || 0} Hari</p>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center justify-between mb-4">
                {renderStars(pkg.rating || 0)}
                <span className="text-sm text-gray-500">({pkg.reviews_count || 0} reviews)</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {pkg.tags?.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">{pkg.airline || 'Garuda Indonesia'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hotel className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium">{pkg.hotel_rating || 5}⭐ Hotel</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{pkg.group_size || 30} Orang/Grup</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium">{pkg.availability || 15} Kursi Tersedia</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleBookingClick(pkg, 'umrah')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Pesan Sekarang
              </button>
              <button
                onClick={() => {
                  setSelectedPackage(pkg);
                  setShowPackageDetail(true);
                }}
                className="px-4 border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering umrah package card:', error, pkg);
      return (
        <div key={pkg.id || Math.random()} className="bg-white rounded-2xl shadow-xl p-6">
          <p className="text-red-500">Error loading package. Please try again.</p>
        </div>
      );
    }
  };

  const renderHajiPackageCard = (pkg: HajiPackage) => {
    try {
      return (
        <div key={pkg.id || Math.random()} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="p-6">
            {/* Header with Ribbon */}
            <div className="relative mb-6">
              {pkg.featured && (
                <div className="absolute -top-6 -left-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-2 rotate-45 shadow-lg">
                  <span className="text-xs font-bold">RECOMMENDED</span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{pkg.name || 'Paket Haji'}</h3>
                  <p className="text-lg text-emerald-600 font-semibold">{pkg.quota_year || 'N/A'}</p>
                </div>
                <div className="text-right">
                  {pkg.discount_price ? (
                    <>
                      <span className="text-3xl font-bold text-emerald-700">{formatPrice(pkg.discount_price)}</span>
                      <span className="text-sm text-gray-500 line-through block">{formatPrice(pkg.price)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-emerald-700">{formatPrice(pkg.price || 0)}</span>
                  )}
                  <div className="mt-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                      Kuota: {pkg.available_quota || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              {renderStars(pkg.rating || 0)}
              <span className="text-sm text-gray-500">• {pkg.reviews_count || 0} reviews</span>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">Deadline</span>
                </div>
                <p className="text-sm text-gray-600">
                  {pkg.registration_deadline ? new Date(pkg.registration_deadline).toLocaleDateString('id-ID') : 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">Training</span>
                </div>
                <p className="text-sm text-gray-600">{pkg.training_sessions || 0} Sesi</p>
              </div>
            </div>

            {/* Accommodation Preview */}
            <div className="mb-6">
              <h4 className="font-bold mb-3 text-gray-800">Akomodasi:</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-sm">🏨 Mekah</p>
                  <p className="text-xs text-gray-600">
                    {pkg.accommodation_details?.mekah?.hotel || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pkg.accommodation_details?.mekah?.nights || 0} malam
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-sm">🕌 Madinah</p>
                  <p className="text-xs text-gray-600">
                    {pkg.accommodation_details?.madinah?.hotel || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pkg.accommodation_details?.madinah?.nights || 0} malam
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleBookingClick(pkg, 'haji')}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Daftar Haji
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setShowPackageDetail(true);
                  }}
                  className="flex-1 border-2 border-emerald-600 text-emerald-600 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                >
                  Detail Lengkap
                </button>
                <button className="flex-1 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Konsultasi
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering Haji package card:', error, pkg);
      return (
        <div key={pkg.id || Math.random()} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl p-6">
          <p className="text-red-500">Error loading package. Please try again.</p>
        </div>
      );
    }
  };

  const renderBookingModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Pendaftaran {activeTab === 'umrah' ? 'Umrah' : 'Haji'}</h3>
            <p className="text-gray-600">Step {bookingStep} of 3</p>
          </div>
          <button
            onClick={() => setShowBookingModal(false)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bookingStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-4 ${bookingStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={bookingStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Data Jamaah</span>
            <span className={bookingStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Pembayaran</span>
            <span className={bookingStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Konfirmasi</span>
          </div>
        </div>

        <div className="p-6">
          {bookingStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingForm.pilgrim_name}
                  onChange={(e) => setBookingForm({ ...bookingForm, pilgrim_name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingForm.pilgrim_email}
                  onChange={(e) => setBookingForm({ ...bookingForm, pilgrim_email: e.target.value })}
                />
                <input
                  type="tel"
                  placeholder="Nomor WhatsApp"
                  className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingForm.pilgrim_phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, pilgrim_phone: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Nomor Paspor"
                  className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingForm.pilgrim_passport}
                  onChange={(e) => setBookingForm({ ...bookingForm, pilgrim_passport: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Tanggal Expired Paspor"
                  className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingForm.pilgrim_passport_expiry}
                  onChange={(e) => setBookingForm({ ...bookingForm, pilgrim_passport_expiry: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="Tanggal Lahir"
                  className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={bookingForm.pilgrim_birth_date}
                  onChange={(e) => setBookingForm({ ...bookingForm, pilgrim_birth_date: e.target.value })}
                />
              </div>

              <textarea
                placeholder="Alamat Lengkap"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={bookingForm.pilgrim_address}
                onChange={(e) => setBookingForm({ ...bookingForm, pilgrim_address: e.target.value })}
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="space-y-6">
              <h4 className="text-xl font-bold">Metode Pembayaran</h4>
              <div className="grid grid-cols-3 gap-4">
                {['Transfer Bank', 'Credit Card', 'E-Wallet'].map((method) => (
                  <button
                    key={method}
                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 ${bookingForm.payment_method === method ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setBookingForm({ ...bookingForm, payment_method: method })}
                  >
                    {method === 'Transfer Bank' && <CreditCard className="w-8 h-8 text-blue-600" />}
                    {method === 'Credit Card' && <CreditCard className="w-8 h-8 text-green-600" />}
                    {method === 'E-Wallet' && <Smartphone className="w-8 h-8 text-purple-600" />}
                    <span className="font-medium">{method}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setBookingStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setBookingStep(3)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Lanjut ke Konfirmasi
                </button>
              </div>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold">Pendaftaran Berhasil!</h4>
              <p className="text-gray-600">
                Tim kami akan menghubungi Anda dalam 1x24 jam untuk proses selanjutnya.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    // Download invoice logic
                    alert('Invoice berhasil diunduh');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGalleryModal = () => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-fade-in">
      <div className="relative w-full h-full">
        <button
          onClick={() => setShowGallery(false)}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {selectedGalleryItem?.type === 'video' ? (
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={selectedGalleryItem.url}
              className="max-w-full max-h-full"
              controls
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={selectedGalleryItem?.url || ''}
              alt={selectedGalleryItem?.title || ''}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        <div className="absolute bottom-4 left-0 right-0 text-center">
          <h3 className="text-white text-xl font-bold">{selectedGalleryItem?.title}</h3>
          <p className="text-white/80">{selectedGalleryItem?.description}</p>
        </div>
      </div>
    </div>
  );

  const renderCompareModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold">Bandingkan Paket</h3>
          <button
            onClick={() => setShowCompare(false)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Compare table would go here */}
            <p className="col-span-4 text-center py-8 text-gray-500">
              Fitur perbandingan akan ditampilkan di sini
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const displayFaqs = [
    {
      question: settings["umrah-faq-1-q"] || "Apa saja persyaratan pendaftaran Umrah?",
      answer: settings["umrah-faq-1-a"] || "Persyaratan utama meliputi paspor asli dengan masa berlaku minimal 6 bulan, foto kopi KTP & KK, pasfoto 4x6 latar belakang putih (2 lembar), serta bukti vaksinasi sesuai ketentuan."
    },
    {
      question: settings["umrah-faq-2-q"] || "Apakah harga paket sudah termasuk visa dan tiket pesawat?",
      answer: settings["umrah-faq-2-a"] || "Ya, semua paket Umrah dan Haji kami bersifat all-inclusive (all-in). Sudah termasuk tiket pesawat PP kelas ekonomi, visa Umrah/Haji, akomodasi hotel di Mekah & Madinah, konsumsi 3x sehari, transportasi bus AC, mutawwif (pembimbing), air zam-zam, serta perlengkapan ibadah lengkap."
    },
    {
      question: settings["umrah-faq-3-q"] || "Bagaimana jika saya ingin sekamar berdua atau bertiga saja?",
      answer: settings["umrah-faq-3-a"] || "Sangat bisa. Default harga paket biasanya didasarkan pada kamar Quad (sekamar berempat). Jika Anda menginginkan sekamar bertiga (Triple) or berdua (Double), silakan pilih opsi tipe kamar saat booking dengan penyesuaian biaya tambahan sesuai katalog."
    },
    {
      question: settings["umrah-faq-4-q"] || "Bagaimana sistem pembatalan dan pengembalian dana?",
      answer: settings["umrah-faq-4-a"] || "Pembatalan setelah booking seat dikenakan biaya administrasi. Pembatalan 30 hari sebelum keberangkatan dikenakan potongan 50% dari harga paket, sedangkan pembatalan kurang dari 15 hari sebelum keberangkatan tidak dapat di-refund karena tiket pesawat dan hotel sudah di-issued."
    }
  ];

  const whyUs = [
    {
      icon: Shield,
      title: settings["umrah-why-1-title"] || "Legal & Terpercaya",
      description: settings["umrah-why-1-desc"] || "Berizin resmi Kemenag RI dengan sertifikasi lengkap",
      features: [
        settings["umrah-why-1-f1"] || "Izin PPIU No. 123/2023",
        settings["umrah-why-1-f2"] || "Sertifikat Halal",
        settings["umrah-why-1-f3"] || "Asuransi Lengkap"
      ]
    },
    {
      icon: Hotel,
      title: settings["umrah-why-2-title"] || "Akomodasi Premium",
      description: settings["umrah-why-2-desc"] || "Hotel bintang 4 & 5 dekat Masjidil Haram & Nabawi",
      features: [
        settings["umrah-why-2-f1"] || "Jarak <500m",
        settings["umrah-why-2-f2"] || "Free WiFi",
        settings["umrah-why-2-f3"] || "Breakfast Buffet"
      ]
    },
    {
      icon: Users,
      title: settings["umrah-why-3-title"] || "Bimbingan Eksklusif",
      description: settings["umrah-why-3-desc"] || "Dibimbing ustadz/ustadzah kompeten berpengalaman",
      features: [
        settings["umrah-why-3-f1"] || "Talaqqi Quran",
        settings["umrah-why-3-f2"] || "Bimbingan Manasik",
        settings["umrah-why-3-f3"] || "Konsultasi Ibadah"
      ]
    },
    {
      icon: Headphones,
      title: settings["umrah-why-4-title"] || "Layanan 24/7",
      description: settings["umrah-why-4-desc"] || "Tim pendamping siap membantu selama perjalanan",
      features: [
        settings["umrah-why-4-f1"] || "Medical Support",
        settings["umrah-why-4-f2"] || "Customer Care",
        settings["umrah-why-4-f3"] || "Emergency Response"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Page Header - White section */}
      <SectionWrapper id="umrah-header" delay={100} animationType="fade-in-up">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 pt-28 pb-8 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs sm:text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Penyelenggara Ibadah Umrah & Haji Berizin Resmi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
            {activeTab === 'umrah' ? '🕋 Paket Umrah Unggulan' : '🕌 Paket Haji Khusus & Furoda'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-light">
            Geser (swipe) ke kiri & kanan untuk memilih program keberangkatan, lalu ketuk untuk membaca rincian artikel lengkap.
          </p>
        </div>
      </SectionWrapper>

      {/* Packages Showcase Carousel Section */}
      <SectionWrapper id="umrah-packages" delay={200} animationType="fade-in-up">
        <div className="pt-6 pb-16 px-3 sm:px-6 md:px-8 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">

          <div className="max-w-6xl mx-auto relative z-10">

            {/* Sub-Tabs / Pills for quick package selection (responsive horizontal scroll, no clipping) */}
            <div className="w-full overflow-x-auto scrollbar-none py-2 px-1 mb-6 sm:mb-8">
              <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 min-w-max mx-auto px-2">
                {(activeTab === 'umrah' ? umrahPackages : hajiPackages).map((pkg: any, idx: number) => (
                  <button
                    key={pkg.id || idx}
                    onClick={() => scrollPackageToIndex(idx)}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${currentPackageIndex === idx
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-105"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                      }`}
                  >
                    <span>{pkg.name}</span>
                    {pkg.featured && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">UNGGULAN</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile-First Big Showcase Box Carousel */}
            <div className="relative">

              {/* Arrow Controls (Hidden on mobile to avoid overlapping content, visible on tablet/desktop) */}
              {(activeTab === 'umrah' ? umrahPackages : hajiPackages).length > 1 && (
                <>
                  <button
                    onClick={() => scrollPackageToIndex(currentPackageIndex - 1)}
                    disabled={currentPackageIndex === 0}
                    className={`hidden sm:flex absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xl items-center justify-center transition-all ${currentPackageIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                      }`}
                    aria-label="Paket Sebelumnya"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 rotate-180" />
                  </button>

                  <button
                    onClick={() => scrollPackageToIndex(currentPackageIndex + 1)}
                    disabled={currentPackageIndex === (activeTab === 'umrah' ? umrahPackages : hajiPackages).length - 1}
                    className={`hidden sm:flex absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xl items-center justify-center transition-all ${currentPackageIndex === (activeTab === 'umrah' ? umrahPackages : hajiPackages).length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                      }`}
                    aria-label="Paket Selanjutnya"
                  >
                    <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                  </button>
                </>
              )}

              {/* Swipeable Container */}
              <div
                ref={packageCarouselRef}
                onScroll={handlePackageScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-3xl touch-pan-x"
                style={{ scrollBehavior: 'smooth' }}
              >
                {(activeTab === 'umrah' ? umrahPackages : hajiPackages).map((pkg: any, idx: number) => {
                  const effectivePrice = pkg.discount_price || pkg.price;
                  const bgImage = (pkg.images && pkg.images.length > 0) ? pkg.images[0] : (activeTab === 'umrah'
                    ? "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80"
                    : "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80");

                  return (
                    <div
                      key={pkg.id || idx}
                      className="w-full flex-shrink-0 snap-center p-1 sm:p-2"
                    >
                      <div
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowPackageDetail(true);
                        }}
                        className="group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-950 border border-white/15 shadow-2xl transition-all duration-500 hover:border-emerald-400/50"
                      >
                        {/* Big Image View */}
                        <div className="relative h-[460px] sm:h-[500px] md:h-[550px] w-full overflow-hidden">
                          <img
                            src={bgImage}
                            alt={pkg.name}
                            className="w-full h-full object-cover brightness-[0.7] group-hover:scale-105 transition-transform duration-700 ease-out"
                          />

                          {/* Gradient Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent"></div>
                          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

                          {/* Top Badges */}
                          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                            <span className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                              <Plane className="w-3.5 h-3.5" />
                              <span>{pkg.airline || (activeTab === 'umrah' ? 'Saudi Airlines Direct' : 'Penerbangan Haji VIP')}</span>
                            </span>

                            {pkg.featured && (
                              <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-lg uppercase tracking-wider">
                                ★ BEST PROGRAM
                              </span>
                            )}
                          </div>

                          {/* Bottom Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-10 space-y-4">

                            {/* Price & Duration */}
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5 sm:gap-2">
                              <div>
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-0.5">
                                  Investasi Ibadah
                                </span>
                                <div className="text-2xl sm:text-4xl md:text-5xl font-serif font-extrabold text-amber-400 tracking-tight leading-tight">
                                  {formatPrice(effectivePrice)}
                                </div>
                              </div>
                              <span className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm text-emerald-300 font-semibold whitespace-nowrap">
                                ⏱️ {pkg.duration || (activeTab === 'umrah' ? '9' : '25')} Hari Program
                              </span>
                            </div>

                            {/* Title & Short Description */}
                            <div>
                              <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white mb-1 leading-snug group-hover:text-emerald-300 transition-colors">
                                {pkg.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 font-light leading-relaxed">
                                {pkg.description || "Layanan ibadah lengkap all-inclusive dengan hotel dekat masjid dan bimbingan mutawwif berpengalaman."}
                              </p>
                            </div>

                            {/* 3 Key Feature Tags */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                                <Hotel className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{pkg.hotel_mekah || 'Hotel Bintang 5 Dekat Haram'}</span>
                              </span>
                              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{pkg.distance_haram || '±100m ke Pelataran'}</span>
                              </span>
                              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 font-medium flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                                <span>All-In Visa & Perlengkapan</span>
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">

                              {/* Main Button: Detail Selengkapnya */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPackage(pkg);
                                  setShowPackageDetail(true);
                                }}
                                className="relative group/btn overflow-hidden flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base transition-all duration-300 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <div className="absolute inset-0 w-1/2 h-full bg-white/30 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out" />
                                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950/20" />
                                <span className="tracking-wide">Detail Selengkapnya</span>
                                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                              </button>

                              {/* WhatsApp Consultation */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookingClick(pkg, activeTab);
                                }}
                                className="py-3.5 sm:py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
                              >
                                <MessageCircle className="w-5 h-5 text-emerald-400" />
                                <span>Konsultasi Seat</span>
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
                onClick={() => scrollPackageToIndex(currentPackageIndex - 1)}
                disabled={currentPackageIndex === 0}
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                aria-label="Paket Sebelumnya"
              >
                <ChevronRight className="w-4 h-4 text-emerald-600 rotate-180" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 overflow-x-auto max-w-[150px] px-1 py-1">
                {(activeTab === 'umrah' ? umrahPackages : hajiPackages).map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => scrollPackageToIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${currentPackageIndex === idx
                        ? "w-8 bg-emerald-500"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => scrollPackageToIndex(currentPackageIndex + 1)}
                disabled={currentPackageIndex === (activeTab === 'umrah' ? umrahPackages : hajiPackages).length - 1}
                className="flex sm:hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
                aria-label="Paket Selanjutnya"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-3 sm:hidden">
              ← Geser layar ke kiri atau kanan untuk memilih paket →
            </p>

          </div>
        </div>
      </SectionWrapper>
      <SectionWrapper id="umrah-timeline" delay={200} animationType="fade-in-up">
        <UmrahHajiTimeline />
      </SectionWrapper>

      {/* Why Choose Us - Enhanced */}
      <SectionWrapper id="umrah-why" delay={100} animationType="fade-in-up">
        <div className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                {settings["umrah-why-title"] || "Mengapa Memilih Kami?"}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {settings["umrah-why-desc"] || "Komitmen kami adalah memberikan pengalaman ibadah yang sempurna dengan layanan terbaik"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyUs.map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((feat, featIdx) => (
                      <li key={featIdx} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper id="umrah-reviews" delay={100} animationType="fade-in-up">
        <div className="py-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4">
            <ReviewSection
              type="umrah"
              itemId={0}
              itemName="Layanan Umrah & Haji"
              accent="emerald"
            />
          </div>
        </div>
      </SectionWrapper>


      {/* FAQ Section */}
      <SectionWrapper id="umrah-faq" delay={100} animationType="fade-in-up">
        <div className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                {settings["umrah-faq-title"] || "Pertanyaan Umum"}
              </h2>
              <p className="text-gray-600">
                {settings["umrah-faq-subtitle"] || "Temukan jawaban untuk pertanyaan yang sering diajukan"}
              </p>
            </div>

            <div className="space-y-4">
              {displayFaqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={(e) => {
                      const content = e.currentTarget.nextElementSibling;
                      const icon = e.currentTarget.querySelector('svg');
                      if (content && icon) {
                        content.classList.toggle('hidden');
                        icon.classList.toggle('rotate-90');
                      }
                    }}
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform" />
                  </button>
                  <div className="hidden px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <Footer />

      {/* Modals */}
      {showBookingModal && renderBookingModal()}
      {showGallery && selectedGalleryItem && renderGalleryModal()}
      {showCompare && renderCompareModal()}

      {/* Interactive Article-Style Umrah & Haji Detail Modal */}
      <UmrahDetailModal
        pkg={selectedPackage}
        isOpen={showPackageDetail}
        onClose={() => setShowPackageDetail(false)}
        type={activeTab}
      />
    </div>
  );
}
