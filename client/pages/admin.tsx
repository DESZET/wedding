import { useState, useEffect, useMemo } from "react";
import {
  Home,
  Image,
  MessageSquare,
  Package,
  MapPin,
  Video,
  Users,
  Settings,
  Calendar,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  ChevronLeft,
  Menu,
  Eye,
  Printer,
  Globe,
  Scissors,
  Heart,
  Palette,
  FileImage,
  Layout,
  BookOpen,
  ShoppingBag,
  Tag,
  CreditCard,
  Truck,
  CheckCircle,
  Package as PackageIcon,
  Clock,
  User,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  CreditCard as CreditCardIcon,
  Filter,
  Search,
  Download,
  Star,
  AlertCircle,
  Info,
  Calendar as CalendarIcon,
  Plane,
  Hotel,
  Utensils,
  Shield,
  Award,
  Users as UsersIcon,
  CloudUpload,
  FileText,
  DollarSign,
  Percent,
  Sparkles,
  Monitor,
} from "lucide-react";
import {
  GalleryItem,
  TestimonialItem,
  PackageItem,
  VenueItem,
  VideoItem,
  StatItem,
  SectionImageItem,
  CreateGalleryItem,
  CreateTestimonialItem,
  CreatePackageItem,
  CreateVenueItem,
  CreateVideoItem,
  CreateStatItem,
  CreateSectionImageItem,
  ApiResponse,
  ListResponse
} from "../../shared/api";
import { useSettings } from "../hooks/useSettings.tsx";
import { compressImage } from "@/lib/imageCompressor";
import AppearanceSettings from "../components/admin/AppearanceSettings";

// ============ TYPE DEFINITIONS ============
type MenuItem = 'dashboard' | 'gallery' | 'testimonials' | 'packages' | 'venues' | 'videos' | 'wedding-show' | 'stats' | 'customers' | 'settings' | 'printing' | 'umrah-haji' | 'appearance';
type ActionMode = 'view' | 'add' | 'edit';

// ============ HELPER FUNCTIONS ============
// Move these BEFORE the components that use them

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

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

// ============ API FUNCTIONS (moved before components that need them) ============
const API_BASE = '/api';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return response.json();
};

const uploadFile = async (file: File) => {
  const processed = await compressImage(file);
  const formData = new FormData();
  formData.append('image', processed);
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

const uploadVideoFile = async (file: File) => {
  const formData = new FormData();
  formData.append('video', file);
  const response = await fetch(`${API_BASE}/upload-video`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

// ============ HELPER: Parse images from any format ============
// Handles: Array, JSON string '["img"]', or comma-separated string
const parseImages = (raw: any): string[] => {
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

const getFirstImage = (raw: any, fallback: string): string => {
  const imgs = parseImages(raw);
  return imgs.length > 0 ? imgs[0] : fallback;
};

// ============ MAIN ADMIN COMPONENT ============
const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [actionMode, setActionMode] = useState<ActionMode>('view');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [packageType, setPackageType] = useState<string>('');

  // Data states
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [weddingShowVideos, setWeddingShowVideos] = useState<VideoItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);

  // New states for Printing
  const [activePrintingSubMenu, setActivePrintingSubMenu] = useState<'all' | 'sablon-kaos' | 'undangan' | 'banner' | 'id-card' | 'kartu-nama' | 'brosur-flyer' | 'stiker-label' | 'kemasan-produk' | 'merchandise'>('all');
  const [printingProducts, setPrintingProducts] = useState<any[]>([]);
  const [printingPackages, setPrintingPackages] = useState<any[]>([]);
  const [printingCategories, setPrintingCategories] = useState<any[]>([]);
  const [printingOrders, setPrintingOrders] = useState<any[]>([]);
  const [printingProductForm, setPrintingProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    size_options: '',
    material_options: '',
    color_options: '',
    finishing_options: '',
    images: '',
    estimated_time: '3-5 hari',
    min_order: 1,
    features: '',
    rating: 4.5,
    reviews_count: 0,
    is_featured: false,
    is_new: false,
    category_id: 1
  });
  const [printingPackageForm, setPrintingPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    included_items: '',
    max_products: 0,
    validity_days: 30,
    is_active: true,
    featured: false
  });
  const [selectedPrintingCategory, setSelectedPrintingCategory] = useState<any>(null);

  // New states for Umrah & Haji (unified - all packages from single endpoint)
  const [religiousPackages, setReligiousPackages] = useState<any[]>([]);
  const [religiousBookings, setReligiousBookings] = useState<any[]>([]);

  // Add missing state variables for Umrah & Haji
  const [umrahPackages, setUmrahPackages] = useState<any[]>([]);
  const [hajiPackages, setHajiPackages] = useState<any[]>([]);

  // Form states for existing menus
  const [galleryForm, setGalleryForm] = useState<CreateGalleryItem>({ title: '', category: '', image: '' });
  const [testimonialForm, setTestimonialForm] = useState<CreateTestimonialItem>({ name: '', rating: 5, text: '', date: '' });
  const [packageForm, setPackageForm] = useState<{
    name: string;
    price: string;
    discount_price: string;
    description: string;
    highlighted: boolean;
    longDescription: string;
    features: string;
    images: string;
    is_active: boolean;
  }>({
    name: '',
    price: '',
    discount_price: '',
    description: '',
    highlighted: false,
    longDescription: '',
    features: '',
    images: '',
    is_active: true
  });
  const [venueForm, setVenueForm] = useState<{ title: string; category: string; price: string; capacity: string; description: string; image: string }>({ title: '', category: '', price: '', capacity: '', description: '', image: '' });
  const [videoForm, setVideoForm] = useState<CreateVideoItem>({ title: '', description: '', videoPath: '', thumbnail: '' });
  const [statsForm, setStatsForm] = useState<{ label: string; value: string; image: string }>({ label: '', value: '', image: '' });

  // Filter states
  const [bookingFilter, setBookingFilter] = useState('all');

  // New form states for Umrah & Haji
  const [umrahPackageForm, setUmrahPackageForm] = useState({
    name: '',
    description: '',
    duration: 9,
    price: '',
    discount_price: '',
    departure_city: 'Jakarta',
    airline: 'Garuda Indonesia',
    airline_logo: '',
    hotel_mekah: '',
    hotel_madinah: '',
    hotel_rating: '4 Star',
    distance_haram: '500m',
    meals_included: true,
    tour_guide: true,
    visa_assistance: true,
    vaccination_assistance: true,
    included_features: '',
    excluded_features: '',
    itinerary: '',
    important_notes: '',
    departure_dates: '',
    images: '',
    featured: false,
    is_active: true,
    package_type: 'umrah',
    transport_type: 'Private Bus',
    group_size: 30,
    availability: 15,
    rating: 4.5,
    reviews_count: 0,
    best_seller: false,
    early_bird_discount: false,
    payment_plans: '',
    tags: '',
    quota_year: '',
    payment_terms: '',
    requirements: '',
    timeline: '',
    registration_deadline: '',
    available_quota: 0,
    training_sessions: 0,
    medical_facility: false,
    accommodation_details: {}
  });

  const [hajiPackageForm, setHajiPackageForm] = useState({
    name: '',
    description: '',
    quota_year: '1445H/2024',
    price: '',
    discount_price: '',
    payment_terms: '',
    included_features: '',
    excluded_features: '',
    requirements: '',
    timeline: '',
    images: '',
    featured: false,
    is_active: true,
    rating: 4.5,
    reviews_count: 0,
    registration_deadline: '',
    available_quota: 25,
    training_sessions: 12,
    medical_facility: true,
    accommodation_mekah_hotel: '',
    accommodation_mekah_nights: 20,
    accommodation_mekah_distance: '500m',
    accommodation_madinah_hotel: '',
    accommodation_madinah_nights: 10,
    accommodation_madinah_distance: '300m',
    accommodation_jeddah_hotel: '',
    accommodation_jeddah_nights: 2
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Wrap each request so one failure doesn't break the rest
        const safeRequest = async (endpoint: string) => {
          try {
            return await apiRequest(endpoint);
          } catch (e) {
            console.warn(`API request failed for ${endpoint}:`, e);
            return { success: false, data: [] };
          }
        };

        const [
          galleryRes,
          testimonialsRes,
          packagesRes,
          venuesRes,
          videosRes,
          weddingShowRes,
          statsRes,
          printingProductsRes,
          printingPackagesRes,
          printingCategoriesRes,
          printingOrdersRes,
          umrahPackagesRes,
          hajiPackagesRes,
          religiousBookingsRes
        ] = await Promise.all([
          safeRequest('/gallery'),
          safeRequest('/testimonials'),
          safeRequest('/packages'),
          safeRequest('/venues'),
          safeRequest('/videos'),
          safeRequest('/wedding-show-videos'),
          safeRequest('/stats'),
          safeRequest('/printing/products'),
          safeRequest('/printing-packages'),
          safeRequest('/printing/categories'),
          safeRequest('/printing/orders'),
          safeRequest('/umrah-packages'),
          safeRequest('/haji-packages'),
          safeRequest('/religious-bookings')
        ]);

        if (galleryRes.success) setGalleryItems(galleryRes.data);
        if (testimonialsRes.success) setTestimonials(testimonialsRes.data);
        if (packagesRes.success) setPackages(packagesRes.data);
        if (venuesRes.success) setVenues(venuesRes.data);
        if (videosRes.success) setVideos(videosRes.data);
        if (weddingShowRes.success) setWeddingShowVideos(weddingShowRes.data);
        if (statsRes.success) setStats(statsRes.data);
        if (printingProductsRes.success) setPrintingProducts(printingProductsRes.data);
        if (printingPackagesRes.success) setPrintingPackages(printingPackagesRes.data);
        if (printingCategoriesRes.success) setPrintingCategories(printingCategoriesRes.data);
        if (printingOrdersRes.success) setPrintingOrders(printingOrdersRes.data);
        if (umrahPackagesRes.success) setUmrahPackages(umrahPackagesRes.data);
        if (hajiPackagesRes.success) setHajiPackages(hajiPackagesRes.data);
        if (religiousBookingsRes.success) setReligiousBookings(religiousBookingsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Set default category_id based on active printing sub-menu
  useEffect(() => {
    const getCategoryId = (subMenu: string) => {
      switch (subMenu) {
        case 'undangan': return 1;
        case 'sablon-kaos': return 2;
        case 'banner': return 3;
        case 'id-card': return 4;
        case 'kartu-nama': return 5;
        case 'brosur-flyer': return 6;
        case 'stiker-label': return 7;
        case 'kemasan-produk': return 8;
        case 'merchandise': return 9;
        default: return null;
      }
    };
    const categoryId = getCategoryId(activePrintingSubMenu);
    if (categoryId !== null) {
      setPrintingProductForm(prev => ({ ...prev, category_id: categoryId }));
    }
  }, [activePrintingSubMenu]);

  const handleSave = async () => {
    if (!selectedItem && actionMode === 'edit') return;

    setIsLoading(true);
    try {
      let response: any;
      let endpoint = '';

      if (actionMode === 'add') {
        switch (activeMenu) {
          case 'gallery':
            endpoint = '/gallery';
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(galleryForm)
            });
            if (response.success) {
              setGalleryItems(prev => [...prev, response.data]);
            }
            break;
          case 'testimonials':
            endpoint = '/testimonials';
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(testimonialForm)
            });
            if (response.success) {
              setTestimonials(prev => [...prev, response.data]);
            }
            break;
          case 'packages':
            endpoint = '/packages';
            const packageData = {
              name: packageForm.name || '',
              price: parseFloat(packageForm.price) || 0,
              discount_price: packageForm.discount_price ? parseFloat(packageForm.discount_price) : null,
              description: packageForm.description || '',
              longDescription: packageForm.longDescription || '',
              highlighted: Boolean(packageForm.highlighted),
              is_active: Boolean(packageForm.is_active),
              features: packageForm.features ? packageForm.features.split(/[\n,]/).map((f: string) => f.trim()).filter(Boolean) : [],
              images: packageForm.images ? packageForm.images.split(/[\n,]/).map((f: string) => f.trim()).filter(Boolean) : []
            };
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(packageData)
            });
            if (response.success) {
              setPackages(prev => [...prev, response.data]);
            }
            break;
          case 'venues':
            endpoint = '/venues';
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(venueForm)
            });
            if (response.success) {
              setVenues(prev => [...prev, response.data]);
            }
            break;
          case 'videos':
            endpoint = '/videos';
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(videoForm)
            });
            if (response.success) {
              setVideos(prev => [...prev, response.data]);
            }
            break;
          case 'stats':
            endpoint = '/stats';
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(statsForm)
            });
            if (response.success) {
              setStats(prev => [...prev, response.data]);
            }
            break;
          case 'printing':
            if (selectedItem?.type === 'package') {
              endpoint = '/printing/packages';
              const packageData = {
                name: printingPackageForm.name || '',
                description: printingPackageForm.description || '',
                price: parseFloat(String(printingPackageForm.price)) || 0,
                discount_price: printingPackageForm.discount_price ? parseFloat(String(printingPackageForm.discount_price)) : null,
                category: printingPackageForm.category || '',
                included_items: Array.isArray(printingPackageForm.included_items)
                  ? printingPackageForm.included_items
                  : String(printingPackageForm.included_items || '').split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean),
                max_products: parseInt(String(printingPackageForm.max_products)) || 0,
                validity_days: parseInt(String(printingPackageForm.validity_days)) || 30,
                is_active: Boolean(printingPackageForm.is_active),
                featured: Boolean(printingPackageForm.featured)
              };
              response = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(packageData)
              });
              if (response.success) {
                setPrintingPackages(prev => [...prev, response.data]);
              }
            } else {
              endpoint = '/printing/products';
              const formData = printingProductForm;
              const productData = {
                category_id: formData.category_id || (printingCategories[0]?.id ?? 1),
                name: formData.name,
                description: formData.description || '',
                price: parseFloat(formData.price) || 0,
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                size_options: formData.size_options || '',
                material_options: formData.material_options || '',
                color_options: formData.color_options || '',
                finishing_options: formData.finishing_options || '',
                design_template_url: '',
                images: formData.images ? parseImages(formData.images).join(', ') : '',
                is_custom_design: false,
                estimated_time: formData.estimated_time || '',
                min_order: formData.min_order || 1,
                featured: formData.is_featured || false,
                is_active: true
              };
              response = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(productData)
              });
              if (response.success) {
                setPrintingProducts(prev => [...prev, response.data]);
              }
            }
            break;
          case 'umrah-haji':
            const pkgType = packageType || selectedItem?.type || 'umrah';
            // Helper function to convert newline/comma-separated string to array
            const stringToArray = (str: any) => {
              if (!str) return [];
              if (Array.isArray(str)) return str;
              return String(str).split(/[\n,]/).map((item: string) => item.trim()).filter(Boolean);
            };

            const parseItineraryLines = (str: any) => {
              if (!str) return [];
              if (Array.isArray(str)) return str;
              return String(str).split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                const match = trimmed.match(/^(?:Hari\s*)?(\d+)?(?:\s*[:\-]\s*)?(.*?)(?:\s*[-–—]\s*(.*))?$/i);
                if (match) {
                  const day = parseInt(match[1]) || (idx + 1);
                  const title = (match[2] || trimmed).trim();
                  const description = (match[3] || '').trim();
                  return { day, title, description };
                }
                return { day: idx + 1, title: trimmed, description: '' };
              }).filter(Boolean);
            };

            if (pkgType === 'umrah') {
              endpoint = '/umrah-packages';
              const umrahData = {
                name: umrahPackageForm.name || '',
                description: umrahPackageForm.description || '',
                package_type: 'umrah',
                price: parseFloat(String(umrahPackageForm.price)) || 0,
                discount_price: umrahPackageForm.discount_price ? parseFloat(String(umrahPackageForm.discount_price)) : null,
                duration: parseInt(String(umrahPackageForm.duration)) || 9,
                departure_city: umrahPackageForm.departure_city || 'Jakarta',
                airline: umrahPackageForm.airline || 'Saudi Airlines',
                airline_logo: umrahPackageForm.airline_logo || '',
                hotel_mekah: umrahPackageForm.hotel_mekah || '',
                hotel_madinah: umrahPackageForm.hotel_madinah || '',
                hotel_rating: parseInt(String(umrahPackageForm.hotel_rating)) || (umrahPackageForm.hotel_rating?.includes('5') ? 5 : (umrahPackageForm.hotel_rating?.includes('3') ? 3 : 4)),
                distance_haram: umrahPackageForm.distance_haram || '±150m ke Pelataran',
                meals_included: Boolean(umrahPackageForm.meals_included),
                tour_guide: Boolean(umrahPackageForm.tour_guide),
                visa_assistance: Boolean(umrahPackageForm.visa_assistance),
                vaccination_assistance: Boolean(umrahPackageForm.vaccination_assistance),
                transport_type: umrahPackageForm.transport_type || 'Bus AC Eksekutif & Kereta Cepat Haramain',
                group_size: parseInt(String(umrahPackageForm.group_size)) || 40,
                availability: parseInt(String(umrahPackageForm.availability)) || 15,
                rating: parseFloat(String(umrahPackageForm.rating)) || 4.9,
                reviews_count: parseInt(String(umrahPackageForm.reviews_count)) || 0,
                featured: Boolean(umrahPackageForm.featured),
                best_seller: Boolean(umrahPackageForm.best_seller),
                early_bird_discount: Boolean(umrahPackageForm.early_bird_discount),
                is_active: Boolean(umrahPackageForm.is_active),
                included_features: stringToArray(umrahPackageForm.included_features),
                excluded_features: stringToArray(umrahPackageForm.excluded_features),
                itinerary: parseItineraryLines(umrahPackageForm.itinerary),
                important_notes: stringToArray(umrahPackageForm.important_notes),
                departure_dates: stringToArray(umrahPackageForm.departure_dates),
                images: stringToArray(umrahPackageForm.images),
                payment_plans: stringToArray(umrahPackageForm.payment_plans),
                tags: stringToArray(umrahPackageForm.tags),
              };
              response = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(umrahData)
              });
              if (response.success) {
                setUmrahPackages(prev => [...prev, response.data]);
              }
            } else if (pkgType === 'haji') {
              endpoint = '/haji-packages';
              const hajiData = {
                name: hajiPackageForm.name || '',
                description: hajiPackageForm.description || '',
                quota_year: hajiPackageForm.quota_year || '1446H / 2025M',
                price: parseFloat(String(hajiPackageForm.price)) || 0,
                discount_price: hajiPackageForm.discount_price ? parseFloat(String(hajiPackageForm.discount_price)) : null,
                featured: Boolean(hajiPackageForm.featured),
                is_active: Boolean(hajiPackageForm.is_active),
                registration_deadline: hajiPackageForm.registration_deadline || '',
                available_quota: parseInt(String(hajiPackageForm.available_quota)) || 25,
                training_sessions: parseInt(String(hajiPackageForm.training_sessions)) || 12,
                medical_facility: Boolean(hajiPackageForm.medical_facility),
                rating: parseFloat(String(hajiPackageForm.rating)) || 4.9,
                reviews_count: parseInt(String(hajiPackageForm.reviews_count)) || 0,
                payment_terms: stringToArray(hajiPackageForm.payment_terms),
                included_features: stringToArray(hajiPackageForm.included_features),
                excluded_features: stringToArray(hajiPackageForm.excluded_features),
                requirements: stringToArray(hajiPackageForm.requirements),
                timeline: stringToArray(hajiPackageForm.timeline),
                images: stringToArray(hajiPackageForm.images),
                accommodation_details: {
                  mekah: {
                    hotel: hajiPackageForm.accommodation_mekah_hotel || '',
                    nights: parseInt(String(hajiPackageForm.accommodation_mekah_nights)) || 20,
                    distance: hajiPackageForm.accommodation_mekah_distance || '±50m ke Masjidil Haram'
                  },
                  madinah: {
                    hotel: hajiPackageForm.accommodation_madinah_hotel || '',
                    nights: parseInt(String(hajiPackageForm.accommodation_madinah_nights)) || 10,
                    distance: hajiPackageForm.accommodation_madinah_distance || '±100m ke Nabawi'
                  },
                  jeddah: {
                    hotel: hajiPackageForm.accommodation_jeddah_hotel || '',
                    nights: parseInt(String(hajiPackageForm.accommodation_jeddah_nights)) || 2
                  }
                }
              };
              response = await apiRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(hajiData)
              });
              if (response.success) {
                setHajiPackages(prev => [...prev, response.data]);
              }
            }
            break;
        }
      } else if (actionMode === 'edit') {
        switch (activeMenu) {
          case 'gallery':
            endpoint = `/gallery/${selectedItem.id}`;
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(galleryForm)
            });
            if (response.success) {
              setGalleryItems(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
          case 'testimonials':
            endpoint = `/testimonials/${selectedItem.id}`;
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(testimonialForm)
            });
            if (response.success) {
              setTestimonials(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
          case 'packages':
            endpoint = `/packages/${selectedItem.id}`;
            const packageEditData = {
              name: packageForm.name || '',
              price: parseFloat(packageForm.price) || 0,
              discount_price: packageForm.discount_price ? parseFloat(packageForm.discount_price) : null,
              description: packageForm.description || '',
              longDescription: packageForm.longDescription || '',
              highlighted: Boolean(packageForm.highlighted),
              is_active: Boolean(packageForm.is_active),
              features: packageForm.features ? packageForm.features.split(/[\n,]/).map((f: string) => f.trim()).filter(Boolean) : [],
              images: packageForm.images ? packageForm.images.split(/[\n,]/).map((f: string) => f.trim()).filter(Boolean) : []
            };
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(packageEditData)
            });
            if (response.success) {
              setPackages(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
          case 'venues':
            endpoint = `/venues/${selectedItem.id}`;
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(venueForm)
            });
            if (response.success) {
              setVenues(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
          case 'videos':
            endpoint = `/videos/${selectedItem.id}`;
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(videoForm)
            });
            if (response.success) {
              setVideos(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
          case 'stats':
            endpoint = `/stats/${selectedItem.id}`;
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(statsForm)
            });
            if (response.success) {
              setStats(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
          case 'printing':
            if (selectedItem?.type === 'package') {
              endpoint = `/printing/packages/${selectedItem.id}`;
              const packageData = {
                name: printingPackageForm.name || '',
                description: printingPackageForm.description || '',
                price: parseFloat(String(printingPackageForm.price)) || 0,
                discount_price: printingPackageForm.discount_price ? parseFloat(String(printingPackageForm.discount_price)) : null,
                category: printingPackageForm.category || '',
                included_items: Array.isArray(printingPackageForm.included_items)
                  ? printingPackageForm.included_items
                  : String(printingPackageForm.included_items || '').split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean),
                max_products: parseInt(String(printingPackageForm.max_products)) || 0,
                validity_days: parseInt(String(printingPackageForm.validity_days)) || 30,
                is_active: Boolean(printingPackageForm.is_active),
                featured: Boolean(printingPackageForm.featured)
              };
              response = await apiRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify(packageData)
              });
              if (response.success) {
                setPrintingPackages(prev => prev.map(item =>
                  item.id === selectedItem.id ? response.data : item
                ));
              }
            } else {
              endpoint = `/printing/products/${selectedItem.id}`;
              const productData = {
                category_id: printingProductForm.category_id || (printingCategories[0]?.id ?? 1),
                name: printingProductForm.name,
                description: printingProductForm.description || '',
                price: parseFloat(String(printingProductForm.price)) || 0,
                discount_price: printingProductForm.discount_price ? parseFloat(String(printingProductForm.discount_price)) : null,
                size_options: printingProductForm.size_options || '',
                material_options: printingProductForm.material_options || '',
                color_options: printingProductForm.color_options || '',
                finishing_options: printingProductForm.finishing_options || '',
                images: printingProductForm.images ? parseImages(printingProductForm.images).join(', ') : '',
                is_custom_design: false,
                estimated_time: printingProductForm.estimated_time || '',
                min_order: printingProductForm.min_order || 1,
                featured: printingProductForm.is_featured || false,
                is_active: true
              };
              response = await apiRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify(productData)
              });
              if (response.success) {
                setPrintingProducts(prev => prev.map(item =>
                  item.id === selectedItem.id ? response.data : item
                ));
              }
            }
            break;
          case 'umrah-haji':
            const stringToArrayEdit = (str: any) => {
              if (!str) return [];
              if (Array.isArray(str)) return str;
              return String(str).split(/[\n,]/).map((item: string) => item.trim()).filter(Boolean);
            };

            const parseItineraryLinesEdit = (str: any) => {
              if (!str) return [];
              if (Array.isArray(str)) return str;
              return String(str).split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                const match = trimmed.match(/^(?:Hari\s*)?(\d+)?(?:\s*[:\-]\s*)?(.*?)(?:\s*[-–—]\s*(.*))?$/i);
                if (match) {
                  const day = parseInt(match[1]) || (idx + 1);
                  const title = (match[2] || trimmed).trim();
                  const description = (match[3] || '').trim();
                  return { day, title, description };
                }
                return { day: idx + 1, title: trimmed, description: '' };
              }).filter(Boolean);
            };

            if (selectedItem?.type === 'umrah') {
              endpoint = `/umrah-packages/${selectedItem.id}`;
              const umrahEditData = {
                name: umrahPackageForm.name || '',
                description: umrahPackageForm.description || '',
                package_type: 'umrah',
                price: parseFloat(String(umrahPackageForm.price)) || 0,
                discount_price: umrahPackageForm.discount_price ? parseFloat(String(umrahPackageForm.discount_price)) : null,
                duration: parseInt(String(umrahPackageForm.duration)) || 9,
                departure_city: umrahPackageForm.departure_city || 'Jakarta',
                airline: umrahPackageForm.airline || 'Saudi Airlines',
                airline_logo: umrahPackageForm.airline_logo || '',
                hotel_mekah: umrahPackageForm.hotel_mekah || '',
                hotel_madinah: umrahPackageForm.hotel_madinah || '',
                hotel_rating: parseInt(String(umrahPackageForm.hotel_rating)) || (umrahPackageForm.hotel_rating?.includes('5') ? 5 : (umrahPackageForm.hotel_rating?.includes('3') ? 3 : 4)),
                distance_haram: umrahPackageForm.distance_haram || '±150m ke Pelataran',
                meals_included: Boolean(umrahPackageForm.meals_included),
                tour_guide: Boolean(umrahPackageForm.tour_guide),
                visa_assistance: Boolean(umrahPackageForm.visa_assistance),
                vaccination_assistance: Boolean(umrahPackageForm.vaccination_assistance),
                transport_type: umrahPackageForm.transport_type || 'Bus AC Eksekutif & Kereta Cepat Haramain',
                group_size: parseInt(String(umrahPackageForm.group_size)) || 40,
                availability: parseInt(String(umrahPackageForm.availability)) || 15,
                rating: parseFloat(String(umrahPackageForm.rating)) || 4.9,
                reviews_count: parseInt(String(umrahPackageForm.reviews_count)) || 0,
                featured: Boolean(umrahPackageForm.featured),
                best_seller: Boolean(umrahPackageForm.best_seller),
                early_bird_discount: Boolean(umrahPackageForm.early_bird_discount),
                is_active: Boolean(umrahPackageForm.is_active),
                included_features: stringToArrayEdit(umrahPackageForm.included_features),
                excluded_features: stringToArrayEdit(umrahPackageForm.excluded_features),
                itinerary: parseItineraryLinesEdit(umrahPackageForm.itinerary),
                important_notes: stringToArrayEdit(umrahPackageForm.important_notes),
                departure_dates: stringToArrayEdit(umrahPackageForm.departure_dates),
                images: stringToArrayEdit(umrahPackageForm.images),
                payment_plans: stringToArrayEdit(umrahPackageForm.payment_plans),
                tags: stringToArrayEdit(umrahPackageForm.tags),
              };
              response = await apiRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify(umrahEditData)
              });
              if (response.success) {
                setUmrahPackages(prev => prev.map(item =>
                  item.id === selectedItem.id ? response.data : item
                ));
              }
            } else if (selectedItem?.type === 'haji') {
              endpoint = `/haji-packages/${selectedItem.id}`;
              const hajiEditData = {
                name: hajiPackageForm.name || '',
                description: hajiPackageForm.description || '',
                quota_year: hajiPackageForm.quota_year || '1446H / 2025M',
                price: parseFloat(String(hajiPackageForm.price)) || 0,
                discount_price: hajiPackageForm.discount_price ? parseFloat(String(hajiPackageForm.discount_price)) : null,
                featured: Boolean(hajiPackageForm.featured),
                is_active: Boolean(hajiPackageForm.is_active),
                registration_deadline: hajiPackageForm.registration_deadline || '',
                available_quota: parseInt(String(hajiPackageForm.available_quota)) || 25,
                training_sessions: parseInt(String(hajiPackageForm.training_sessions)) || 12,
                medical_facility: Boolean(hajiPackageForm.medical_facility),
                rating: parseFloat(String(hajiPackageForm.rating)) || 4.9,
                reviews_count: parseInt(String(hajiPackageForm.reviews_count)) || 0,
                payment_terms: stringToArrayEdit(hajiPackageForm.payment_terms),
                included_features: stringToArrayEdit(hajiPackageForm.included_features),
                excluded_features: stringToArrayEdit(hajiPackageForm.excluded_features),
                requirements: stringToArrayEdit(hajiPackageForm.requirements),
                timeline: stringToArrayEdit(hajiPackageForm.timeline),
                images: stringToArrayEdit(hajiPackageForm.images),
                accommodation_details: {
                  mekah: {
                    hotel: hajiPackageForm.accommodation_mekah_hotel || '',
                    nights: parseInt(String(hajiPackageForm.accommodation_mekah_nights)) || 20,
                    distance: hajiPackageForm.accommodation_mekah_distance || '±50m ke Masjidil Haram'
                  },
                  madinah: {
                    hotel: hajiPackageForm.accommodation_madinah_hotel || '',
                    nights: parseInt(String(hajiPackageForm.accommodation_madinah_nights)) || 10,
                    distance: hajiPackageForm.accommodation_madinah_distance || '±100m ke Nabawi'
                  },
                  jeddah: {
                    hotel: hajiPackageForm.accommodation_jeddah_hotel || '',
                    nights: parseInt(String(hajiPackageForm.accommodation_jeddah_nights)) || 2
                  }
                }
              };
              response = await apiRequest(endpoint, {
                method: 'PUT',
                body: JSON.stringify(hajiEditData)
              });
              if (response.success) {
                setHajiPackages(prev => prev.map(item =>
                  item.id === selectedItem.id ? response.data : item
                ));
              }
            }
            break;
        }
      }

      if (response?.success) {
        alert('Data berhasil disimpan!');
        setActionMode('view');
        resetForms();
      } else {
        console.error('API Response Error:', response);
        const errorMsg = response?.error || response?.message || 'Terjadi kesalahan yang tidak diketahui';
        alert('Gagal menyimpan data: ' + errorMsg);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any, type: MenuItem, itemType?: string) => {
    setSelectedItem({ ...item, type: itemType });
    setActionMode('edit');

    switch (type) {
      case 'gallery':
        setGalleryForm({
          title: item.title || '',
          category: item.category || '',
          image: item.image || ''
        });
        break;
      case 'testimonials':
        setTestimonialForm({
          name: item.name || '',
          rating: Number(item.rating) || 5,
          text: item.text || '',
          date: item.date || ''
        });
        break;
      case 'packages':
        setPackageForm({
          name: item.name || '',
          price: String(item.price || ''),
          discount_price: item.discount_price ? String(item.discount_price) : '',
          description: item.description || '',
          longDescription: item.longDescription || '',
          features: Array.isArray(item.features) ? item.features.join('\n') : (item.features || ''),
          images: parseImages(item.images).join(', '),
          highlighted: Boolean(item.highlighted),
          is_active: item.is_active !== undefined ? Boolean(item.is_active) : true
        });
        break;
      case 'venues':
        setVenueForm({
          title: item.title || '',
          category: item.category || '',
          price: String(item.price || ''),
          capacity: item.capacity ? String(item.capacity) : '',
          description: item.description || '',
          image: item.image || ''
        });
        break;
      case 'videos':
        setVideoForm(item);
        break;
      case 'stats':
        setStatsForm({ ...item, image: item.image || '' });
        break;
      case 'printing':
        if (itemType === 'product') {
          setPrintingProductForm({
            ...item,
            min_order: parseInt(item.min_order) || 1,
            size_options: Array.isArray(item.size_options) ? item.size_options.join(', ') : (item.size_options || ''),
            material_options: Array.isArray(item.material_options) ? item.material_options.join(', ') : (item.material_options || ''),
            color_options: Array.isArray(item.color_options) ? item.color_options.join(', ') : (item.color_options || ''),
            finishing_options: Array.isArray(item.finishing_options) ? item.finishing_options.join(', ') : (item.finishing_options || ''),
            features: Array.isArray(item.features) ? item.features.join(', ') : (item.features || ''),
            images: parseImages(item.images).join(', ')
          });
        } else if (itemType === 'package') {
          setPrintingPackageForm({
            name: item.name || '',
            description: item.description || '',
            price: String(item.price || ''),
            discount_price: item.discount_price ? String(item.discount_price) : '',
            category: item.category || '',
            included_items: Array.isArray(item.included_items) ? item.included_items.join('\n') : (item.included_items || ''),
            max_products: item.max_products || 0,
            validity_days: item.validity_days || 30,
            is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
            featured: Boolean(item.featured)
          });
        }
        break;
      case 'umrah-haji':
        if (itemType === 'umrah') {
          const itineraryStr = Array.isArray(item.itinerary)
            ? item.itinerary.map((it: any) => typeof it === 'object' ? `Hari ${it.day || ''}: ${it.title || ''}${it.description || it.desc ? ` - ${it.description || it.desc}` : ''}` : String(it)).join('\n')
            : (item.itinerary || '');

          setUmrahPackageForm({
            name: item.name || '',
            description: item.description || '',
            duration: item.duration || 9,
            price: String(item.price || ''),
            discount_price: item.discount_price ? String(item.discount_price) : '',
            departure_city: item.departure_city || 'Jakarta',
            airline: item.airline || 'Saudi Airlines',
            airline_logo: item.airline_logo || '',
            hotel_mekah: item.hotel_mekah || '',
            hotel_madinah: item.hotel_madinah || '',
            hotel_rating: item.hotel_rating ? (typeof item.hotel_rating === 'number' ? `${item.hotel_rating} Star` : String(item.hotel_rating)) : '4 Star',
            distance_haram: item.distance_haram || '150m ke Pelataran',
            meals_included: item.meals_included !== undefined ? Boolean(item.meals_included) : true,
            tour_guide: item.tour_guide !== undefined ? Boolean(item.tour_guide) : true,
            visa_assistance: item.visa_assistance !== undefined ? Boolean(item.visa_assistance) : true,
            vaccination_assistance: item.vaccination_assistance !== undefined ? Boolean(item.vaccination_assistance) : true,
            included_features: Array.isArray(item.included_features) ? item.included_features.join('\n') : (item.included_features || ''),
            excluded_features: Array.isArray(item.excluded_features) ? item.excluded_features.join('\n') : (item.excluded_features || ''),
            itinerary: itineraryStr,
            important_notes: Array.isArray(item.important_notes) ? item.important_notes.join('\n') : (item.important_notes || ''),
            departure_dates: Array.isArray(item.departure_dates) 
              ? item.departure_dates.map((d: any) => typeof d === 'object' ? (d.date || JSON.stringify(d)) : String(d)).join(', ') 
              : (item.departure_dates || ''),
            images: parseImages(item.images).join(', '),
            featured: Boolean(item.featured),
            is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
            package_type: 'umrah',
            transport_type: item.transport_type || 'Bus AC Eksekutif & Kereta Cepat Haramain',
            group_size: item.group_size || 40,
            availability: item.availability || 15,
            rating: item.rating || 4.9,
            reviews_count: item.reviews_count || 0,
            best_seller: Boolean(item.best_seller),
            early_bird_discount: Boolean(item.early_bird_discount),
            payment_plans: Array.isArray(item.payment_plans)
              ? item.payment_plans.map((p: any) => typeof p === 'object' ? (p.name || JSON.stringify(p)) : String(p)).join('\n')
              : (item.payment_plans || ''),
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
            quota_year: item.quota_year || '',
            payment_terms: Array.isArray(item.payment_terms) ? item.payment_terms.join('\n') : (item.payment_terms || ''),
            requirements: Array.isArray(item.requirements) ? item.requirements.join('\n') : (item.requirements || ''),
            timeline: Array.isArray(item.timeline) ? item.timeline.join('\n') : (item.timeline || ''),
            registration_deadline: item.registration_deadline || '',
            available_quota: item.available_quota || 0,
            training_sessions: item.training_sessions || 0,
            medical_facility: Boolean(item.medical_facility),
            accommodation_details: item.accommodation_details || {}
          });
        } else if (itemType === 'haji') {
          const acc = item.accommodation_details || {};
          setHajiPackageForm({
            name: item.name || '',
            description: item.description || '',
            quota_year: item.quota_year || '1446H / 2025M',
            price: String(item.price || ''),
            discount_price: item.discount_price ? String(item.discount_price) : '',
            payment_terms: Array.isArray(item.payment_terms) ? item.payment_terms.join('\n') : (item.payment_terms || ''),
            included_features: Array.isArray(item.included_features) ? item.included_features.join('\n') : (item.included_features || ''),
            excluded_features: Array.isArray(item.excluded_features) ? item.excluded_features.join('\n') : (item.excluded_features || ''),
            requirements: Array.isArray(item.requirements) ? item.requirements.join('\n') : (item.requirements || ''),
            timeline: Array.isArray(item.timeline) 
              ? item.timeline.map((t: any) => typeof t === 'object' ? `${t.month || ''}: ${Array.isArray(t.activities) ? t.activities.join(', ') : ''}` : String(t)).join('\n')
              : (item.timeline || ''),
            images: parseImages(item.images).join(', '),
            featured: Boolean(item.featured),
            is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
            rating: item.rating || 4.9,
            reviews_count: item.reviews_count || 0,
            registration_deadline: item.registration_deadline || '',
            available_quota: item.available_quota || 25,
            training_sessions: item.training_sessions || 12,
            medical_facility: item.medical_facility !== undefined ? Boolean(item.medical_facility) : true,
            accommodation_mekah_hotel: acc.mekah?.hotel || '',
            accommodation_mekah_nights: acc.mekah?.nights || 20,
            accommodation_mekah_distance: acc.mekah?.distance || '±50m ke Masjidil Haram',
            accommodation_madinah_hotel: acc.madinah?.hotel || '',
            accommodation_madinah_nights: acc.madinah?.nights || 10,
            accommodation_madinah_distance: acc.madinah?.distance || '±100m ke Nabawi',
            accommodation_jeddah_hotel: acc.jeddah?.hotel || '',
            accommodation_jeddah_nights: acc.jeddah?.nights || 2,
          });
        }
        break;
    }
  };

  const handleDelete = async (id: number, type: MenuItem, itemType?: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;

    setIsLoading(true);
    try {
      let endpoint = '';
      switch (type) {
        case 'gallery':
          endpoint = `/gallery/${id}`;
          break;
        case 'testimonials':
          endpoint = `/testimonials/${id}`;
          break;
        case 'packages':
          endpoint = `/packages/${id}`;
          break;
        case 'venues':
          endpoint = `/venues/${id}`;
          break;
        case 'videos':
          endpoint = `/videos/${id}`;
          break;
        case 'wedding-show':
          endpoint = `/wedding-show-videos/${id}`;
          break;
        case 'stats':
          endpoint = `/stats/${id}`;
          break;
        case 'printing':
          endpoint = `/printing/products/${id}`;
          break;
        case 'umrah-haji':
          if (itemType === 'umrah') {
            endpoint = `/umrah-packages/${id}`;
          } else if (itemType === 'haji') {
            endpoint = `/haji-packages/${id}`;
          }
          break;
      }

      const response = await apiRequest(endpoint, {
        method: 'DELETE'
      });

      if (response.success) {
        switch (type) {
          case 'gallery':
            setGalleryItems(prev => prev.filter(item => item.id !== id));
            break;
          case 'testimonials':
            setTestimonials(prev => prev.filter(item => item.id !== id));
            break;
          case 'packages':
            setPackages(prev => prev.filter(item => item.id !== id));
            break;
          case 'venues':
            setVenues(prev => prev.filter(item => item.id !== id));
            break;
          case 'videos':
            setVideos(prev => prev.filter(item => item.id !== id));
            break;
          case 'wedding-show':
            setWeddingShowVideos(prev => prev.filter(item => item.id !== id));
            break;
          case 'stats':
            setStats(prev => prev.filter(item => item.id !== id));
            break;
          case 'printing':
            setPrintingProducts(prev => prev.filter(item => item.id !== id));
            break;
          case 'umrah-haji':
            if (itemType === 'umrah') {
              setUmrahPackages(prev => prev.filter(item => item.id !== id));
            } else if (itemType === 'haji') {
              setHajiPackages(prev => prev.filter(item => item.id !== id));
            }
            break;
        }
        alert('Item berhasil dihapus!');
      } else {
        alert('Gagal menghapus item: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan saat menghapus item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id: number, status: string, type: 'printing' | 'umrah-haji') => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (type === 'printing') {
        endpoint = `/printing/orders/${id}`;
      } else {
        endpoint = `/religious-bookings/${id}`;
      }

      const response = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });

      if (response.success) {
        if (type === 'printing') {
          setPrintingOrders(prev => prev.map(order =>
            order.id === id ? { ...order, status } : order
          ));
        } else {
          setReligiousBookings(prev => prev.map(booking =>
            booking.id === id ? { ...booking, status } : booking
          ));
        }
        alert('Status berhasil diperbarui!');
      } else {
        alert('Gagal memperbarui status: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Terjadi kesalahan saat memperbarui status');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setGalleryForm({ title: '', category: '', image: '' });
    setTestimonialForm({ name: '', rating: 5, text: '', date: '' });
    setPackageForm({
      name: '',
      price: '',
      discount_price: '',
      description: '',
      highlighted: false,
      longDescription: '',
      features: '',
      images: '',
      is_active: true
    });
    setVenueForm({ title: '', category: '', price: '', capacity: '', description: '', image: '' });
    setVideoForm({ title: '', description: '', videoPath: '', thumbnail: '' });
    setStatsForm({ label: '', value: '', image: '' });
    setPrintingProductForm({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      size_options: '',
      material_options: '',
      color_options: '',
      finishing_options: '',
      images: '',
      estimated_time: '3-5 hari',
      min_order: 1,
      features: '',
      rating: 4.5,
      reviews_count: 0,
      is_featured: false,
      is_new: false,
      category_id: 1
    });
    setUmrahPackageForm({
      name: '',
      description: '',
      duration: 9,
      price: '',
      discount_price: '',
      departure_city: 'Jakarta',
      airline: 'Garuda Indonesia',
      airline_logo: '',
      hotel_mekah: '',
      hotel_madinah: '',
      hotel_rating: '4 Star',
      distance_haram: '500m',
      meals_included: true,
      tour_guide: true,
      visa_assistance: true,
      vaccination_assistance: true,
      included_features: '',
      excluded_features: '',
      itinerary: '',
      important_notes: '',
      departure_dates: '',
      images: '',
      featured: false,
      is_active: true,
      package_type: 'umrah',
      transport_type: 'Private Bus',
      group_size: 30,
      availability: 15,
      rating: 4.5,
      reviews_count: 0,
      best_seller: false,
      early_bird_discount: false,
      payment_plans: '',
      tags: '',
      quota_year: '',
      payment_terms: '',
      requirements: '',
      timeline: '',
      registration_deadline: '',
      available_quota: 0,
      training_sessions: 0,
      medical_facility: false,
      accommodation_details: {}
    });
    setHajiPackageForm({
      name: '',
      description: '',
      quota_year: '1445H/2024',
      price: '',
      discount_price: '',
      payment_terms: '',
      included_features: '',
      excluded_features: '',
      requirements: '',
      timeline: '',
      images: '',
      featured: false,
      is_active: true,
      rating: 4.5,
      reviews_count: 0,
      registration_deadline: '',
      available_quota: 25,
      training_sessions: 12,
      medical_facility: true,
      accommodation_mekah_hotel: '',
      accommodation_mekah_nights: 20,
      accommodation_mekah_distance: '500m',
      accommodation_madinah_hotel: '',
      accommodation_madinah_nights: 10,
      accommodation_madinah_distance: '300m',
      accommodation_jeddah_hotel: '',
      accommodation_jeddah_nights: 2
    });
    setSelectedItem(null);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={20} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare size={20} /> },
    { id: 'packages', label: 'Wedding Packages', icon: <Package size={20} /> },
    { id: 'venues', label: 'Venues', icon: <MapPin size={20} /> },
    { id: 'videos', label: 'Videos', icon: <Video size={20} /> },
    { id: 'wedding-show', label: 'Wedding Show', icon: <Video size={20} /> },
    { id: 'printing', label: 'Percetakan', icon: <Printer size={20} /> },
    { id: 'umrah-haji', label: 'Umrah & Haji', icon: <Globe size={20} /> },
    { id: 'appearance', label: 'Tampilan', icon: <Monitor size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    if (actionMode === 'add' || actionMode === 'edit') {
      return renderForm();
    }

    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardContent
            weddingPackages={packages}
            printingProducts={printingProducts}
            printingPackages={printingPackages}
            umrahPackages={umrahPackages.filter((p: any) => !p.package_type || p.package_type === 'umrah')}
            hajiPackages={[...hajiPackages, ...umrahPackages.filter((p: any) => p.package_type === 'haji')]}
            stats={{
              gallery: galleryItems.length,
              testimonials: testimonials.length,
              packages: packages.length,
              venues: venues.length,
              printing: printingProducts.length,
              umrah: umrahPackages.filter((p: any) => !p.package_type || p.package_type === 'umrah').length,
              haji: [...hajiPackages, ...umrahPackages.filter((p: any) => p.package_type === 'haji')].length,
            }}
            onNavigate={(menu: MenuItem) => {
              setActiveMenu(menu);
              setActionMode('view');
              resetForms();
            }}
            onEditWedding={(item: any) => {
              setActiveMenu('packages');
              handleEdit(item, 'packages');
            }}
            onAddWedding={() => {
              setActiveMenu('packages');
              setSelectedItem(null);
              setActionMode('add');
            }}
            onEditPrinting={(item: any) => {
              setActiveMenu('printing');
              handleEdit(item, 'printing', 'product');
            }}
            onAddPrinting={() => {
              setActiveMenu('printing');
              setSelectedItem({ type: 'product' });
              setActionMode('add');
            }}
            onEditUmrah={(item: any) => {
              setActiveMenu('umrah-haji');
              handleEdit(item, 'umrah-haji', 'umrah');
            }}
            onAddUmrah={() => {
              setActiveMenu('umrah-haji');
              setPackageType('umrah');
              setSelectedItem({ type: 'umrah' });
              setActionMode('add');
            }}
            onEditHaji={(item: any) => {
              setActiveMenu('umrah-haji');
              handleEdit(item, 'umrah-haji', 'haji');
            }}
            onAddHaji={() => {
              setActiveMenu('umrah-haji');
              setPackageType('haji');
              setSelectedItem({ type: 'haji' });
              setActionMode('add');
            }}
          />
        );
      case 'gallery':
        return <GalleryContent
          items={galleryItems}
          onEdit={(item) => handleEdit(item, 'gallery')}
          onDelete={(id) => handleDelete(id, 'gallery')}
        />;
      case 'testimonials':
        return <TestimonialsContent
          items={testimonials}
          onEdit={(item) => handleEdit(item, 'testimonials')}
          onDelete={(id) => handleDelete(id, 'testimonials')}
        />;
      case 'packages':
        return <PackagesContent
          items={packages}
          onEdit={(item) => handleEdit(item, 'packages')}
          onDelete={(id) => handleDelete(id, 'packages')}
        />;
      case 'venues':
        return <VenuesContent
          items={venues}
          onEdit={(item) => handleEdit(item, 'venues')}
          onDelete={(id) => handleDelete(id, 'venues')}
        />;
      case 'videos':
        return <VideosContent
          items={videos}
          onEdit={(item) => handleEdit(item, 'videos')}
          onDelete={(id) => handleDelete(id, 'videos')}
        />;
      case 'wedding-show':
        return <WeddingShowContent
          items={weddingShowVideos}
          onEdit={(item) => handleEdit(item, 'wedding-show')}
          onDelete={(id) => handleDelete(id, 'wedding-show')}
          onUpdate={(id, updates) => {
            setWeddingShowVideos(prev => prev.map(item =>
              item.id === id ? { ...item, ...updates } : item
            ));
          }}
        />;
      case 'printing':
        return <PrintingAdminContent
          activeSubMenu={activePrintingSubMenu}
          products={printingProducts}
          categories={printingCategories}
          packages={printingPackages}
          onEditProduct={(item) => handleEdit(item, 'printing', 'product')}
          onDeleteProduct={(id) => handleDelete(id, 'printing', 'product')}
          onAddProduct={() => {
            setSelectedItem({ type: 'product' });
            setActionMode('add');
          }}
          onEditPackage={(item) => handleEdit(item, 'printing', 'package')}
          onDeletePackage={(id) => handleDelete(id, 'printing', 'package')}
          onAddPackage={() => {
            setSelectedItem({ type: 'package' });
            setActionMode('add');
          }}
          onSubMenuChange={setActivePrintingSubMenu}
        />;
      case 'umrah-haji':
        return <UmrahHajiAdminContent
          umrahPackages={umrahPackages.filter((p: any) => !p.package_type || p.package_type === 'umrah')}
          hajiPackages={[...hajiPackages, ...umrahPackages.filter((p: any) => p.package_type === 'haji')]}
          bookings={religiousBookings}
          filter={bookingFilter}
          onFilterChange={setBookingFilter}
          onEditUmrah={(item) => handleEdit(item, 'umrah-haji', 'umrah')}
          onEditHaji={(item) => handleEdit(item, 'umrah-haji', 'haji')}
          onDeleteUmrah={(id) => handleDelete(id, 'umrah-haji', 'umrah')}
          onDeleteHaji={(id) => handleDelete(id, 'umrah-haji', 'haji')}
          onUpdateBookingStatus={(id, status) => handleUpdateOrderStatus(id, status, 'umrah-haji')}
          onAddUmrah={() => {
            setPackageType('umrah');
            setSelectedItem({ type: 'umrah' });
            setActionMode('add');
          }}
          onAddHaji={() => {
            setPackageType('haji');
            setSelectedItem({ type: 'haji' });
            setActionMode('add');
          }}
        />;
      case 'settings':
        return <SettingsContent />;
      case 'appearance':
        return <AppearanceSettings />;
      default:
        return <DashboardContent />;
    }
  };

  const renderForm = () => {
    const formTitle = `${actionMode === 'add' ? 'Tambah' : 'Edit'} ${getMenuLabel(activeMenu)}`;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">{formTitle}</h3>
          <button
            onClick={() => {
              setActionMode('view');
              resetForms();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {activeMenu === 'gallery' && (
            <>
              <input
                type="text"
                placeholder="Judul Gambar"
                className="w-full p-3 border rounded-lg"
                value={galleryForm.title}
                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Dekorasi">Dekorasi</option>
                  <option value="Tratag/Tarub">Tratag/Tarub</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Percetakan">Percetakan</option>
                  <option value="Umrah">Umrah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700">Gambar Galeri *</label>
                
                {/* File Upload Option */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Unggah dari Komputer/HP</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full p-2.5 border rounded-lg bg-white text-sm"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const uploadResponse = await uploadFile(file);
                          if (uploadResponse.success) {
                            setGalleryForm(prev => ({ ...prev, image: uploadResponse.data.path }));
                          } else {
                            alert('Gagal upload: ' + (uploadResponse.error || 'Server error'));
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('Terjadi kesalahan saat upload gambar');
                        }
                      }
                    }}
                  />
                </div>

                {/* Direct URL input option */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Atau Masukkan URL Gambar Langsung</label>
                  <input
                    type="text"
                    placeholder="https://... atau /uploads/..."
                    className="w-full p-2.5 border rounded-lg bg-white text-sm font-mono"
                    value={galleryForm.image}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>

                {galleryForm.image && (
                  <div className="mt-2 relative w-fit">
                    <img src={galleryForm.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border shadow-sm" />
                    <button
                      type="button"
                      onClick={() => setGalleryForm(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600"
                    >×</button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeMenu === 'testimonials' && (
            <>
              <input
                type="text"
                placeholder="Nama Klien"
                className="w-full p-3 border rounded-lg"
                value={testimonialForm.name}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
              />
              <textarea
                placeholder="Testimoni"
                className="w-full p-3 border rounded-lg"
                rows={4}
                value={testimonialForm.text}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
              />
              <input
                type="number"
                placeholder="Rating (1-5)"
                min="1"
                max="5"
                className="w-full p-3 border rounded-lg"
                value={testimonialForm.rating}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) || 5 })}
              />
              <input
                type="date"
                className="w-full p-3 border rounded-lg"
                value={testimonialForm.date}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, date: e.target.value })}
              />
            </>
          )}

          {activeMenu === 'packages' && (
            <div className="space-y-6">
              {/* SECTION 1: INFORMASI UTAMA & HARGA */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm border-b pb-2">
                  <Heart size={18} className="text-rose-500 fill-rose-500" />
                  <span>1. Informasi Utama & Investasi Pernikahan</span>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Paket Pernikahan *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Paket Silver Modern Minimalist"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Singkat / Subtitle</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pilihan tepat untuk resepsi intim dan sakral..."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ringkasan & Detail Konsep (Tab Overview)</label>
                  <textarea
                    placeholder="Jelaskan secara mendalam tentang konsep pernikahan ini..."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    rows={4}
                    value={packageForm.longDescription}
                    onChange={(e) => setPackageForm({ ...packageForm, longDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Investasi (Rp) *</label>
                    <input
                      type="number"
                      placeholder="35000000"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-bold"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-700 mb-1">Harga Diskon / Coret (Rp)</label>
                    <input
                      type="number"
                      placeholder="Masukkan jika ada harga promo"
                      className="w-full p-2.5 border border-rose-200 rounded-lg text-sm bg-white font-bold text-rose-700"
                      value={packageForm.discount_price}
                      onChange={(e) => setPackageForm({ ...packageForm, discount_price: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: FITUR KEUNGGULAN */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b pb-2">
                  <Sparkles size={18} />
                  <span>2. Fitur Keunggulan Paket (1 per baris)</span>
                </div>
                <textarea
                  placeholder={"Dekorasi Pelaminan Modern Floral 6-8 Meter\nRias & Gaun Pengantin Akad + Resepsi (MUA Eksklusif)\nKatering 300 Porsi Menu Utama + 2 Gubukan\nDokumentasi Foto Full Day + Video Teaser\nTim WO Lapangan 4 Kru + MC Profesional"}
                  className="w-full p-3 border rounded-lg text-xs font-mono bg-white leading-relaxed"
                  rows={5}
                  value={packageForm.features}
                  onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
                />
              </div>

              {/* SECTION 3: GALERI FOTO KUSTOM */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <FileImage size={18} />
                    <span>3. Galeri Foto Paket (Opsional)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Mendukung multi-upload & URL</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded-lg text-xs bg-white"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const uploadResponse = await uploadFile(file);
                        if (uploadResponse.success) {
                          const newPath = uploadResponse.data.path;
                          const existing = packageForm.images ? packageForm.images.trim() : '';
                          const updated = existing ? `${existing}, ${newPath}` : newPath;
                          setPackageForm({ ...packageForm, images: updated });
                        } else {
                          alert('Gagal upload gambar');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('Terjadi kesalahan saat upload gambar');
                      }
                    }
                  }}
                />

                <input
                  type="text"
                  placeholder="Atau masukkan URL gambar (pisahkan dengan koma)"
                  className="w-full p-2.5 border rounded-lg text-xs bg-white"
                  value={packageForm.images}
                  onChange={(e) => setPackageForm({ ...packageForm, images: e.target.value })}
                />

                {Boolean(packageForm.images) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(Array.isArray(packageForm.images)
                      ? packageForm.images
                      : (typeof packageForm.images === 'string' ? packageForm.images.split(',') : [])
                    ).map((img: string, idx: number) => typeof img === 'string' && img.trim() && (
                      <div key={idx} className="relative">
                        <img src={img.trim()} alt={`Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded-xl border shadow-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            const arr = Array.isArray(packageForm.images)
                              ? packageForm.images
                              : (typeof packageForm.images === 'string' ? packageForm.images.split(',') : []);
                            const imgs = arr.map((s: string) => s.trim()).filter((_: any, i: number) => i !== idx);
                            setPackageForm({ ...packageForm, images: imgs.join(', ') });
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: LABEL & STATUS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-2">
                  <CheckCircle size={18} />
                  <span>4. Labeling & Status</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={packageForm.highlighted}
                      onChange={(e) => setPackageForm({ ...packageForm, highlighted: e.target.checked })}
                    />
                    <span className="font-semibold text-slate-700">★ Tampilkan sebagai Pilihan Utama</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={packageForm.is_active}
                      onChange={(e) => setPackageForm({ ...packageForm, is_active: e.target.checked })}
                    />
                    <span className="font-bold text-emerald-900">Status Aktif di Halaman Web</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'videos' && (
            <>
              <input
                type="text"
                placeholder="Judul Video"
                className="w-full p-3 border rounded-lg"
                value={videoForm.title}
                onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
              />
              <textarea
                placeholder="Deskripsi Video"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={videoForm.description}
                onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  className="w-full p-3 border rounded-lg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const uploadResponse = await uploadVideoFile(file);
                        if (uploadResponse.success) {
                          setVideoForm({ ...videoForm, videoPath: uploadResponse.data.path });
                        } else {
                          alert('Gagal upload video');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('Terjadi kesalahan saat upload video');
                      }
                    }
                  }}
                />
                {videoForm.videoPath && (
                  <div className="mt-2">
                    <video src={videoForm.videoPath} controls className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Thumbnail (opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-3 border rounded-lg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const uploadResponse = await uploadFile(file);
                        if (uploadResponse.success) {
                          setVideoForm({ ...videoForm, thumbnail: uploadResponse.data.path });
                        } else {
                          alert('Gagal upload thumbnail');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('Terjadi kesalahan saat upload thumbnail');
                      }
                    }
                  }}
                />
                {videoForm.thumbnail && (
                  <div className="mt-2">
                    <img src={videoForm.thumbnail} alt="Thumbnail Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
            </>
          )}

          {activeMenu === 'venues' && (
            <>
              <input
                type="text"
                placeholder="Nama Venue"
                className="w-full p-3 border rounded-lg"
                value={venueForm.title}
                onChange={(e) => setVenueForm({ ...venueForm, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Kategori"
                className="w-full p-3 border rounded-lg"
                value={venueForm.category}
                onChange={(e) => setVenueForm({ ...venueForm, category: e.target.value })}
              />
              <input
                type="text"
                placeholder="Harga"
                className="w-full p-3 border rounded-lg"
                value={venueForm.price}
                onChange={(e) => setVenueForm({ ...venueForm, price: e.target.value })}
              />
              <input
                type="number"
                placeholder="Kapasitas"
                className="w-full p-3 border rounded-lg"
                value={venueForm.capacity}
                onChange={(e) => setVenueForm({ ...venueForm, capacity: e.target.value })}
              />
              <textarea
                placeholder="Deskripsi"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={venueForm.description}
                onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
              />
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700">Gambar Venue (Opsional)</label>
                
                {/* File Upload Option */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Unggah dari Komputer/HP</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full p-2.5 border rounded-lg bg-white text-sm"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const uploadResponse = await uploadFile(file);
                          if (uploadResponse.success) {
                            setVenueForm(prev => ({ ...prev, image: uploadResponse.data.path }));
                          } else {
                            alert('Gagal upload: ' + (uploadResponse.error || 'Server error'));
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('Terjadi kesalahan saat upload gambar');
                        }
                      }
                    }}
                  />
                </div>

                {/* Direct URL input option */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Atau Masukkan URL Gambar Langsung</label>
                  <input
                    type="text"
                    placeholder="https://... atau /uploads/..."
                    className="w-full p-2.5 border rounded-lg bg-white text-sm font-mono"
                    value={venueForm.image}
                    onChange={(e) => setVenueForm(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>

                {venueForm.image && (
                  <div className="mt-2 relative w-fit">
                    <img src={venueForm.image} alt="Venue Preview" className="w-32 h-32 object-cover rounded-lg border shadow-sm" />
                    <button
                      type="button"
                      onClick={() => setVenueForm(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-red-600"
                    >×</button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeMenu === 'stats' && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-medium">Kategori Statistik</label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={statsForm.label}
                  onChange={(e) => setStatsForm({ ...statsForm, label: e.target.value })}
                >
                  <option value="">Pilih kategori statistik...</option>
                  <option value="Pernikahan Sukses">Pernikahan Sukses</option>
                  <option value="Tahun Pengalaman">Tahun Pengalaman</option>
                  <option value="Kepuasan Klien">Kepuasan Klien</option>
                  <option value="Vendor Partner">Vendor Partner</option>
                  <option value="Klien Puas">Klien Puas</option>
                  <option value="Event Berhasil">Event Berhasil</option>
                  <option value="Foto Portfolio">Foto Portfolio</option>
                  <option value="Video Dokumentasi">Video Dokumentasi</option>
                  <option value="Testimonial">Testimonial</option>
                  <option value="Lokasi Venue">Lokasi Venue</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Nilai (contoh: 500, 98%, 10+)"
                className="w-full p-3 border rounded-lg"
                value={statsForm.value}
                onChange={(e) => setStatsForm({ ...statsForm, value: e.target.value })}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Gambar Statistik (opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-3 border rounded-lg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const uploadResponse = await uploadFile(file);
                        if (uploadResponse.success) {
                          setStatsForm({ ...statsForm, image: uploadResponse.data.path });
                        } else {
                          alert('Gagal upload gambar');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('Terjadi kesalahan saat upload gambar');
                      }
                    }
                  }}
                />
                {statsForm.image && (
                  <div className="mt-2">
                    <img src={statsForm.image} alt="Stats Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
            </>
          )}

          {activeMenu === 'wedding-show' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  className="w-full p-3 border rounded-lg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const uploadResponse = await uploadVideoFile(file);
                        if (uploadResponse.success) {
                          // For wedding show, we create the item immediately after upload
                          const createResponse = await apiRequest('/wedding-show-videos', {
                            method: 'POST',
                            body: JSON.stringify({
                              videoPath: uploadResponse.data.path,
                              thumbnail: ''
                            })
                          });
                          if (createResponse.success) {
                            setWeddingShowVideos(prev => [...prev, createResponse.data]);
                            alert('Video berhasil ditambahkan!');
                            setActionMode('view');
                          } else {
                            alert('Gagal menyimpan video');
                          }
                        } else {
                          alert('Gagal upload video');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('Terjadi kesalahan saat upload video');
                      }
                    }
                  }}
                />
              </div>
            </>
          )}



          {activeMenu === 'printing' && (selectedItem?.type === 'product' || !selectedItem?.type) && (
            <div className="space-y-6">
              {/* SECTION 1: KATEGORI & INFORMASI UTAMA */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm border-b pb-2">
                  <Printer size={18} />
                  <span>1. Kategori & Informasi Utama Produk</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Produk *</label>
                    <select
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                      value={printingProductForm.category_id || ''}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, category_id: parseInt(e.target.value) || null })}
                    >
                      <option value="">Pilih Kategori</option>
                      {printingCategories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Produk Cetak *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Undangan Akrilik Transparan Eksklusif (UV Print)"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                      value={printingProductForm.name}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Produk / Headline Keunggulan</label>
                  <textarea
                    placeholder="Contoh: Kemewahan undangan akrilik bening 2mm dengan cetak tinta UV timbul anti air dan amplop beludru premium..."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    rows={3}
                    value={printingProductForm.description}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Normal / Pcs (Rp) *</label>
                    <input
                      type="number"
                      placeholder="35000"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-bold"
                      value={printingProductForm.price}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-700 mb-1">Harga Diskon / Pcs (Rp)</label>
                    <input
                      type="number"
                      placeholder="29000"
                      className="w-full p-2.5 border border-rose-200 rounded-lg text-sm bg-white font-bold text-rose-700"
                      value={printingProductForm.discount_price}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, discount_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Order (Pcs)</label>
                    <input
                      type="number"
                      placeholder="50"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.min_order}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, min_order: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Pengerjaan</label>
                    <input
                      type="text"
                      placeholder="Estimasi 7-10 Hari Kerja"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.estimated_time}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, estimated_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: BAHAN, UKURAN & FINISHING */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b pb-2">
                  <Palette size={18} />
                  <span>2. Spesifikasi Bahan, Ukuran & Finishing (Tab Bahan & Simulasi)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilihan Ukuran (Pisahkan dengan koma)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 15 x 21 cm, 12 x 18 cm, A5, A4"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.size_options}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, size_options: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilihan Jenis Bahan / Kertas</label>
                    <input
                      type="text"
                      placeholder="Contoh: Akrilik Bening 2mm, Jasmine Glitter, Art Paper 260gsm"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.material_options}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, material_options: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilihan Warna / Tinta / Varian</label>
                    <input
                      type="text"
                      placeholder="Contoh: White Ink, Gold Ink, Full Color UV"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.color_options}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, color_options: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pilihan Finishing & Aksesoris</label>
                    <input
                      type="text"
                      placeholder="Contoh: Hotprint Foil Emas, Amplop Beludru Premium, Wax Seal"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.finishing_options}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, finishing_options: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: FITUR & RATING */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm border-b pb-2">
                  <Sparkles size={18} />
                  <span>3. Fitur Keunggulan & Rating Produk</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fitur & Poin Keunggulan (Pisahkan dengan koma atau baris baru)</label>
                  <textarea
                    placeholder={"Cetak Tinta UV Timbul Anti Air\nFree Amplop Eksklusif & Plastik OPP\nRevisi Desain Sampai Deal\nPacking Aman Double Bubble Wrap"}
                    className="w-full p-2.5 border rounded-lg text-xs font-mono bg-white leading-relaxed"
                    rows={3}
                    value={printingProductForm.features}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, features: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rating Produk (1.0 - 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="4.9"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.rating}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, rating: parseFloat(e.target.value) || 5 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Ulasan / Review</label>
                    <input
                      type="number"
                      placeholder="28"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingProductForm.reviews_count}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, reviews_count: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: FOTO & GALERI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <FileImage size={18} />
                    <span>4. Foto Produk Percetakan</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Mendukung multi-upload & URL</span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded-lg text-xs bg-white"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const uploadResponse = await uploadFile(file);
                        if (uploadResponse.success) {
                          const newPath = uploadResponse.data.path;
                          const existing = printingProductForm.images ? printingProductForm.images.trim() : '';
                          const updated = existing ? `${existing}, ${newPath}` : newPath;
                          setPrintingProductForm({ ...printingProductForm, images: updated });
                        } else {
                          alert('Gagal upload gambar');
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('Terjadi kesalahan saat upload gambar');
                      }
                    }
                  }}
                />

                <input
                  type="text"
                  placeholder="Atau masukkan URL gambar (pisahkan dengan koma)"
                  className="w-full p-2.5 border rounded-lg text-xs bg-white"
                  value={printingProductForm.images}
                  onChange={(e) => setPrintingProductForm({ ...printingProductForm, images: e.target.value })}
                />

                {Boolean(printingProductForm.images) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(Array.isArray(printingProductForm.images)
                      ? printingProductForm.images
                      : (typeof printingProductForm.images === 'string' ? printingProductForm.images.split(',') : [])
                    ).map((img: string, idx: number) => typeof img === 'string' && img.trim() && (
                      <div key={idx} className="relative">
                        <img src={img.trim()} alt={`Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded-xl border shadow-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            const arr = Array.isArray(printingProductForm.images)
                              ? printingProductForm.images
                              : (typeof printingProductForm.images === 'string' ? printingProductForm.images.split(',') : []);
                            const imgs = arr.map((s: string) => s.trim()).filter((_: any, i: number) => i !== idx);
                            setPrintingProductForm({ ...printingProductForm, images: imgs.join(', ') });
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 5: LABEL & STATUS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-2">
                  <CheckCircle size={18} />
                  <span>5. Labeling & Status Produk</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={printingProductForm.is_featured}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, is_featured: e.target.checked })}
                    />
                    <span className="font-semibold text-slate-700">★ Produk Unggulan (Featured)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={printingProductForm.is_new}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, is_new: e.target.checked })}
                    />
                    <span className="font-semibold text-slate-700">⚡ Produk Baru (New Tag)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'printing' && selectedItem?.type === 'package' && (
            <div className="space-y-6">
              {/* SECTION 1: INFORMASI UTAMA PAKET PRINTING */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm border-b pb-2">
                  <Printer size={18} />
                  <span>1. Informasi Utama Paket Percetakan</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Paket *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Paket Branding Bisnis Hemat"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                    value={printingPackageForm.name}
                    onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Paket</label>
                  <textarea
                    placeholder="Deskripsi ringkas mengenai paket ini..."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    rows={2}
                    value={printingPackageForm.description}
                    onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Normal (Rp) *</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-semibold"
                      value={printingPackageForm.price}
                      onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Diskon (Rp, opsional)</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingPackageForm.discount_price}
                      onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, discount_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori / Label Paket</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bisnis, UMKM, Event"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingPackageForm.category}
                      onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Masa Berlaku (Hari)</label>
                    <input
                      type="number"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={printingPackageForm.validity_days}
                      onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, validity_days: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: ITEM YANG TERMASUK */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b pb-2">
                  <CheckCircle size={18} />
                  <span>2. Item / Fasilitas yang Termasuk (1 per baris)</span>
                </div>
                <textarea
                  placeholder={"Contoh:\n100 Pcs Kartu Nama Premium\n50 Pcs Brosur A5 Full Color\n1 Roll Banner 60x160cm"}
                  className="w-full p-2.5 border rounded-lg text-xs bg-white font-mono"
                  rows={4}
                  value={printingPackageForm.included_items}
                  onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, included_items: e.target.value })}
                />
              </div>

              {/* SECTION 3: STATUS & FEATURED */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-2">
                  <CheckCircle size={18} />
                  <span>3. Status Paket</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={printingPackageForm.featured}
                      onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, featured: e.target.checked })}
                    />
                    <span className="font-semibold text-slate-700">★ Paket Unggulan (Featured)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={printingPackageForm.is_active}
                      onChange={(e) => setPrintingPackageForm({ ...printingPackageForm, is_active: e.target.checked })}
                    />
                    <span className="font-semibold text-slate-700">✓ Status Aktif</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'umrah-haji' && selectedItem?.type === 'umrah' && (
            <div className="space-y-6">
              {/* SECTION 1: INFORMASI UTAMA & HARGA */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm border-b pb-2">
                  <Plane size={18} />
                  <span>1. Informasi Utama & Harga Paket</span>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Paket Umrah *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Umrah Reguler Barakah 9 Hari"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                    value={umrahPackageForm.name}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Paket</label>
                  <textarea
                    placeholder="Jelaskan keunggulan dan gambaran umum program ibadah umrah ini..."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    rows={2}
                    value={umrahPackageForm.description}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (Hari)</label>
                    <input
                      type="number"
                      placeholder="9"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-semibold"
                      value={umrahPackageForm.duration}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, duration: parseInt(e.target.value) || 9 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Normal (Rp) *</label>
                    <input
                      type="number"
                      placeholder="28500000"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-semibold text-slate-900"
                      value={umrahPackageForm.price}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-700 mb-1">Harga Diskon / Coret (Rp)</label>
                    <input
                      type="number"
                      placeholder="26900000 (Harga yang dibayar)"
                      className="w-full p-2.5 border border-emerald-300 rounded-lg text-sm bg-white font-bold text-emerald-700"
                      value={umrahPackageForm.discount_price}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, discount_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kota Keberangkatan</label>
                    <input
                      type="text"
                      placeholder="Jakarta / Surabaya / Solo"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.departure_city}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, departure_city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Maskapai Penerbangan</label>
                    <input
                      type="text"
                      placeholder="Saudi Airlines / Garuda Indonesia"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.airline}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, airline: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tags / Label Badge (pisahkan koma)</label>
                  <input
                    type="text"
                    placeholder="Paling Populer, Direct Flight, Free Kereta Cepat, Ramadhan"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    value={umrahPackageForm.tags}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, tags: e.target.value })}
                  />
                </div>
              </div>

              {/* SECTION 2: AKOMODASI & TRANSPORTASI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm border-b pb-2">
                  <Hotel size={18} />
                  <span>2. Akomodasi Hotel & Transportasi</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Makkah</label>
                    <input
                      type="text"
                      placeholder="Makkah Clock Royal Tower / Le Meridien"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.hotel_mekah}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, hotel_mekah: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jarak ke Masjidil Haram</label>
                    <input
                      type="text"
                      placeholder="±50m ke Pelataran"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.distance_haram}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, distance_haram: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bintang Hotel</label>
                    <select
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                      value={umrahPackageForm.hotel_rating}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, hotel_rating: e.target.value })}
                    >
                      <option value="3 Star">3 Star (Bintang 3)</option>
                      <option value="4 Star">4 Star (Bintang 4)</option>
                      <option value="5 Star">5 Star (Bintang 5)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Madinah</label>
                    <input
                      type="text"
                      placeholder="Anwar Al Madinah Movenpick / Grand Plaza"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.hotel_madinah}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, hotel_madinah: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Transportasi Darat</label>
                    <input
                      type="text"
                      placeholder="Bus AC Eksekutif & Kereta Cepat Haramain"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.transport_type}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, transport_type: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ITINERARY RUNDOWN */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <Calendar size={18} />
                    <span>3. Itinerary / Rundown Kegiatan Hari demi Hari</span>
                  </div>
                  <span className="text-[11px] text-slate-500">1 baris per hari kegiatan</span>
                </div>
                <textarea
                  placeholder={"Hari 1: Keberangkatan Menuju Jeddah / Madinah - Berkumpul di Bandara Soetta T3 dan penerbangan langsung\nHari 2: Ziarah Kota Madinah & Shalat Raudhah - Ziarah Makam Rasulullah SAW dan tasreh Raudhah\nHari 3: Ziarah Luar Madinah - Ziarah Masjid Quba, Jabal Uhud, dan Kebun Kurma\nHari 4: Menuju Makkah & Pelaksanaan Umrah 1 - Miqat di Bir Ali, Kereta Cepat ke Makkah, Thawaf, Sa'i, Tahallul\nHari 5: Ibadah Mandiri di Masjidil Haram - Memperbanyak thawaf sunnah dan tilawah\nHari 6: Ziarah Kota Makkah & Umrah 2 - Ziarah Padang Arafah, Muzdalifah, Mina, Miqat Ji'ranah\nHari 7: Ziarah Wisata Sejarah Kota Thaif - Wisata Thaif dan penyulingan parfum mawar\nHari 8: Thawaf Wada' & Kepulangan - Thawaf Wada' dan menuju Bandara Jeddah\nHari 9: Tiba di Tanah Air - Tiba di Jakarta dan pembagian air zamzam 5L"}
                  className="w-full p-3 border rounded-lg text-xs font-mono bg-white leading-relaxed"
                  rows={6}
                  value={umrahPackageForm.itinerary}
                  onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, itinerary: e.target.value })}
                />
              </div>

              {/* SECTION 4: FASILITAS & PERLENGKAPAN */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b pb-2">
                  <Sparkles size={18} />
                  <span>4. Fasilitas, Perlengkapan & Catatan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fasilitas Termasuk All-In (1 per baris)</label>
                    <textarea
                      placeholder={"Tiket Pesawat PP Direct Flight Saudi Airlines / Garuda\nHotel Bintang Dekat Masjidil Haram & Nabawi\nMakan 3x Sehari Fullboard Buffet Indonesia\nVisa Resmi Umrah & Asuransi Perjalanan\nTransportasi Bus AC & Kereta Cepat Haramain\nMutawwif / Tour Leader Berpengalaman\nCity Tour / Ziarah Makkah, Madinah & Thaif"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={5}
                      value={umrahPackageForm.included_features}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, included_features: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fasilitas Tidak Termasuk (1 per baris)</label>
                    <textarea
                      placeholder={"Pembuatan Paspor Pribadi\nPengeluaran Pribadi (Laundry, Kelebihan Bagasi)\nKebutuhan Medis Khusus di luar Asuransi"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={5}
                      value={umrahPackageForm.excluded_features}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, excluded_features: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Skema Pembayaran / DP (1 per baris)</label>
                    <textarea
                      placeholder={"DP Booking Seat: Rp 5.000.000 / jamaah\nPenyerahan Dokumen: H-30 keberangkatan\nPelunasan Biaya: H-20 keberangkatan\nManasik Umrah Akbar: H-14 keberangkatan"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={3}
                      value={umrahPackageForm.payment_plans}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, payment_plans: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Penting / Syarat Dokumen (1 per baris)</label>
                    <textarea
                      placeholder={"Paspor asli masa berlaku minimal 8 bulan\nNama di paspor minimal 2 kata\nFotokopi KTP, KK, dan Buku Nikah / Akta Lahir\nPasfoto 4x6 latar belakang putih (2 lembar)\nBukti vaksin meningitis"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={3}
                      value={umrahPackageForm.important_notes}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, important_notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: KUOTA, TANGGAL & RATING */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm border-b pb-2">
                  <Users size={18} />
                  <span>5. Kuota, Tanggal & Penilaian</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas Grup</label>
                    <input
                      type="number"
                      placeholder="40"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.group_size}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, group_size: parseInt(e.target.value) || 40 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sisa Kursi / Seat</label>
                    <input
                      type="number"
                      placeholder="12"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-bold text-emerald-700"
                      value={umrahPackageForm.availability}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, availability: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (0 - 5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="4.9"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.rating}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, rating: parseFloat(e.target.value) || 4.9 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Ulasan</label>
                    <input
                      type="number"
                      placeholder="320"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={umrahPackageForm.reviews_count}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, reviews_count: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pilihan Tanggal Keberangkatan (pisahkan koma)</label>
                  <input
                    type="text"
                    placeholder="2024-10-15, 2024-11-20, 2024-12-10"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    value={umrahPackageForm.departure_dates}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, departure_dates: e.target.value })}
                  />
                </div>
              </div>

              {/* SECTION 6: UPLOAD FOTO & GALERI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
                    <FileImage size={18} />
                    <span>6. Foto & Galeri Paket</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Mendukung multi upload & URL foto</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="flex-1 p-2.5 border rounded-lg text-xs bg-white"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const uploadResponse = await uploadFile(file);
                          if (uploadResponse.success) {
                            const newPath = uploadResponse.data.path;
                            const existing = umrahPackageForm.images ? umrahPackageForm.images.trim() : '';
                            const updated = existing ? `${existing}, ${newPath}` : newPath;
                            setUmrahPackageForm({ ...umrahPackageForm, images: updated });
                          } else {
                            alert('Gagal upload gambar: ' + (uploadResponse.error || 'Unknown error'));
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('Terjadi kesalahan saat upload gambar');
                        }
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL Gambar (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..., https://..."
                    className="w-full p-2.5 border rounded-lg text-xs bg-white"
                    value={umrahPackageForm.images}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, images: e.target.value })}
                  />
                </div>

                {umrahPackageForm.images && (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {umrahPackageForm.images.split(',').map((img, idx) => img.trim() && (
                      <div key={idx} className="relative group">
                        <img
                          src={img.trim()}
                          alt={`Preview ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-sm"
                          onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=400&q=80'; }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const imgs = umrahPackageForm.images.split(',').map(s => s.trim()).filter((_, i) => i !== idx);
                            setUmrahPackageForm({ ...umrahPackageForm, images: imgs.join(', ') });
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-rose-700 transition-colors"
                          title="Hapus foto"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 7: CHECKLIST FITUR & BADGE */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm border-b pb-2">
                  <CheckCircle size={18} />
                  <span>7. Checklist Layanan & Badge Status</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.meals_included}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, meals_included: e.target.checked })}
                    />
                    <span className="font-medium text-slate-700">Makan 3x Fullboard</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.tour_guide}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, tour_guide: e.target.checked })}
                    />
                    <span className="font-medium text-slate-700">Mutawwif & TL</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.visa_assistance}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, visa_assistance: e.target.checked })}
                    />
                    <span className="font-medium text-slate-700">Visa & Asuransi</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.vaccination_assistance}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, vaccination_assistance: e.target.checked })}
                    />
                    <span className="font-medium text-slate-700">Bantuan Vaksin</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.featured}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, featured: e.target.checked })}
                    />
                    <span className="font-medium text-amber-900">Paket Unggulan ⭐</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.best_seller}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, best_seller: e.target.checked })}
                    />
                    <span className="font-medium text-emerald-900">Best Seller 🔥</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-blue-50/50">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.early_bird_discount}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, early_bird_discount: e.target.checked })}
                    />
                    <span className="font-medium text-blue-900">Early Bird Promo</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={umrahPackageForm.is_active}
                      onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, is_active: e.target.checked })}
                    />
                    <span className="font-bold text-emerald-900">Status Aktif di Web</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'umrah-haji' && selectedItem?.type === 'haji' && (
            <div className="space-y-6">
              {/* SECTION 1: INFORMASI UTAMA HAJI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-sm border-b pb-2">
                  <Shield size={18} />
                  <span>1. Informasi Paket Haji & Kuota</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Paket Haji *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Paket Haji Furoda Mujamalah (Langsung Berangkat)"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                    value={hajiPackageForm.name}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi Paket Haji</label>
                  <textarea
                    placeholder="Deskripsi keunggulan haji, visa furoda / khusus, fasilitas maktab, dll..."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white"
                    rows={2}
                    value={hajiPackageForm.description}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Kuota</label>
                    <input
                      type="text"
                      placeholder="1446H / 2025M"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-medium"
                      value={hajiPackageForm.quota_year}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, quota_year: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Harga Normal (Rp) *</label>
                    <input
                      type="number"
                      placeholder="295000000"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-semibold"
                      value={hajiPackageForm.price}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-purple-700 mb-1">Harga Diskon / Coret (Rp)</label>
                    <input
                      type="number"
                      placeholder="285000000"
                      className="w-full p-2.5 border border-purple-300 rounded-lg text-sm bg-white font-bold text-purple-700"
                      value={hajiPackageForm.discount_price}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, discount_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Akhir Pendaftaran</label>
                    <input
                      type="text"
                      placeholder="30 Ramadhan 1446H"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.registration_deadline}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, registration_deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sisa Kuota / Seat Tersedia</label>
                    <input
                      type="number"
                      placeholder="15"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white font-bold text-purple-700"
                      value={hajiPackageForm.available_quota}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, available_quota: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sesi Bimbingan / Manasik</label>
                    <input
                      type="number"
                      placeholder="12"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.training_sessions}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, training_sessions: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: AKOMODASI HOTEL MEKAH, MADINAH & JEDDAH */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm border-b pb-2">
                  <Hotel size={18} />
                  <span>2. Rincian Akomodasi Hotel Haji</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Makkah</label>
                    <input
                      type="text"
                      placeholder="Makkah Clock Royal Tower"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_mekah_hotel}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_mekah_hotel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Malam Makkah</label>
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_mekah_nights}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_mekah_nights: parseInt(e.target.value) || 20 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jarak ke Masjidil Haram</label>
                    <input
                      type="text"
                      placeholder="±50m ke Pelataran"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_mekah_distance}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_mekah_distance: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Madinah</label>
                    <input
                      type="text"
                      placeholder="Anwar Al Madinah Movenpick"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_madinah_hotel}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_madinah_hotel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Malam Madinah</label>
                    <input
                      type="number"
                      placeholder="10"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_madinah_nights}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_madinah_nights: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jarak ke Masjid Nabawi</label>
                    <input
                      type="text"
                      placeholder="±100m ke Nabawi"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_madinah_distance}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_madinah_distance: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Transit Jeddah (opsional)</label>
                    <input
                      type="text"
                      placeholder="Casablanca Grand Hotel Jeddah"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_jeddah_hotel}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_jeddah_hotel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Malam Jeddah</label>
                    <input
                      type="number"
                      placeholder="2"
                      className="w-full p-2.5 border rounded-lg text-sm bg-white"
                      value={hajiPackageForm.accommodation_jeddah_nights}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_jeddah_nights: parseInt(e.target.value) || 2 })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: FASILITAS, SYARAT & TAHAPAN PEMBAYARAN */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b pb-2">
                  <Sparkles size={18} />
                  <span>3. Fasilitas, Persyaratan & Tahapan Bayar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fasilitas Termasuk (1 per baris)</label>
                    <textarea
                      placeholder={"Visa Haji Furoda Resmi Kerajaan Arab Saudi\nTiket Pesawat Saudi Airlines Direct PP\nHotel Bintang 5 Dekat Masjidil Haram & Nabawi\nMaktab VIP Tenda AC Arafah & Mina\nFullboard Buffet Dining & Snack 24 Jam\nDokter & Tim Medis Standby Khusus\nPerlengkapan Haji Eksklusif & Air Zamzam 5L"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={4}
                      value={hajiPackageForm.included_features}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, included_features: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fasilitas Tidak Termasuk (1 per baris)</label>
                    <textarea
                      placeholder={"Biaya Dam / Qurban\nPengeluaran Pribadi (Laundry, Telepon)\nBiaya Pembuatan Paspor"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={4}
                      value={hajiPackageForm.excluded_features}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, excluded_features: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tahapan Pembayaran & DP (1 per baris)</label>
                    <textarea
                      placeholder={"DP USD 5,000 saat pendaftaran\nPelunasan setelah visa terbit (H-45)\nGaransi uang kembali 100% jika visa tidak terbit"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={3}
                      value={hajiPackageForm.payment_terms}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, payment_terms: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Persyaratan Dokumen (1 per baris)</label>
                    <textarea
                      placeholder={"Paspor asli masa berlaku minimal 8 bulan\nFotokopi KTP & KK\nBuku Nikah / Akta Lahir\nPasfoto 4x6 latar belakang putih 10 lembar\nBuku Vaksin Meningitis & Polio"}
                      className="w-full p-2.5 border rounded-lg text-xs bg-white"
                      rows={3}
                      value={hajiPackageForm.requirements}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, requirements: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: FOTO & GALERI HAJI */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
                    <FileImage size={18} />
                    <span>4. Foto & Galeri Paket Haji</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Upload & URL foto</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="flex-1 p-2.5 border rounded-lg text-xs bg-white"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const uploadResponse = await uploadFile(file);
                          if (uploadResponse.success) {
                            const newPath = uploadResponse.data.path;
                            const existing = hajiPackageForm.images ? hajiPackageForm.images.trim() : '';
                            const updated = existing ? `${existing}, ${newPath}` : newPath;
                            setHajiPackageForm({ ...hajiPackageForm, images: updated });
                          } else {
                            alert('Gagal upload gambar: ' + (uploadResponse.error || 'Unknown error'));
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          alert('Terjadi kesalahan saat upload gambar');
                        }
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">URL Gambar (pisahkan dengan koma)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..., https://..."
                    className="w-full p-2.5 border rounded-lg text-xs bg-white"
                    value={hajiPackageForm.images}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, images: e.target.value })}
                  />
                </div>

                {hajiPackageForm.images && (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {hajiPackageForm.images.split(',').map((img, idx) => img.trim() && (
                      <div key={idx} className="relative group">
                        <img
                          src={img.trim()}
                          alt={`Preview ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-sm"
                          onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=400&q=80'; }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const imgs = hajiPackageForm.images.split(',').map(s => s.trim()).filter((_, i) => i !== idx);
                            setHajiPackageForm({ ...hajiPackageForm, images: imgs.join(', ') });
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow hover:bg-rose-700 transition-colors"
                          title="Hapus foto"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 5: CHECKLIST & STATUS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-purple-800 font-bold text-sm border-b pb-2">
                  <CheckCircle size={18} />
                  <span>5. Checklist Layanan & Status</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-purple-50/50">
                    <input
                      type="checkbox"
                      checked={hajiPackageForm.medical_facility}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, medical_facility: e.target.checked })}
                    />
                    <span className="font-medium text-slate-700">Fasilitas & Dokter Medis Khusus</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border cursor-pointer hover:bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={hajiPackageForm.featured}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, featured: e.target.checked })}
                    />
                    <span className="font-medium text-amber-900">Paket Unggulan ⭐</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 border border-purple-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hajiPackageForm.is_active}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, is_active: e.target.checked })}
                    />
                    <span className="font-bold text-purple-900">Status Aktif di Web</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={() => {
                setActionMode('view');
                resetForms();
              }}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getMenuLabel = (menuId: MenuItem) => {
    return menuItems.find(item => item.id === menuId)?.label || '';
  };

  // Group menu items for sidebar sections
  const menuGroups = [
    { label: null, items: menuItems.filter(m => m.id === 'dashboard') },
    { label: 'Konten Wedding', items: menuItems.filter(m => ['gallery', 'testimonials', 'packages', 'venues', 'videos', 'wedding-show'].includes(m.id)) },
    { label: 'Bisnis', items: menuItems.filter(m => ['printing', 'umrah-haji'].includes(m.id)) },
    { label: 'Pengaturan', items: menuItems.filter(m => ['appearance', 'settings'].includes(m.id)) },
  ];

  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: <Home size={18} /> },
    { id: 'packages', label: 'Wedding', icon: <Package size={18} /> },
    { id: 'umrah-haji', label: 'Umrah/Haji', icon: <Globe size={18} /> },
    { id: 'printing', label: 'Cetak', icon: <Printer size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20">
      {/* ═══ TOP BAR ═══ */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronLeft size={20} className="text-slate-600" /> : <Menu size={20} className="text-slate-600" />}
            </button>
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-base font-bold text-slate-900 truncate tracking-tight">Galeria Admin</h1>
              <p className="text-[11px] text-slate-400 truncate">Wedding & Business Management</p>
            </div>
            {/* Mobile brand */}
            <span className="sm:hidden text-sm font-bold text-slate-900 truncate">Galeria</span>
          </div>

          {/* Center: Breadcrumb (desktop only) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Home size={12} />
            <span>/</span>
            <span className="text-slate-700 font-semibold">{getMenuLabel(activeMenu)}</span>
            {actionMode !== 'view' && (
              <>
                <span>/</span>
                <span className="text-amber-600">{actionMode === 'add' ? 'Tambah Baru' : 'Edit'}</span>
              </>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => window.open('/', '_blank')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 text-xs font-semibold shadow-sm shadow-amber-200 transition-all active:scale-95"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="sm:hidden p-2 hover:bg-amber-50 rounded-xl transition-colors"
            >
              <Eye size={18} className="text-amber-600" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer">
              A
            </div>
          </div>
        </div>
      </header>

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* ═══ SIDEBAR ═══ */}
        <aside className={`
          fixed md:sticky top-16 md:top-0 h-[calc(100vh-64px)] z-50 md:z-10
          bg-white border-r border-slate-200/60 flex-shrink-0
          transition-all duration-300 ease-in-out
          ${sidebarOpen
            ? 'w-64 min-w-[16rem] translate-x-0 shadow-2xl md:shadow-none'
            : 'w-0 min-w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-r-0'
          }
        `}>
          <div className="w-64 h-full flex flex-col overflow-y-auto admin-scrollbar">
            {/* Sidebar Header */}
            <div className="px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                  <Heart size={14} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">Galeria Wedding</p>
                  <p className="text-[10px] text-slate-400 font-medium">Control Panel</p>
                </div>
              </div>
            </div>

            {/* Nav Groups */}
            <nav className="flex-1 px-3 pb-6 space-y-5">
              {menuGroups.map((group, gi) => (
                <div key={gi}>
                  {group.label && (
                    <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">{group.label}</p>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveMenu(item.id as MenuItem);
                          setActionMode('view');
                          resetForms();
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap group
                          ${activeMenu === item.id
                            ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-700 font-semibold shadow-sm border border-amber-200/50'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }
                        `}
                      >
                        <span className={`flex-shrink-0 transition-colors ${activeMenu === item.id ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-500'}`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                        {activeMenu === item.id && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold">
                  A
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 truncate">Administrator</p>
                  <p className="text-[10px] text-slate-400 truncate">admin@galeria.com</p>
                </div>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
                  <LogOut size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="flex-1 min-w-0 overflow-x-hidden pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">{getMenuLabel(activeMenu)}</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {actionMode === 'view'
                    ? `Kelola data ${getMenuLabel(activeMenu).toLowerCase()}`
                    : actionMode === 'add' ? 'Tambah data baru' : 'Edit data'
                  }
                </p>
              </div>

              {actionMode === 'view' && !['dashboard', 'settings', 'appearance', 'printing', 'umrah-haji'].includes(activeMenu) && (
                <button
                  onClick={() => {
                    resetForms();
                    setActionMode('add');
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-sm shadow-amber-200/50 text-sm font-semibold transition-all active:scale-95 self-start"
                >
                  <Plus size={16} />
                  <span>Tambah Baru</span>
                </button>
              )}
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </main>
      </div>

      {/* ═══ MOBILE BOTTOM NAV ═══ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id as MenuItem);
                setActionMode('view');
                resetForms();
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[56px] ${
                activeMenu === item.id
                  ? 'text-amber-600'
                  : 'text-slate-400 active:text-slate-600'
              }`}
            >
              <span className={`transition-transform ${activeMenu === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
              <span className={`text-[10px] font-medium ${activeMenu === item.id ? 'font-bold' : ''}`}>{item.label}</span>
              {activeMenu === item.id && <div className="w-4 h-0.5 rounded-full bg-amber-500 mt-0.5" />}
            </button>
          ))}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-slate-400 active:text-slate-600 min-w-[56px]"
          >
            <Menu size={20} />
            <span className="text-[10px] font-medium">Lainnya</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

// Component untuk Dashboard dengan Ringkasan Paket Wedding, Printing, dan Umrah & Haji
const DashboardContent = ({
  weddingPackages = [],
  printingProducts = [],
  printingPackages = [],
  umrahPackages = [],
  hajiPackages = [],
  stats = { gallery: 0, testimonials: 0, packages: 0, venues: 0, printing: 0, umrah: 0, haji: 0 },
  onNavigate,
  onEditWedding,
  onAddWedding,
  onEditPrinting,
  onAddPrinting,
  onEditUmrah,
  onAddUmrah,
  onEditHaji,
  onAddHaji,
}: any) => {
  const [religiousTab, setReligiousTab] = useState<'all' | 'umrah' | 'haji'>('all');

  const getWeddingFallbackImg = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('diamond') || n.includes('royal') || n.includes('luxury')) {
      return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
    } else if (n.includes('platinum') || n.includes('gold')) {
      return 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80';
  };

  const getPrintingFallbackImg = (catId?: number) => {
    switch (catId) {
      case 1: return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
      case 2: return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
      case 3: return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80';
      default: return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
    }
  };

  const formatPrintingSpec = (val: any) => {
    if (!val) return '-';
    if (Array.isArray(val)) return val.slice(0, 2).join(', ');
    if (typeof val === 'string') {
      const parts = val.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
      return parts.slice(0, 2).join(', ') || '-';
    }
    return String(val);
  };

  const filteredReligious = useMemo(() => {
    if (religiousTab === 'umrah') return umrahPackages.map(p => ({ ...p, _type: 'umrah' }));
    if (religiousTab === 'haji') return hajiPackages.map(p => ({ ...p, _type: 'haji' }));
    return [
      ...umrahPackages.map(p => ({ ...p, _type: 'umrah' })),
      ...hajiPackages.map(p => ({ ...p, _type: 'haji' }))
    ];
  }, [religiousTab, umrahPackages, hajiPackages]);

  return (
    <div className="space-y-8">
      {/* 1. Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/15 via-blue-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Aktif & Terintegrasi
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pusat Manajemen Galeria 👋
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Kelola paket wedding eksklusif, produk percetakan digital, serta paket ibadah Umrah & Haji langsung dari dashboard terpadu.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAddWedding}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={14} />
              <span>+ Paket Wedding</span>
            </button>
            <button
              onClick={onAddPrinting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={14} />
              <span>+ Produk Cetak</span>
            </button>
            <button
              onClick={onAddUmrah}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={14} />
              <span>+ Paket Umrah</span>
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all"
              title="Buka Website"
            >
              <Eye size={14} />
              <span>Website</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Counter Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
        {[
          { label: 'Paket Wedding', count: weddingPackages.length, icon: <Package size={18} />, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600', menu: 'packages' },
          { label: 'Produk Cetak', count: printingProducts.length, icon: <Printer size={18} />, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 border-violet-100', text: 'text-violet-600', menu: 'printing' },
          { label: 'Paket Umrah', count: umrahPackages.length, icon: <Plane size={18} />, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', menu: 'umrah-haji' },
          { label: 'Paket Haji', count: hajiPackages.length, icon: <Shield size={18} />, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600', menu: 'umrah-haji' },
          { label: 'Galeri Foto', count: stats.gallery, icon: <Image size={18} />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', menu: 'gallery' },
          { label: 'Testimonial', count: stats.testimonials, icon: <MessageSquare size={18} />, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50 border-pink-100', text: 'text-pink-600', menu: 'testimonials' },
          { label: 'Venue Rekanan', count: stats.venues, icon: <MapPin size={18} />, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 border-cyan-100', text: 'text-cyan-600', menu: 'venues' },
        ].map((stat, i) => (
          <div
            key={i}
            onClick={() => onNavigate && onNavigate(stat.menu as any)}
            className="group bg-white rounded-2xl p-4 border border-slate-100 hover:border-amber-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} border flex items-center justify-center ${stat.text} transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-600 transition-colors">Buka →</span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{stat.count}</p>
              <span className="text-xs font-medium text-slate-500 truncate block mt-0.5">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 3. PAKET WEDDING SECTION                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">Paket Pernikahan (Wedding)</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  {weddingPackages.length} Paket
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Katalog paket all-in wedding organizer, dekorasi, makeup, dan vendor lengkap.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onAddWedding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Tambah Paket</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('packages')}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              <span>Kelola Semua</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {weddingPackages.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum ada paket wedding</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tambahkan paket pernikahan pertama Anda untuk mulai menampilkannya di website.
            </p>
            <button
              onClick={onAddWedding}
              className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-600"
            >
              + Tambah Paket Wedding
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {weddingPackages.map((item: any) => {
              const bannerImg = getFirstImage(item.images, getWeddingFallbackImg(item.name));
              
              const featuresList = Array.isArray(item.features)
                ? item.features
                : (typeof item.features === 'string' ? item.features.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : []);

              const hasDiscount = item.discount_price && Number(item.discount_price) > 0 && Number(item.discount_price) < Number(item.price);

              return (
                <div
                  key={item.id}
                  className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-900">
                    <img
                      src={bannerImg}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e: any) => { e.target.src = getWeddingFallbackImg(item.name); }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                    
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                        {item.highlighted ? "★ PILIHAN UTAMA" : "PAKET WEDDING"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${item.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                        {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2.5">
                      <span className="text-[11px] font-medium text-amber-300 backdrop-blur-md bg-black/50 px-2 py-0.5 rounded-md">
                        {featuresList.length > 0 ? `${featuresList.length} Fasilitas All-In` : 'Vendor Lengkap'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h5 className="font-serif font-bold text-base text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {item.name}
                      </h5>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.description || item.longDescription || "Paket pernikahan lengkap dengan koordinasi vendor profesional."}
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Harga Paket</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-extrabold text-slate-900">
                              Rp {Number(item.price || 0).toLocaleString('id-ID')}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-rose-500 line-through">
                                Rp {Number(item.discount_price).toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-1 rounded-lg border">
                          All-In
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2 border-t border-slate-100">
                      <button
                        onClick={() => onEditWedding && onEditWedding(item)}
                        className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Edit size={13} />
                        <span>Edit Paket</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 4. PRODUK & PAKET PERCETAKAN (PRINTING) SECTION                           */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600">
              <Printer size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">Produk & Paket Percetakan (Printing)</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold">
                  {printingProducts.length} Produk
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Katalog undangan pernikahan, sablon kaos, banner, stiker label, dan merchandise.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onAddPrinting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Tambah Produk</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('printing')}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              <span>Kelola Semua</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {printingProducts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Printer className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum ada produk percetakan</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tambahkan produk cetak seperti undangan atau sablon untuk katalog pelanggan.
            </p>
            <button
              onClick={onAddPrinting}
              className="mt-3 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl hover:bg-violet-700"
            >
              + Tambah Produk Percetakan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {printingProducts.slice(0, 6).map((product: any) => {
              const img = getFirstImage(product.images, getPrintingFallbackImg(product.category_id));
              
              const hasDiscount = product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price);
              const categoryLabel = product.category_name || (product.category_id === 1 ? 'Undangan' : product.category_id === 2 ? 'Sablon Kaos' : product.category_id === 3 ? 'Banner' : 'Percetakan');

              return (
                <div
                  key={product.id}
                  className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e: any) => { e.target.src = getPrintingFallbackImg(product.category_id); }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-0.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold rounded-lg flex items-center gap-1">
                        <Tag size={10} className="text-amber-400" />
                        <span>{categoryLabel}</span>
                      </span>
                      <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                        Min. {product.min_order || 1} pcs
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow ${product.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                        {product.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h5 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-violet-600 transition-colors">
                        {product.name}
                      </h5>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {product.description || 'Kualitas cetak tajam, presisi, dan bahan premium.'}
                      </p>

                      <div className="mt-2.5 bg-slate-50 rounded-xl p-2 border border-slate-100 space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Bahan:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[160px]">{formatPrintingSpec(product.material_options)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Estimasi:</span>
                          <span className="font-medium text-slate-700">{product.estimated_time || '3-5 Hari'}</span>
                        </div>
                      </div>

                      <div className="mt-2.5">
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs text-slate-400 line-through">
                              Rp {Number(product.price).toLocaleString('id-ID')}
                            </span>
                            <span className="text-base font-extrabold text-emerald-700">
                              Rp {Number(product.discount_price).toLocaleString('id-ID')}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">/ pcs</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-extrabold text-slate-900">
                              Rp {Number(product.price || 0).toLocaleString('id-ID')}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">/ pcs</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2 border-t border-slate-100">
                      <button
                        onClick={() => onEditPrinting && onEditPrinting(product)}
                        className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Edit size={13} />
                        <span>Edit Produk</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 5. PAKET UMRAH & HAJI SECTION                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">Paket Ibadah Umrah & Haji</h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {umrahPackages.length + hajiPackages.length} Paket
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Katalog paket perjalanan ibadah Umrah Reguler/Plus, Haji Furoda & Mujamalah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onAddUmrah}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>+ Umrah</span>
            </button>
            <button
              onClick={onAddHaji}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>+ Haji</span>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('umrah-haji')}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              <span>Kelola Semua</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Filter sub tabs inside dashboard */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setReligiousTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              religiousTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Semua ({umrahPackages.length + hajiPackages.length})
          </button>
          <button
            onClick={() => setReligiousTab('umrah')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              religiousTab === 'umrah' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🕋 Paket Umrah ({umrahPackages.length})
          </button>
          <button
            onClick={() => setReligiousTab('haji')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              religiousTab === 'haji' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🕌 Paket Haji ({hajiPackages.length})
          </button>
        </div>

        {filteredReligious.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Globe className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Belum ada paket perjalanan ibadah</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tambahkan paket perjalanan Umrah atau Haji untuk membuka pendaftaran jamaah.
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={onAddUmrah}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
              >
                + Tambah Paket Umrah
              </button>
              <button
                onClick={onAddHaji}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700"
              >
                + Tambah Paket Haji
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReligious.slice(0, 6).map((pkg: any) => {
              const isHaji = pkg._type === 'haji' || pkg.package_type === 'haji';
              const FALLBACK_HAJI = 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80';
              const FALLBACK_UMRAH = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80';
              const img = getFirstImage(pkg.images, isHaji ? FALLBACK_HAJI : FALLBACK_UMRAH);
              
              const hasDiscount = pkg.discount_price && Number(pkg.discount_price) > 0 && Number(pkg.discount_price) < Number(pkg.price);

              return (
                <div
                  key={`${isHaji ? 'haji' : 'umrah'}-${pkg.id}`}
                  className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <img
                      src={img}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className={`px-2.5 py-0.5 ${isHaji ? 'bg-purple-700' : 'bg-emerald-700'} text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-sm`}>
                        {isHaji ? <Shield size={10} /> : <Plane size={10} />}
                        <span>{isHaji ? (pkg.quota_year || 'Haji Furoda') : `${pkg.duration || 9} Hari`}</span>
                      </span>
                      {!isHaji && pkg.airline && (
                        <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-emerald-300 text-[10px] font-semibold rounded-lg">
                          {pkg.airline}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow ${pkg.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                        {pkg.is_active !== false ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h5 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {pkg.name}
                      </h5>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {pkg.description || 'Program ibadah terpercaya dengan fasilitas akomodasi premium.'}
                      </p>

                      <div className="mt-2.5 bg-slate-50 rounded-xl p-2 border border-slate-100 space-y-1 text-xs text-slate-600">
                        {!isHaji ? (
                          <>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Hotel Mekah:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[160px]">{pkg.hotel_mekah || 'Bintang 4/5 Dekat Haram'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Sisa Seat:</span>
                              <span className="font-bold text-emerald-700">{pkg.availability || 15} Kursi</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Tahun Kuota:</span>
                              <span className="font-medium text-slate-700">{pkg.quota_year || '1446H'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-400">Sisa Kuota:</span>
                              <span className="font-bold text-purple-700">{pkg.available_quota || 10} Jamaah</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-2.5">
                        {hasDiscount ? (
                          <div>
                            <span className="text-xs text-slate-400 line-through mr-1.5">
                              Rp {Number(pkg.price).toLocaleString('id-ID')}
                            </span>
                            <span className="text-base font-extrabold text-emerald-700">
                              Rp {Number(pkg.discount_price).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-extrabold text-slate-900">
                            Rp {Number(pkg.price || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          if (isHaji) {
                            onEditHaji && onEditHaji(pkg);
                          } else {
                            onEditUmrah && onEditUmrah(pkg);
                          }
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Edit size={13} />
                        <span>Edit Paket {isHaji ? 'Haji' : 'Umrah'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Tips & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><Info size={14} className="text-amber-600" /></div>
            <h4 className="font-bold text-sm text-slate-800">Tips Pengelolaan Katalog</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Perbarui harga dan diskon paket secara berkala untuk menarik pelanggan.</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Cantumkan minimal order dan spesifikasi bahan pada produk cetak.</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Pastikan ketersediaan seat dan jadwal keberangkatan umrah selalu terupdate.</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />Gunakan foto berkualitas tinggi dengan rasio lanskap pada semua paket.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><Clock size={14} className="text-blue-600" /></div>
            <h4 className="font-bold text-sm text-slate-800">Status Modul Sistem</h4>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600">
            {[
              { title: 'Modul Paket Wedding', status: `${weddingPackages.length} Paket terdaftar`, dot: 'bg-amber-400' },
              { title: 'Modul Produk Percetakan', status: `${printingProducts.length} Produk aktif`, dot: 'bg-violet-400' },
              { title: 'Modul Umrah & Haji', status: `${umrahPackages.length} Umrah, ${hajiPackages.length} Haji`, dot: 'bg-emerald-400' },
              { title: 'Katalog & Galeri Foto', status: `${stats.gallery} Foto tersimpan`, dot: 'bg-blue-400' },
              { title: 'Ulasan & Testimonial', status: `${stats.testimonials} Ulasan aktif`, dot: 'bg-pink-400' },
            ].map((mod, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${mod.dot}`} />
                  <span className="font-semibold text-slate-800 truncate">{mod.title}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{mod.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GalleryContent = ({ items, onEdit, onDelete }: any) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: any) => (
        <div key={item.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="aspect-video bg-slate-50 relative overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Image className="text-slate-300" size={40} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-4">
            <h4 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 py-2 bg-slate-900 text-amber-400 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
              >
                <Edit size={13} /> Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="py-2 px-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors border border-rose-200/50"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TestimonialsContent = ({ items, onEdit, onDelete }: any) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={32} />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">Belum Ada Testimonial</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Testimonial dan review yang dikirim pengunjung / akun Google akan muncul di sini. Anda juga bisa menambahkan testimonial baru secara manual.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item: any) => {
        const rating = Number(item.rating) || 5;
        return (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold flex-shrink-0 shadow-sm overflow-hidden">
                    {(item.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] text-slate-400">{item.date}</p>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {item.text && (
                  <p className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/80 mt-1 italic">
                    "{item.text}"
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onEdit(item)}
                  title="Edit Testimonial"
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  title="Hapus Testimonial"
                  className="p-2 hover:bg-rose-50 rounded-xl transition-colors text-rose-400 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PackagesContent = ({ items, onEdit, onDelete }: any) => {
  const getFallbackImage = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('diamond') || n.includes('royal') || n.includes('luxury')) {
      return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
    } else if (n.includes('platinum') || n.includes('gold')) {
      return 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: any) => {
          const bannerImg = getFirstImage(item.images, getFallbackImage(item.name));
          
          const featuresList = Array.isArray(item.features)
            ? item.features
            : (typeof item.features === 'string' ? item.features.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : []);

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
              {/* Card Banner */}
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={bannerImg}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                
                {/* Badges Top */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                    {item.highlighted ? "★ PILIHAN UTAMA" : "PAKET WEDDING"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow ${item.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {item.is_active !== false ? 'Aktif di Web' : 'Non-Aktif'}
                  </span>
                </div>

                {/* Subtitle Badge Bottom */}
                <div className="absolute bottom-2.5 left-3">
                  <span className="text-[11px] font-medium text-amber-300 backdrop-blur-md bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                    Vendor Terkoordinasi Penuh
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-lg text-slate-900 leading-tight mb-1.5 group-hover:text-amber-600 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description || item.longDescription || "Paket pernikahan all-in lengkap dengan fasilitas vendor eksklusif."}
                  </p>

                  {/* Price Block */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Investasi Pernikahan</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-slate-900">
                          Rp {Number(item.price || 0).toLocaleString('id-ID')}
                        </span>
                        {item.discount_price && Number(item.discount_price) > 0 && (
                          <span className="text-xs text-rose-500 line-through">
                            Rp {Number(item.discount_price).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-1 rounded-lg border">
                      All-In Package
                    </span>
                  </div>

                  {/* Feature Bullets Count */}
                  {featuresList.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
                        <span className="font-medium">{featuresList.length} Layanan Vendor & Fasilitas Termasuk</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-2 border-t border-slate-100">
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Edit size={14} />
                    <span>Edit Paket</span>
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all border border-rose-200"
                    title="Hapus Paket"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VenuesContent = ({ items, onEdit, onDelete }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item: any) => (
      <div key={item.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
        <div className="aspect-video bg-slate-50 relative overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="text-slate-300" size={40} />
            </div>
          )}
          {item.capacity && (
            <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-slate-700 shadow-sm">
              <Users size={10} className="inline mr-0.5" /> {item.capacity}
            </span>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
          {item.price && <p className="text-xs font-semibold text-amber-600 mt-1">{item.price}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onEdit(item)}
              className="flex-1 py-2 bg-slate-900 text-amber-400 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              <Edit size={13} /> Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="py-2 px-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors border border-rose-200/50"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const VideosContent = ({ items, onEdit, onDelete }: any) => (
  <div className="space-y-3">
    {items.map((item: any) => (
      <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Video size={18} className="text-violet-500" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h4>
              <p className="text-xs text-slate-400 truncate">{item.description}</p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="px-3 py-1.5 bg-slate-900 text-amber-400 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors border border-rose-200/50"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const StatsContent = ({ items, onEdit, onDelete }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item: any) => (
      <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</h4>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{Number(item.value) || 0}<span className="text-amber-500">+</span></p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(item)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 hover:bg-rose-50 rounded-xl transition-colors text-rose-400 hover:text-rose-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const WeddingShowContent = ({ items, onEdit, onDelete, onUpdate }: any) => {
  const [uploadingStates, setUploadingStates] = useState<{ [key: number]: boolean }>({});

  const handleUploadThumbnail = async (itemId: number, file: File) => {
    setUploadingStates(prev => ({ ...prev, [itemId]: true }));

    try {
      const uploadResponse = await uploadFile(file);
      if (uploadResponse.success) {
        const updateResponse = await apiRequest(`/wedding-show-videos/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ thumbnail: uploadResponse.data.path })
        });

        if (updateResponse.success) {
          alert('Thumbnail berhasil diupload!');
          if (onUpdate) {
            onUpdate(itemId, { thumbnail: uploadResponse.data.path });
          }
        } else {
          alert('Gagal menyimpan thumbnail ke database');
        }
      } else {
        alert('Gagal upload thumbnail file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload thumbnail');
    } finally {
      setUploadingStates(prev => ({ ...prev, [itemId]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: any) => (
        <div key={item.id} className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
          <div className="aspect-video bg-slate-50 relative overflow-hidden">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : item.videoPath ? (
              <video src={item.videoPath} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="text-slate-300" size={40} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-400 mb-2">Video ID: {item.id}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 py-2 bg-slate-900 text-amber-400 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
              >
                <Edit size={13} /> Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="py-2 px-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors border border-rose-200/50"
              >
                <Trash2 size={13} />
              </button>
              <label className={`flex-1 py-2 rounded-xl text-xs font-semibold cursor-pointer text-center flex items-center justify-center gap-1 transition-colors border ${uploadingStates[item.id]
                  ? 'bg-slate-50 text-slate-400 border-slate-200'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200/50 hover:bg-emerald-100'
                }`}>
                <Upload size={13} />
                {uploadingStates[item.id] ? 'Uploading...' : 'Thumbnail'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingStates[item.id]}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadThumbnail(item.id, file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};



// New Components for Umrah & Haji
const UmrahHajiAdminContent = ({
  umrahPackages,
  hajiPackages,
  bookings,
  filter,
  onFilterChange,
  onEditUmrah,
  onEditHaji,
  onDeleteUmrah,
  onDeleteHaji,
  onUpdateBookingStatus,
  onAddUmrah,
  onAddHaji
}: any) => {
  const [activeSubMenu, setActiveSubMenu] = useState<'umrah' | 'haji' | 'bookings'>('umrah');

  const filteredBookings = bookings.filter((booking: any) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const subMenuTabs = [
    { id: 'umrah', label: 'Paket Umrah', icon: <Plane size={16} /> },
    { id: 'haji', label: 'Paket Haji', icon: <Shield size={16} /> },
    { id: 'bookings', label: 'Booking', icon: <Calendar size={16} /> }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-5">
      {/* Sub-menu Tabs (Responsive Scrollable Track) */}
      <div className="w-full overflow-x-auto scrollbar-none py-1">
        <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl min-w-max">
          {subMenuTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubMenu(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${activeSubMenu === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSubMenu === 'umrah' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div>
              <h4 className="text-base font-bold text-slate-800">Daftar Paket Umrah ({umrahPackages.length})</h4>
              <p className="text-xs text-slate-500">Kelola paket perjalanan ibadah umrah reguler, plus, dan vip</p>
            </div>
            <button
              onClick={onAddUmrah}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Tambah Paket Umrah</span>
            </button>
          </div>

          {umrahPackages.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Plane className="mx-auto text-slate-300 mb-2" size={40} />
              <p className="text-slate-500 text-sm font-medium">Belum ada paket Umrah</p>
              <button
                onClick={onAddUmrah}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
              >
                + Tambah Paket Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {umrahPackages.map((pkg: any) => {
                const img = getFirstImage(pkg.images, 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80');
                const hasDiscount = pkg.discount_price && Number(pkg.discount_price) > 0 && Number(pkg.discount_price) < Number(pkg.price);

                return (
                  <div key={pkg.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative h-44 bg-slate-100 overflow-hidden group">
                      <img
                        src={img}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=600&q=80'; }}
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">
                          <Plane size={11} className="text-emerald-400" />
                          {pkg.airline || 'Saudi Airlines'}
                        </span>
                        <span className="px-2 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg">
                          {pkg.duration} Hari
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        {pkg.is_active ? (
                          <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h5 className="font-bold text-slate-800 text-base line-clamp-1">{pkg.name}</h5>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2.5">{pkg.description || 'Program ibadah umrah lengkap dan terpercaya.'}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Hotel Mekah:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[170px]">{pkg.hotel_mekah || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Jarak Haram:</span>
                            <span className="font-medium text-slate-700">{pkg.distance_haram || '150m'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Berangkat:</span>
                            <span className="font-medium text-slate-700">{pkg.departure_city || 'Jakarta'}</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="pt-1">
                          {hasDiscount ? (
                            <div>
                              <span className="text-xs text-slate-400 line-through mr-2">{formatPrice(pkg.price)}</span>
                              <span className="text-base font-extrabold text-emerald-700">{formatPrice(pkg.discount_price)}</span>
                            </div>
                          ) : (
                            <span className="text-base font-extrabold text-slate-900">{formatPrice(pkg.price)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex gap-1">
                          {pkg.featured && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-md border border-amber-200">Featured</span>
                          )}
                          {pkg.best_seller && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-semibold rounded-md border border-rose-200">Best Seller</span>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onEditUmrah(pkg)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Edit Paket"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteUmrah(pkg.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Hapus Paket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubMenu === 'haji' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <div>
              <h4 className="text-base font-bold text-slate-800">Daftar Paket Haji ({hajiPackages.length})</h4>
              <p className="text-xs text-slate-500">Kelola paket Haji Plus, Furoda Mujamalah, dan Khusus</p>
            </div>
            <button
              onClick={onAddHaji}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all self-start sm:self-auto whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Tambah Paket Haji</span>
            </button>
          </div>

          {hajiPackages.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Shield className="mx-auto text-slate-300 mb-2" size={40} />
              <p className="text-slate-500 text-sm font-medium">Belum ada paket Haji</p>
              <button
                onClick={onAddHaji}
                className="mt-3 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700"
              >
                + Tambah Paket Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {hajiPackages.map((pkg: any) => {
                const img = getFirstImage(pkg.images, 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80');
                const hasDiscount = pkg.discount_price && Number(pkg.discount_price) > 0 && Number(pkg.discount_price) < Number(pkg.price);
                const acc = pkg.accommodation_details || {};

                return (
                  <div key={pkg.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="relative h-44 bg-slate-100 overflow-hidden group">
                      <img
                        src={img}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80'; }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-1 bg-purple-900/80 backdrop-blur-md text-white text-[11px] font-bold rounded-lg">
                          {pkg.quota_year || '1446H'}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        {pkg.is_active ? (
                          <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                            Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h5 className="font-bold text-slate-800 text-base line-clamp-1 mb-1">{pkg.name}</h5>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2.5">{pkg.description || 'Paket ibadah haji langsung berangkat tanpa antre.'}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Hotel Mekah:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[170px]">{acc.mekah?.hotel || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Hotel Madinah:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[170px]">{acc.madinah?.hotel || '-'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Sisa Kuota:</span>
                            <span className="font-bold text-purple-700">{pkg.available_quota || 0} Seat</span>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="pt-1">
                          {hasDiscount ? (
                            <div>
                              <span className="text-xs text-slate-400 line-through mr-2">{formatPrice(pkg.price)}</span>
                              <span className="text-base font-extrabold text-purple-700">{formatPrice(pkg.discount_price)}</span>
                            </div>
                          ) : (
                            <span className="text-base font-extrabold text-slate-900">{formatPrice(pkg.price)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex gap-1">
                          {pkg.featured && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-md border border-amber-200">Featured</span>
                          )}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onEditHaji(pkg)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Edit Paket"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteHaji(pkg.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            title="Hapus Paket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubMenu === 'bookings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Booking Umrah & Haji</h4>
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                        <div className="text-sm text-gray-500">{booking.customer_email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{booking.package_name}</div>
                      <div className="text-sm text-gray-500">{booking.package_type}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={booking.status}
                        onChange={(e) => onUpdateBookingStatus(booking.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                          }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// New Components for Printing
const PrintingAdminContent = ({
  activeSubMenu,
  products,
  categories = [],
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  onSubMenuChange
}: any) => {
  // Render stars for rating
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategoryName = (catId: number) => {
    const found = (categories || []).find((c: any) => c.id === catId);
    if (found) return found.name;
    switch (catId) {
      case 1: return 'Undangan Pernikahan';
      case 2: return 'Sablon Kaos';
      case 3: return 'Banner & Spanduk';
      case 4: return 'ID Card';
      case 5: return 'Kartu Nama';
      case 6: return 'Brosur & Flyer';
      case 7: return 'Stiker & Label';
      case 8: return 'Kemasan Produk';
      case 9: return 'Merchandise';
      default: return 'Produk Percetakan';
    }
  };

  const getFallbackProductImage = (catId: number) => {
    switch (catId) {
      case 1: return 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80';
      case 2: return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';
      case 3: return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80';
      default: return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
    }
  };

  const formatSpec = (val: any) => {
    if (!val) return '-';
    if (Array.isArray(val)) return val.slice(0, 2).join(', ');
    if (typeof val === 'string') {
      const parts = val.split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
      return parts.slice(0, 2).join(', ') || '-';
    }
    return String(val);
  };

  // Filter products based on active sub-menu
  const filteredProducts = products.filter((product: any) => {
    if (activeSubMenu === 'all') {
      return true;
    } else if (activeSubMenu === 'undangan' || activeSubMenu === '1') {
      return product.category_id === 1;
    } else if (activeSubMenu === 'sablon-kaos' || activeSubMenu === '2') {
      return product.category_id === 2;
    } else if (activeSubMenu === 'banner' || activeSubMenu === '3') {
      return product.category_id === 3;
    } else if (activeSubMenu === 'id-card' || activeSubMenu === '4') {
      return product.category_id === 4;
    } else if (activeSubMenu === 'kartu-nama' || activeSubMenu === '5') {
      return product.category_id === 5;
    } else if (activeSubMenu === 'brosur-flyer' || activeSubMenu === '6') {
      return product.category_id === 6;
    } else if (activeSubMenu === 'stiker-label' || activeSubMenu === '7') {
      return product.category_id === 7;
    } else if (activeSubMenu === 'kemasan-produk' || activeSubMenu === '8') {
      return product.category_id === 8;
    } else if (activeSubMenu === 'merchandise' || activeSubMenu === '9') {
      return product.category_id === 9;
    }
    return true;
  });

  const subMenuTabs = [
    { id: 'all', label: 'Semua Produk', icon: <Printer size={16} /> },
    { id: 'undangan', label: 'Undangan Pernikahan', icon: <FileImage size={16} /> },
    { id: 'sablon-kaos', label: 'Sablon Kaos', icon: <Scissors size={16} /> },
    { id: 'banner', label: 'Banner & Spanduk', icon: <Layout size={16} /> },
    { id: 'id-card', label: 'ID Card', icon: <CreditCard size={16} /> },
    { id: 'kartu-nama', label: 'Kartu Nama', icon: <FileText size={16} /> },
    { id: 'brosur-flyer', label: 'Brosur & Flyer', icon: <FileText size={16} /> },
    { id: 'stiker-label', label: 'Stiker & Label', icon: <Tag size={16} /> },
    { id: 'kemasan-produk', label: 'Kemasan Produk', icon: <Package size={16} /> },
    { id: 'merchandise', label: 'Merchandise Lainnya', icon: <ShoppingBag size={16} /> }
  ];

  return (
    <div className="space-y-5">
      {/* Category Tabs (Responsive Scrollable Track) */}
      <div className="w-full overflow-x-auto scrollbar-none py-1">
        <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl min-w-max">
          {subMenuTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSubMenuChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeSubMenu === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Daftar Produk Percetakan ({filteredProducts.length})
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola katalog produk percetakan, spesifikasi, dan harga
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-amber-200/50 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Tambah Produk Cetak</span>
        </button>
      </div>

      {/* Card Grid Layout */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Printer className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 mb-1">
            Belum ada produk untuk kategori ini
          </h4>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Klik tombol "Tambah Produk Cetak" untuk menambahkan item baru ke dalam katalog.
          </p>
          <button
            onClick={onAddProduct}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-sm"
          >
            + Tambah Produk Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product: any) => {
            const img = getFirstImage(product.images, getFallbackProductImage(product.category_id));
            
            const hasDiscount = product.discount_price && Number(product.discount_price) > 0 && Number(product.discount_price) < Number(product.price);
            const categoryLabel = product.category_name || getCategoryName(product.category_id);

            return (
              <div
                key={product.id}
                className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col group"
              >
                {/* Thumbnail Banner */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) => { e.target.src = getFallbackProductImage(product.category_id); }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

                  {/* Top-Left Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[70%]">
                    <span className="px-2.5 py-1 bg-black/65 backdrop-blur-md text-white text-[10px] font-semibold rounded-lg flex items-center gap-1">
                      <Tag size={10} className="text-amber-400" />
                      <span className="truncate max-w-[120px]">{categoryLabel}</span>
                    </span>
                    <span className="px-2 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-lg shadow-sm">
                      Min. {product.min_order || 1} pcs
                    </span>
                  </div>

                  {/* Top-Right Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {product.is_featured && (
                      <span className="p-1 bg-amber-400 text-slate-950 rounded-md shadow" title="Produk Unggulan">
                        <Sparkles size={11} />
                      </span>
                    )}
                    {product.is_active !== false ? (
                      <span className="px-2 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md shadow">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-md shadow">
                        Nonaktif
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-800 text-base line-clamp-1 mb-1 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h5>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2.5">
                      {product.description || 'Produk percetakan premium dengan kualitas cetak tajam dan presisi.'}
                    </p>

                    {/* Specs Box */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Bahan:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[170px]">
                          {formatSpec(product.material_options)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Ukuran:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[170px]">
                          {formatSpec(product.size_options)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Estimasi:</span>
                        <span className="font-medium text-slate-700">
                          {product.estimated_time || '3-5 Hari Kerja'}
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="pt-1">
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-slate-400 line-through">
                            Rp {Number(product.price).toLocaleString('id-ID')}
                          </span>
                          <span className="text-base font-extrabold text-emerald-700">
                            Rp {Number(product.discount_price).toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">/ pcs</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-slate-900">
                            Rp {Number(product.price || 0).toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">/ pcs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex gap-2 border-t border-slate-100">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Edit size={14} />
                      <span>Edit Produk</span>
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id, 'printing', 'product')}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all border border-rose-200"
                      title="Hapus Produk"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Hero Images Settings Component
const HeroImagesSettings = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);

  // Get existing images from settings
  const heroImages = (() => {
    const savedImages = settings['hero-images'];
    if (savedImages) {
      try {
        return JSON.parse(savedImages);
      } catch (e) {
        return [];
      }
    }
    return [];
  })();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (heroImages.length >= 5) {
      alert('Maksimal 5 gambar!');
      return;
    }

    setSaving(true);
    try {
      const file = files[0];
      const uploadResponse = await uploadFile(file);

      if (uploadResponse.success) {
        const newImages = [...heroImages, uploadResponse.data.path];
        await updateSettings({ 'hero-images': JSON.stringify(newImages) });
        alert('Gambar berhasil ditambahkan!');
      } else {
        alert('Gagal upload gambar');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Terjadi kesalahan saat upload gambar');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (!confirm('Hapus gambar ini?')) return;

    const newImages = heroImages.filter((_: any, i: number) => i !== index);
    await updateSettings({ 'hero-images': JSON.stringify(newImages) });
    alert('Gambar berhasil dihapus!');
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-4">
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 disabled:opacity-50">
          <Upload size={16} />
          {saving ? 'Mengupload...' : 'Tambah Gambar'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={saving || heroImages.length >= 5}
            onChange={handleImageUpload}
          />
        </label>
        <span className="ml-2 text-sm text-gray-500">
          ({heroImages.length}/5 gambar)
        </span>
      </div>

      {/* Image Grid */}
      {heroImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {heroImages.map((image: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Hero ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                Gambar {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {heroImages.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Belum ada gambar hero</p>
          <p className="text-sm text-gray-400">Klik "Tambah Gambar" untuk upload</p>
        </div>
      )}
    </div>
  );
};

// Settings Content (Unchanged from your original code)
const AdminCredentialsManager = () => {
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const response = await fetch('/api/admin/credentials');
        const data = await response.json();
        if (data.success) {
          setCurrentUsername(data.data.username);
        }
      } catch (error) {
        console.error('Error loading credentials:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCredentials();
  }, []);

  const handleSaveCredentials = async () => {
    if (!newUsername || !newPassword) {
      setError('Username dan password baru harus diisi');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password konfirmasi tidak cocok');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Kredensial admin berhasil diperbarui!');
        setCurrentUsername(newUsername);
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Gagal memperbarui kredensial');
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      setError('Terjadi kesalahan saat memperbarui kredensial');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">Loading credentials...</div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold mb-4">🔐 Admin Credentials Management</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Current Username</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg bg-gray-50"
            value={currentUsername}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">New Username</label>
          <input
            type="text"
            placeholder="Enter new username"
            className="w-full p-3 border rounded-lg"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-3 border rounded-lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full p-3 border rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleSaveCredentials}
          disabled={saving}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Update Credentials'}
        </button>
      </div>
    </div>
  );
};

const SettingsContent = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold mb-6">Pengaturan</h3>
      <AdminCredentialsManager />
    </div>
  );
};
export default Admin;
