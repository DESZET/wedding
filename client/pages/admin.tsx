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
  const formData = new FormData();
  formData.append('image', file);
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

// ============ MAIN ADMIN COMPONENT ============
const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    description: string;
    highlighted: boolean;
    longDescription: string;
    features: string;
  }>({
    name: '',
    price: '',
    description: '',
    highlighted: false,
    longDescription: '',
    features: ''
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
            // Convert features from comma-separated string to array
            const packageData = {
              ...packageForm,
              features: packageForm.features ? packageForm.features.split(',').map((f: string) => f.trim()).filter((f: string) => f) : [],
              price: parseFloat(packageForm.price) || 0
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
            endpoint = '/printing/products';
            // Create a copy of the form data to avoid mutating state
            let formData = { ...printingProductForm };
            // Set category_id based on active sub-menu
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
                default: return 1;
              }
            };
            formData.category_id = getCategoryId(activePrintingSubMenu);
            // Validate required fields
            if (!formData.name || !formData.price || !formData.category_id) {
              alert('Nama produk, harga, dan kategori harus diisi!');
              return;
            }
            // Map form fields to database fields
            const productData = {
              category_id: formData.category_id,
              name: formData.name,
              description: formData.description || '',
              price: parseFloat(formData.price) || 0,
              discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
              size_options: formData.size_options || '',
              material_options: formData.material_options || '',
              color_options: formData.color_options || '',
              finishing_options: formData.finishing_options || '',
              design_template_url: '',
              images: formData.images || '',
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
            break;
          case 'umrah-haji':
            const pkgType = packageType || selectedItem?.type;
            if (pkgType === 'umrah') {
              endpoint = '/umrah-packages';
              // Helper function to convert newline/comma-separated string to array
              const stringToArray = (str: string) => {
                if (!str) return [];
                return str.split(/[\n,]/).map((item: string) => item.trim()).filter((item: string) => item);
              };
              // Helper function to parse JSON safely
              const parseJSON = (str: any) => {
                if (!str) return {};
                if (typeof str === 'object') return str;
                try {
                  return JSON.parse(str);
                } catch {
                  return {};
                }
              };

              // Convert string values to proper types for Umrah package
              const umrahData = {
                name: umrahPackageForm.name || '',
                description: umrahPackageForm.description || '',
                package_type: 'umrah',
                price: parseFloat(String(umrahPackageForm.price)) || 0,
                discount_price: umrahPackageForm.discount_price ? parseFloat(String(umrahPackageForm.discount_price)) : null,
                duration: parseInt(String(umrahPackageForm.duration)) || 9,
                departure_city: umrahPackageForm.departure_city || 'Jakarta',
                airline: umrahPackageForm.airline || '',
                airline_logo: umrahPackageForm.airline_logo || '',
                hotel_mekah: umrahPackageForm.hotel_mekah || '',
                hotel_madinah: umrahPackageForm.hotel_madinah || '',
                hotel_rating: parseInt(String(umrahPackageForm.hotel_rating)) || 4,
                distance_haram: umrahPackageForm.distance_haram || '',
                meals_included: Boolean(umrahPackageForm.meals_included),
                tour_guide: Boolean(umrahPackageForm.tour_guide),
                visa_assistance: Boolean(umrahPackageForm.visa_assistance),
                vaccination_assistance: Boolean(umrahPackageForm.vaccination_assistance),
                transport_type: umrahPackageForm.transport_type || '',
                group_size: parseInt(String(umrahPackageForm.group_size)) || 0,
                availability: parseInt(String(umrahPackageForm.availability)) || 0,
                rating: parseFloat(String(umrahPackageForm.rating)) || 0,
                reviews_count: parseInt(String(umrahPackageForm.reviews_count)) || 0,
                featured: Boolean(umrahPackageForm.featured),
                best_seller: Boolean(umrahPackageForm.best_seller),
                early_bird_discount: Boolean(umrahPackageForm.early_bird_discount),
                // JSON fields - convert from strings to arrays
                included_features: stringToArray(umrahPackageForm.included_features),
                excluded_features: stringToArray(umrahPackageForm.excluded_features),
                itinerary: stringToArray(umrahPackageForm.itinerary),
                important_notes: stringToArray(umrahPackageForm.important_notes),
                departure_dates: stringToArray(umrahPackageForm.departure_dates),
                images: stringToArray(umrahPackageForm.images),
                payment_plans: stringToArray(umrahPackageForm.payment_plans),
                tags: stringToArray(umrahPackageForm.tags),
                // Haji fields for umrah_packages table
                quota_year: umrahPackageForm.quota_year || '',
                payment_terms: stringToArray(umrahPackageForm.payment_terms),
                requirements: stringToArray(umrahPackageForm.requirements),
                timeline: stringToArray(umrahPackageForm.timeline),
                registration_deadline: umrahPackageForm.registration_deadline || '',
                available_quota: parseInt(String(umrahPackageForm.available_quota)) || 0,
                training_sessions: parseInt(String(umrahPackageForm.training_sessions)) || 0,
                medical_facility: Boolean(umrahPackageForm.medical_facility),
                accommodation_details: parseJSON(umrahPackageForm.accommodation_details)
              };
              response = await apiRequest(endpoint, {
                method: actionMode === 'add' ? 'POST' : 'PUT',
                body: JSON.stringify(umrahData)
              });
              if (response.success) {
                setUmrahPackages(prev => actionMode === 'add' ? [...prev, response.data] : prev.map(item => item.id === selectedItem?.id ? response.data : item));
              }
            } else if (pkgType === 'haji') {
              endpoint = '/haji-packages';
              // Helper function to convert newline/comma-separated string to array
              const stringToArray = (str: string) => {
                if (!str) return [];
                return str.split(/[\n,]/).map((item: string) => item.trim()).filter((item: string) => item);
              };

              // Convert string values to proper types for Haji package
              const hajiData = {
                name: hajiPackageForm.name || '',
                description: hajiPackageForm.description || '',
                quota_year: hajiPackageForm.quota_year || '',
                price: parseFloat(String(hajiPackageForm.price)) || 0,
                discount_price: hajiPackageForm.discount_price ? parseFloat(String(hajiPackageForm.discount_price)) : null,
                featured: Boolean(hajiPackageForm.featured),
                registration_deadline: hajiPackageForm.registration_deadline || '',
                available_quota: parseInt(String(hajiPackageForm.available_quota)) || 0,
                training_sessions: parseInt(String(hajiPackageForm.training_sessions)) || 0,
                medical_facility: Boolean(hajiPackageForm.medical_facility),
                rating: parseFloat(String(hajiPackageForm.rating)) || 0,
                reviews_count: parseInt(String(hajiPackageForm.reviews_count)) || 0,
                // JSON fields
                payment_terms: stringToArray(hajiPackageForm.payment_terms),
                included_features: stringToArray(hajiPackageForm.included_features),
                excluded_features: stringToArray(hajiPackageForm.excluded_features),
                requirements: stringToArray(hajiPackageForm.requirements),
                timeline: stringToArray(hajiPackageForm.timeline),
                images: stringToArray(hajiPackageForm.images),
                accommodation_details: {
                  mekah: {
                    hotel: hajiPackageForm.accommodation_mekah_hotel || '',
                    nights: hajiPackageForm.accommodation_mekah_nights || 20,
                    distance: hajiPackageForm.accommodation_mekah_distance || '500m'
                  },
                  madinah: {
                    hotel: hajiPackageForm.accommodation_madinah_hotel || '',
                    nights: hajiPackageForm.accommodation_madinah_nights || 10,
                    distance: hajiPackageForm.accommodation_madinah_distance || '300m'
                  },
                  jeddah: {
                    hotel: hajiPackageForm.accommodation_jeddah_hotel || '',
                    nights: hajiPackageForm.accommodation_jeddah_nights || 2
                  }
                }
              };
              response = await apiRequest(endpoint, {
                method: actionMode === 'add' ? 'POST' : 'PUT',
                body: JSON.stringify(hajiData)
              });
              if (response.success) {
                setHajiPackages(prev => actionMode === 'add' ? [...prev, response.data] : prev.map(item => item.id === selectedItem?.id ? response.data : item));
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
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(packageForm)
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
            endpoint = `/printing/products/${selectedItem.id}`;
            response = await apiRequest(endpoint, {
              method: 'PUT',
              body: JSON.stringify(printingProductForm)
            });
            if (response.success) {
              setPrintingProducts(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
          case 'umrah-haji':
            if (selectedItem?.type === 'umrah') {
              endpoint = `/umrah-packages/${selectedItem.id}`;
              const stringToArrayEdit = (str: string) => {
                if (!str) return [];
                return str.split(/[\n,]/).map((item: string) => item.trim()).filter((item: string) => item);
              };
              const parseJSONEdit = (str: any) => {
                if (!str) return {};
                if (typeof str === 'object') return str;
                try { return JSON.parse(str); } catch { return {}; }
              };
              const umrahEditData = {
                name: umrahPackageForm.name || '',
                description: umrahPackageForm.description || '',
                package_type: 'umrah',
                price: parseFloat(String(umrahPackageForm.price)) || 0,
                discount_price: umrahPackageForm.discount_price ? parseFloat(String(umrahPackageForm.discount_price)) : null,
                duration: parseInt(String(umrahPackageForm.duration)) || 9,
                departure_city: umrahPackageForm.departure_city || 'Jakarta',
                airline: umrahPackageForm.airline || '',
                airline_logo: umrahPackageForm.airline_logo || '',
                hotel_mekah: umrahPackageForm.hotel_mekah || '',
                hotel_madinah: umrahPackageForm.hotel_madinah || '',
                hotel_rating: umrahPackageForm.hotel_rating || '4 Star',
                distance_haram: umrahPackageForm.distance_haram || '',
                meals_included: Boolean(umrahPackageForm.meals_included),
                tour_guide: Boolean(umrahPackageForm.tour_guide),
                visa_assistance: Boolean(umrahPackageForm.visa_assistance),
                vaccination_assistance: Boolean(umrahPackageForm.vaccination_assistance),
                transport_type: umrahPackageForm.transport_type || '',
                group_size: parseInt(String(umrahPackageForm.group_size)) || 0,
                availability: parseInt(String(umrahPackageForm.availability)) || 0,
                rating: parseFloat(String(umrahPackageForm.rating)) || 0,
                reviews_count: parseInt(String(umrahPackageForm.reviews_count)) || 0,
                featured: Boolean(umrahPackageForm.featured),
                best_seller: Boolean(umrahPackageForm.best_seller),
                early_bird_discount: Boolean(umrahPackageForm.early_bird_discount),
                included_features: stringToArrayEdit(umrahPackageForm.included_features),
                excluded_features: stringToArrayEdit(umrahPackageForm.excluded_features),
                itinerary: stringToArrayEdit(umrahPackageForm.itinerary),
                important_notes: stringToArrayEdit(umrahPackageForm.important_notes),
                departure_dates: stringToArrayEdit(umrahPackageForm.departure_dates),
                images: stringToArrayEdit(umrahPackageForm.images),
                payment_plans: stringToArrayEdit(umrahPackageForm.payment_plans),
                tags: stringToArrayEdit(umrahPackageForm.tags),
                quota_year: umrahPackageForm.quota_year || '',
                payment_terms: stringToArrayEdit(umrahPackageForm.payment_terms),
                requirements: stringToArrayEdit(umrahPackageForm.requirements),
                timeline: stringToArrayEdit(umrahPackageForm.timeline),
                registration_deadline: umrahPackageForm.registration_deadline || '',
                available_quota: parseInt(String(umrahPackageForm.available_quota)) || 0,
                training_sessions: parseInt(String(umrahPackageForm.training_sessions)) || 0,
                medical_facility: Boolean(umrahPackageForm.medical_facility),
                accommodation_details: parseJSONEdit(umrahPackageForm.accommodation_details)
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
              const stringToArrayEdit = (str: string) => {
                if (!str) return [];
                return str.split(/[\n,]/).map((item: string) => item.trim()).filter((item: string) => item);
              };
              const hajiEditData = {
                name: hajiPackageForm.name || '',
                description: hajiPackageForm.description || '',
                quota_year: hajiPackageForm.quota_year || '',
                price: parseFloat(String(hajiPackageForm.price)) || 0,
                discount_price: hajiPackageForm.discount_price ? parseFloat(String(hajiPackageForm.discount_price)) : null,
                featured: Boolean(hajiPackageForm.featured),
                registration_deadline: hajiPackageForm.registration_deadline || '',
                available_quota: parseInt(String(hajiPackageForm.available_quota)) || 0,
                training_sessions: parseInt(String(hajiPackageForm.training_sessions)) || 0,
                medical_facility: Boolean(hajiPackageForm.medical_facility),
                rating: parseFloat(String(hajiPackageForm.rating)) || 0,
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
                    nights: hajiPackageForm.accommodation_mekah_nights || 20,
                    distance: hajiPackageForm.accommodation_mekah_distance || '500m'
                  },
                  madinah: {
                    hotel: hajiPackageForm.accommodation_madinah_hotel || '',
                    nights: hajiPackageForm.accommodation_madinah_nights || 10,
                    distance: hajiPackageForm.accommodation_madinah_distance || '300m'
                  },
                  jeddah: {
                    hotel: hajiPackageForm.accommodation_jeddah_hotel || '',
                    nights: hajiPackageForm.accommodation_jeddah_nights || 2
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
        setGalleryForm(item);
        break;
      case 'testimonials':
        setTestimonialForm(item);
        break;
      case 'packages':
        setPackageForm(item);
        break;
      case 'venues':
        setVenueForm(item);
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
            size_options: Array.isArray(item.size_options) ? item.size_options.join(', ') : item.size_options,
            material_options: Array.isArray(item.material_options) ? item.material_options.join(', ') : item.material_options,
            color_options: Array.isArray(item.color_options) ? item.color_options.join(', ') : item.color_options,
            finishing_options: Array.isArray(item.finishing_options) ? item.finishing_options.join(', ') : item.finishing_options,
            features: Array.isArray(item.features) ? item.features.join(', ') : item.features
          });
        }
        break;
      case 'umrah-haji':
        if (itemType === 'umrah') {
          setUmrahPackageForm({
            ...item,
            price: String(item.price || ''),
            discount_price: item.discount_price ? String(item.discount_price) : '',
            hotel_rating: item.hotel_rating ? String(item.hotel_rating) : '4 Star',
            included_features: Array.isArray(item.included_features) ? item.included_features.join('\n') : (item.included_features || ''),
            excluded_features: Array.isArray(item.excluded_features) ? item.excluded_features.join('\n') : (item.excluded_features || ''),
            departure_dates: Array.isArray(item.departure_dates) ? item.departure_dates.join(', ') : (item.departure_dates || ''),
            images: Array.isArray(item.images) ? item.images.join(', ') : (item.images || ''),
            payment_plans: Array.isArray(item.payment_plans) ? item.payment_plans.join('\n') : (item.payment_plans || ''),
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
            important_notes: Array.isArray(item.important_notes) ? item.important_notes.join('\n') : (item.important_notes || ''),
            itinerary: Array.isArray(item.itinerary) ? item.itinerary.join('\n') : (item.itinerary || ''),
          });
        } else if (itemType === 'haji') {
          const acc = item.accommodation_details || {};
          setHajiPackageForm({
            ...item,
            price: String(item.price || ''),
            discount_price: item.discount_price ? String(item.discount_price) : '',
            payment_terms: Array.isArray(item.payment_terms) ? item.payment_terms.join('\n') : (item.payment_terms || ''),
            included_features: Array.isArray(item.included_features) ? item.included_features.join('\n') : (item.included_features || ''),
            excluded_features: Array.isArray(item.excluded_features) ? item.excluded_features.join('\n') : (item.excluded_features || ''),
            requirements: Array.isArray(item.requirements) ? item.requirements.join('\n') : (item.requirements || ''),
            timeline: Array.isArray(item.timeline) ? item.timeline.join('\n') : (item.timeline || ''),
            images: Array.isArray(item.images) ? item.images.join(', ') : (item.images || ''),
            accommodation_mekah_hotel: acc.mekah?.hotel || '',
            accommodation_mekah_nights: acc.mekah?.nights || 20,
            accommodation_mekah_distance: acc.mekah?.distance || '500m',
            accommodation_madinah_hotel: acc.madinah?.hotel || '',
            accommodation_madinah_nights: acc.madinah?.nights || 10,
            accommodation_madinah_distance: acc.madinah?.distance || '300m',
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
    setPackageForm({ name: '', price: '', description: '', highlighted: false, longDescription: '', features: '' });
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
        return <DashboardContent />;
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
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Gambar</label>
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
                          setGalleryForm({ ...galleryForm, image: uploadResponse.data.path });
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
                {galleryForm.image && (
                  <div className="mt-2">
                    <img src={galleryForm.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
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
            <>
              <input
                type="text"
                placeholder="Nama Paket"
                className="w-full p-3 border rounded-lg"
                value={packageForm.name}
                onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Harga"
                className="w-full p-3 border rounded-lg"
                value={packageForm.price}
                onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
              />
              <textarea
                placeholder="Deskripsi Singkat"
                className="w-full p-3 border rounded-lg"
                rows={2}
                value={packageForm.description}
                onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
              />
              <textarea
                placeholder="Deskripsi Lengkap (akan ditampilkan di halaman paket)"
                className="w-full p-3 border rounded-lg"
                rows={4}
                value={packageForm.longDescription}
                onChange={(e) => setPackageForm({ ...packageForm, longDescription: e.target.value })}
              />
              <textarea
                placeholder="Fitur Paket (pisahkan dengan koma, contoh: Dekorasi, Catering, Souvenir, Foto/Video, MC & Entertainment)"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={packageForm.features}
                onChange={(e) => setPackageForm({ ...packageForm, features: e.target.value })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={packageForm.highlighted}
                  onChange={(e) => setPackageForm({ ...packageForm, highlighted: e.target.checked })}
                />
                <span>Ditampilkan sebagai pilihan utama (paket populer)</span>
              </label>
            </>
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
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Gambar Venue (opsional)</label>
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
                          setVenueForm({ ...venueForm, image: uploadResponse.data.path });
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
                {venueForm.image && (
                  <div className="mt-2">
                    <img src={venueForm.image} alt="Venue Preview" className="w-32 h-32 object-cover rounded" />
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



          {activeMenu === 'printing' && selectedItem?.type === 'product' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori Produk</label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={printingProductForm.category_id || ''}
                  onChange={(e) => setPrintingProductForm({ ...printingProductForm, category_id: parseInt(e.target.value) || null })}
                >
                  <option value="">Pilih Kategori</option>
                  {printingCategories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder={
                  activePrintingSubMenu === 'sablon-kaos' ? "Nama Produk Kaos (Contoh: Kaos Polos Premium)" :
                    activePrintingSubMenu === 'undangan' ? "Nama Undangan (Contoh: Undangan Pernikahan Premium)" :
                      "Nama Banner (Contoh: Banner Acara Custom)"
                }
                className="w-full p-3 border rounded-lg"
                value={printingProductForm.name}
                onChange={(e) => setPrintingProductForm({ ...printingProductForm, name: e.target.value })}
              />
              <textarea
                placeholder="Deskripsi Produk"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={printingProductForm.description}
                onChange={(e) => setPrintingProductForm({ ...printingProductForm, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Harga Normal</label>
                  <input
                    type="number"
                    placeholder="Harga"
                    className="w-full p-3 border rounded-lg"
                    value={printingProductForm.price}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga Diskon (opsional)</label>
                  <input
                    type="number"
                    placeholder="Harga Diskon"
                    className="w-full p-3 border rounded-lg"
                    value={printingProductForm.discount_price}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, discount_price: e.target.value })}
                  />
                </div>
              </div>

              {activePrintingSubMenu === 'sablon-kaos' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ukuran Kaos</label>
                      <select
                        multiple
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.size_options ? printingProductForm.size_options.split(', ') : []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setPrintingProductForm({ ...printingProductForm, size_options: selected.join(', ') });
                        }}
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="XXXL">XXXL</option>
                      </select>
                      <small className="text-gray-500">Tahan Ctrl untuk pilih multiple</small>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenis Kain</label>
                      <select
                        multiple
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.material_options ? printingProductForm.material_options.split(', ') : []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setPrintingProductForm({ ...printingProductForm, material_options: selected.join(', ') });
                        }}
                      >
                        <option value="Cotton Combed">Cotton Combed</option>
                        <option value="Cotton Carded">Cotton Carded</option>
                        <option value="Polyester">Polyester</option>
                        <option value="Mix Cotton">Mix Cotton</option>
                      </select>
                      <small className="text-gray-500">Tahan Ctrl untuk pilih multiple</small>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Metode Sablon</label>
                    <select
                      className="w-full p-3 border rounded-lg"
                      value={printingProductForm.finishing_options}
                      onChange={(e) => setPrintingProductForm({ ...printingProductForm, finishing_options: e.target.value })}
                    >
                      <option value="">Pilih Metode</option>
                      <option value="Screen Printing">Screen Printing</option>
                      <option value="DTG (Direct to Garment)">DTG (Direct to Garment)</option>
                      <option value="Heat Transfer">Heat Transfer</option>
                      <option value="Rubber Print">Rubber Print</option>
                    </select>
                  </div>
                </>
              )}

              {activePrintingSubMenu === 'undangan' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ukuran Undangan</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.size_options}
                        onChange={(e) => setPrintingProductForm({ ...printingProductForm, size_options: e.target.value })}
                      >
                        <option value="">Pilih Ukuran</option>
                        <option value="A5">A5 (14.8 x 21 cm)</option>
                        <option value="A4">A4 (21 x 29.7 cm)</option>
                        <option value="B5">B5 (17.6 x 25 cm)</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenis Kertas</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.material_options}
                        onChange={(e) => setPrintingProductForm({ ...printingProductForm, material_options: e.target.value })}
                      >
                        <option value="">Pilih Kertas</option>
                        <option value="Art Paper 100gsm">Art Paper 100gsm</option>
                        <option value="Art Paper 120gsm">Art Paper 120gsm</option>
                        <option value="Art Paper 150gsm">Art Paper 150gsm</option>
                        <option value="Ivory 100gsm">Ivory 100gsm</option>
                        <option value="Ivory 120gsm">Ivory 120gsm</option>
                        <option value="Duplex">Duplex</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Teknik Cetak</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.finishing_options}
                        onChange={(e) => setPrintingProductForm({ ...printingProductForm, finishing_options: e.target.value })}
                      >
                        <option value="">Pilih Teknik</option>
                        <option value="Offset">Offset</option>
                        <option value="Digital Printing">Digital Printing</option>
                        <option value="Screen Printing">Screen Printing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Isi per Pack</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.color_options}
                        onChange={(e) => setPrintingProductForm({ ...printingProductForm, color_options: e.target.value })}
                      >
                        <option value="">Pilih Isi</option>
                        <option value="25 lembar">25 lembar</option>
                        <option value="50 lembar">50 lembar</option>
                        <option value="100 lembar">100 lembar</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activePrintingSubMenu === 'banner' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Ukuran Banner (cm)</label>
                      <input
                        type="text"
                        placeholder="200 x 100"
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.size_options}
                        onChange={(e) => setPrintingProductForm({ ...printingProductForm, size_options: e.target.value })}
                      />
                      <small className="text-gray-500">Format: lebar x tinggi</small>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenis Bahan</label>
                      <select
                        className="w-full p-3 border rounded-lg"
                        value={printingProductForm.material_options}
                        onChange={(e) => setPrintingProductForm({ ...printingProductForm, material_options: e.target.value })}
                      >
                        <option value="">Pilih Bahan</option>
                        <option value="Vinyl">Vinyl</option>
                        <option value="Canvas">Canvas</option>
                        <option value="Flexy">Flexy</option>
                        <option value="Tarpaulin">Tarpaulin</option>
                        <option value="Backlit">Backlit</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Finishing</label>
                    <select
                      multiple
                      className="w-full p-3 border rounded-lg"
                      value={printingProductForm.finishing_options ? printingProductForm.finishing_options.split(', ') : []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setPrintingProductForm({ ...printingProductForm, finishing_options: selected.join(', ') });
                      }}
                    >
                      <option value="Eyelet">Eyelet</option>
                      <option value="Hemming">Hemming</option>
                      <option value="Rope">Rope</option>
                      <option value="Pole Pocket">Pole Pocket</option>
                      <option value="Fringe">Fringe</option>
                    </select>
                    <small className="text-gray-500">Tahan Ctrl untuk pilih multiple</small>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Minimal Order</label>
                  <input
                    type="number"
                    placeholder="Minimal Order"
                    className="w-full p-3 border rounded-lg"
                    value={printingProductForm.min_order}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, min_order: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estimasi Waktu</label>
                  <input
                    type="text"
                    placeholder="3-5 hari"
                    className="w-full p-3 border rounded-lg"
                    value={printingProductForm.estimated_time}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, estimated_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="4.5"
                    className="w-full p-3 border rounded-lg"
                    value={printingProductForm.rating}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, rating: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah Review</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full p-3 border rounded-lg"
                    value={printingProductForm.reviews_count}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, reviews_count: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <textarea
                placeholder="Fitur Produk (pisahkan dengan koma)"
                className="w-full p-3 border rounded-lg"
                rows={2}
                value={printingProductForm.features}
                onChange={(e) => setPrintingProductForm({ ...printingProductForm, features: e.target.value })}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Gambar Produk (opsional)</label>
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
                          setPrintingProductForm({ ...printingProductForm, images: uploadResponse.data.path });
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
                {printingProductForm.images && (
                  <div className="mt-2">
                    <img src={printingProductForm.images} alt="Product Preview" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={printingProductForm.is_featured}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, is_featured: e.target.checked })}
                  />
                  <span>Produk Unggulan</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={printingProductForm.is_new}
                    onChange={(e) => setPrintingProductForm({ ...printingProductForm, is_new: e.target.checked })}
                  />
                  <span>Produk Baru</span>
                </label>
              </div>
            </>
          )}

          {activeMenu === 'umrah-haji' && selectedItem?.type === 'umrah' && (
            <>
              <input
                type="text"
                placeholder="Nama Paket Umrah"
                className="w-full p-3 border rounded-lg"
                value={umrahPackageForm.name}
                onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, name: e.target.value })}
              />
              <textarea
                placeholder="Deskripsi Paket"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={umrahPackageForm.description}
                onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, description: e.target.value })}
              />

              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Gambar Paket</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="flex-1 p-3 border rounded-lg"
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
                <input
                  type="text"
                  placeholder="Atau masukkan URL gambar (pisahkan dengan koma)"
                  className="w-full p-3 border rounded-lg text-sm"
                  value={umrahPackageForm.images}
                  onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, images: e.target.value })}
                />
                {umrahPackageForm.images && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {umrahPackageForm.images.split(',').map((img, idx) => img.trim() && (
                      <div key={idx} className="relative">
                        <img src={img.trim()} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => {
                            const imgs = umrahPackageForm.images.split(',').map(s => s.trim()).filter((_, i) => i !== idx);
                            setUmrahPackageForm({ ...umrahPackageForm, images: imgs.join(', ') });
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Durasi (hari)</label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.duration}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga</label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.price}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kota Keberangkatan</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.departure_city}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, departure_city: e.target.value })}
                  >
                    <option value="Jakarta">Jakarta</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Medan">Medan</option>
                    <option value="Makassar">Makassar</option>
                    <option value="Bali">Bali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maskapai</label>
                  <input
                    type="text"
                    placeholder="Garuda Indonesia"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.airline}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, airline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hotel Mekah</label>
                  <input
                    type="text"
                    placeholder="Nama Hotel Mekah"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.hotel_mekah}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, hotel_mekah: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hotel Madinah</label>
                  <input
                    type="text"
                    placeholder="Nama Hotel Madinah"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.hotel_madinah}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, hotel_madinah: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating Hotel</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.hotel_rating}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, hotel_rating: e.target.value })}
                  >
                    <option value="3 Star">3 Star</option>
                    <option value="4 Star">4 Star</option>
                    <option value="5 Star">5 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jarak ke Haram</label>
                  <input
                    type="text"
                    placeholder="500m"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.distance_haram}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, distance_haram: e.target.value })}
                  />
                </div>
              </div>

              {/* New fields for Umrah */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe Transportasi</label>
                  <input
                    type="text"
                    placeholder="Private Bus"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.transport_type}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, transport_type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kapasitas Grup</label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.group_size}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, group_size: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kursi Tersedia</label>
                  <input
                    type="number"
                    placeholder="15"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.availability}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, availability: parseInt(e.target.value) || 15 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="4.5"
                    className="w-full p-3 border rounded-lg"
                    value={umrahPackageForm.rating}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, rating: parseFloat(e.target.value) || 4.5 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <textarea
                  placeholder="Fasilitas Termasuk (satu per baris)"
                  className="p-3 border rounded-lg"
                  rows={4}
                  value={umrahPackageForm.included_features}
                  onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, included_features: e.target.value })}
                />
                <textarea
                  placeholder="Fasilitas Tidak Termasuk (satu per baris)"
                  className="p-3 border rounded-lg"
                  rows={4}
                  value={umrahPackageForm.excluded_features}
                  onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, excluded_features: e.target.value })}
                />
              </div>

              <textarea
                placeholder="Rencana Pembayaran (satu per baris, contoh: Cash, Cicilan 3x, Cicilan 6x)"
                className="w-full p-3 border rounded-lg"
                rows={2}
                value={umrahPackageForm.payment_plans}
                onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, payment_plans: e.target.value })}
              />

              <input
                type="text"
                placeholder="Tags (pisahkan dengan koma, contoh: Premium, Direct Flight, Ramadhan)"
                className="w-full p-3 border rounded-lg"
                value={umrahPackageForm.tags}
                onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, tags: e.target.value })}
              />

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.meals_included}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, meals_included: e.target.checked })}
                  />
                  <span>Makanan Termasuk</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.tour_guide}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, tour_guide: e.target.checked })}
                  />
                  <span>Tour Guide</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.visa_assistance}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, visa_assistance: e.target.checked })}
                  />
                  <span>Visa Assistance</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.vaccination_assistance}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, vaccination_assistance: e.target.checked })}
                  />
                  <span>Vaccination Assistance</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="Tanggal Keberangkatan (pisahkan koma)"
                className="w-full p-3 border rounded-lg"
                value={umrahPackageForm.departure_dates}
                onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, departure_dates: e.target.value })}
              />
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.featured}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, featured: e.target.checked })}
                  />
                  <span>Paket Unggulan</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.best_seller}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, best_seller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.early_bird_discount}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, early_bird_discount: e.target.checked })}
                  />
                  <span>Early Bird Discount</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={umrahPackageForm.is_active}
                    onChange={(e) => setUmrahPackageForm({ ...umrahPackageForm, is_active: e.target.checked })}
                  />
                  <span>Aktif</span>
                </label>
              </div>
            </>
          )}

          {activeMenu === 'umrah-haji' && selectedItem?.type === 'haji' && (
            <>
              <input
                type="text"
                placeholder="Nama Paket Haji"
                className="w-full p-3 border rounded-lg"
                value={hajiPackageForm.name}
                onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, name: e.target.value })}
              />
              <textarea
                placeholder="Deskripsi Paket"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={hajiPackageForm.description}
                onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tahun Kuota</label>
                  <input
                    type="text"
                    placeholder="1445H/2024"
                    className="w-full p-3 border rounded-lg"
                    value={hajiPackageForm.quota_year}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, quota_year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga</label>
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg"
                    value={hajiPackageForm.price}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, price: e.target.value })}
                  />
                </div>
              </div>
              <textarea
                placeholder="Cara Pembayaran (satu per baris)"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={hajiPackageForm.payment_terms}
                onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, payment_terms: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <textarea
                  placeholder="Fasilitas Termasuk (satu per baris)"
                  className="p-3 border rounded-lg"
                  rows={4}
                  value={hajiPackageForm.included_features}
                  onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, included_features: e.target.value })}
                />
                <textarea
                  placeholder="Fasilitas Tidak Termasuk (satu per baris)"
                  className="p-3 border rounded-lg"
                  rows={4}
                  value={hajiPackageForm.excluded_features}
                  onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, excluded_features: e.target.value })}
                />
              </div>
              <textarea
                placeholder="Persyaratan (satu per baris)"
                className="w-full p-3 border rounded-lg"
                rows={4}
                value={hajiPackageForm.requirements}
                onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, requirements: e.target.value })}
              />

              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Gambar Paket</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="flex-1 p-3 border rounded-lg"
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
                <input
                  type="text"
                  placeholder="Atau masukkan URL gambar (pisahkan dengan koma)"
                  className="w-full p-3 border rounded-lg text-sm"
                  value={hajiPackageForm.images}
                  onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, images: e.target.value })}
                />
                {hajiPackageForm.images && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hajiPackageForm.images.split(',').map((img, idx) => img.trim() && (
                      <div key={idx} className="relative">
                        <img src={img.trim()} alt={`Preview ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => {
                            const imgs = hajiPackageForm.images.split(',').map(s => s.trim()).filter((_, i) => i !== idx);
                            setHajiPackageForm({ ...hajiPackageForm, images: imgs.join(', ') });
                          }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating and Reviews */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="4.5"
                    className="w-full p-3 border rounded-lg"
                    value={hajiPackageForm.rating}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, rating: parseFloat(e.target.value) || 4.5 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah Ulasan</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full p-3 border rounded-lg"
                    value={hajiPackageForm.reviews_count}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, reviews_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Registration Deadline and Quota */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Batas Registrasi</label>
                  <input
                    type="date"
                    className="w-full p-3 border rounded-lg"
                    value={hajiPackageForm.registration_deadline}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, registration_deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kuota Tersedia</label>
                  <input
                    type="number"
                    placeholder="25"
                    className="w-full p-3 border rounded-lg"
                    value={hajiPackageForm.available_quota}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, available_quota: parseInt(e.target.value) || 25 })}
                  />
                </div>
              </div>

              {/* Training Sessions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sesi Pelatihan</label>
                  <input
                    type="number"
                    placeholder="12"
                    className="w-full p-3 border rounded-lg"
                    value={hajiPackageForm.training_sessions}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, training_sessions: parseInt(e.target.value) || 12 })}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hajiPackageForm.medical_facility}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, medical_facility: e.target.checked })}
                    />
                    <span>Fasilitas Medis</span>
                  </label>
                </div>
              </div>

              {/* Accommodation Details */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold">Detail Akomodasi</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hotel Mekah</label>
                    <input
                      type="text"
                      placeholder="Nama Hotel Mekah"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_mekah_hotel}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_mekah_hotel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Malam Mekah</label>
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_mekah_nights}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_mekah_nights: parseInt(e.target.value) || 20 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jarak Mekah</label>
                    <input
                      type="text"
                      placeholder="500m"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_mekah_distance}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_mekah_distance: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hotel Madinah</label>
                    <input
                      type="text"
                      placeholder="Nama Hotel Madinah"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_madinah_hotel}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_madinah_hotel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Malam Madinah</label>
                    <input
                      type="number"
                      placeholder="10"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_madinah_nights}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_madinah_nights: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Jarak Madinah</label>
                    <input
                      type="text"
                      placeholder="300m"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_madinah_distance}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_madinah_distance: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Hotel Jeddah</label>
                    <input
                      type="text"
                      placeholder="Nama Hotel Jeddah"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_jeddah_hotel}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_jeddah_hotel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Malam Jeddah</label>
                    <input
                      type="number"
                      placeholder="2"
                      className="w-full p-3 border rounded-lg"
                      value={hajiPackageForm.accommodation_jeddah_nights}
                      onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, accommodation_jeddah_nights: parseInt(e.target.value) || 2 })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hajiPackageForm.featured}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, featured: e.target.checked })}
                  />
                  <span>Paket Unggulan</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hajiPackageForm.is_active}
                    onChange={(e) => setHajiPackageForm({ ...hajiPackageForm, is_active: e.target.checked })}
                  />
                  <span>Aktif</span>
                </label>
              </div>
            </>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Galeria Wedding Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Eye size={20} />
            </button>
            <button
              onClick={() => window.open('/', '_blank')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Preview Site
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          bg-white border-r min-h-screen transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}
        `}>
          <div className="p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id as MenuItem);
                    setActionMode('view');
                    resetForms();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    ${activeMenu === item.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{getMenuLabel(activeMenu)}</h2>
                <p className="text-gray-500">
                  {actionMode === 'view'
                    ? `Kelola data ${getMenuLabel(activeMenu).toLowerCase()}`
                    : actionMode === 'add' ? 'Tambah data baru' : 'Edit data'
                  }
                </p>
              </div>

              {actionMode === 'view' && activeMenu !== 'dashboard' && activeMenu !== 'settings' && activeMenu !== 'appearance' && (
                <div className="flex gap-2">
                  {activeMenu === 'printing' && (
                    <button
                      onClick={() => {
                        // Get the button label based on current activePrintingSubMenu
                        const getCategoryLabel = () => {
                          switch (activePrintingSubMenu) {
                            case 'undangan': return 'Undangan';
                            case 'sablon-kaos': return 'Sablon Kaos';
                            case 'banner': return 'Banner';
                            case 'id-card': return 'ID Card';
                            case 'kartu-nama': return 'Kartu Nama';
                            case 'brosur-flyer': return 'Brosur & Flyer';
                            case 'stiker-label': return 'Stiker & Label';
                            case 'kemasan-produk': return 'Kemasan Produk';
                            case 'merchandise': return 'Merchandise';
                            default: return 'Produk';
                          }
                        };

                        setSelectedItem({ type: 'product' });
                        setActionMode('add');

                        // Set default form values based on active sub-menu
                        const getDefaultFormValues = () => {
                          switch (activePrintingSubMenu) {
                            case 'undangan':
                              return {
                                name: 'Undangan Pernikahan Premium',
                                description: 'Undangan pernikahan dengan desain elegan dan bahan berkualitas',
                                price: '15000',
                                discount_price: '',
                                size_options: 'A5,A6',
                                material_options: 'Art Paper 260gsm',
                                color_options: 'Full Color',
                                finishing_options: 'Offset',
                                images: '',
                                estimated_time: '3-5 hari',
                                min_order: 25,
                                features: 'Desain custom, bahan premium, finishing gold foil',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 1
                              };
                            case 'sablon-kaos':
                              return {
                                name: 'Kaos Custom Premium',
                                description: 'Kaos dengan sablon custom untuk event dan merchandise',
                                price: '45000',
                                discount_price: '',
                                size_options: 'S,M,L,XL',
                                material_options: 'Cotton Combed 30s',
                                color_options: 'Full Color',
                                finishing_options: 'Screen Printing',
                                images: '',
                                estimated_time: '7-10 hari',
                                min_order: 10,
                                features: 'Bahan cotton combed, sablon berkualitas, berbagai ukuran',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 2
                              };
                            case 'banner':
                              return {
                                name: 'Banner Acara Custom',
                                description: 'Banner untuk acara dengan bahan vinyl outdoor tahan cuaca',
                                price: '75000',
                                discount_price: '',
                                size_options: '200x100cm',
                                material_options: 'Vinyl Outdoor',
                                color_options: 'Full Color',
                                finishing_options: 'Eyelet,Hemming',
                                images: '',
                                estimated_time: '2-3 hari',
                                min_order: 1,
                                features: 'Bahan tahan cuaca, eyelet, hemning, full color printing',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 3
                              };
                            case 'id-card':
                              return {
                                name: 'ID Card Custom',
                                description: 'ID Card untuk karyawan, event, atau organisasi dengan desain custom',
                                price: '5000',
                                discount_price: '',
                                size_options: 'Standard (85.6 x 54 mm)',
                                material_options: 'PVC Premium',
                                color_options: 'Full Color',
                                finishing_options: 'Laminasi Glossy',
                                images: '',
                                estimated_time: '3-5 hari',
                                min_order: 50,
                                features: 'Cetak full color, hologram security, tali lanyard included',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 4
                              };
                            case 'kartu-nama':
                              return {
                                name: 'Kartu Nama Premium',
                                description: 'Kartu nama dengan desain profesional dan bahan berkualitas',
                                price: '35000',
                                discount_price: '',
                                size_options: 'Standard (9 x 5.5 cm)',
                                material_options: 'Art Paper 350gsm',
                                color_options: 'Full Color',
                                finishing_options: 'Spot UV',
                                images: '',
                                estimated_time: '3-5 hari',
                                min_order: 100,
                                features: 'Desain custom, finishing premium, packaging included',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 5
                              };
                            case 'brosur-flyer':
                              return {
                                name: 'Brosur/Flyer Promosi',
                                description: 'Brosur atau flyer untuk promosi produk, event, atau bisnis',
                                price: '500',
                                discount_price: '',
                                size_options: 'A4',
                                material_options: 'Art Paper 150gsm',
                                color_options: 'Full Color (CMYK)',
                                finishing_options: 'Fold',
                                images: '',
                                estimated_time: '2-3 hari',
                                min_order: 100,
                                features: 'Cetak berkualitas tinggi, berbagai finishing',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 6
                              };
                            case 'stiker-label':
                              return {
                                name: 'Stiker Custom',
                                description: 'Stiker dengan desain custom untuk produk, packaging, atau promosi',
                                price: '2000',
                                discount_price: '',
                                size_options: 'Various (Custom)',
                                material_options: 'Vinyl Glossy',
                                color_options: 'Full Color',
                                finishing_options: 'Die Cut',
                                images: '',
                                estimated_time: '3-5 hari',
                                min_order: 100,
                                features: 'Tahan air, durable, berbagai bentuk',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 7
                              };
                            case 'kemasan-produk':
                              return {
                                name: 'Kemasan Produk Custom',
                                description: 'Kemasan produk custom untuk bisnis atau brand Anda',
                                price: '5000',
                                discount_price: '',
                                size_options: 'Custom',
                                material_options: 'Karton Premium',
                                color_options: 'Full Color',
                                finishing_options: 'Spot UV, Emboss',
                                images: '',
                                estimated_time: '7-14 hari',
                                min_order: 500,
                                features: 'Desain custom, finishing premium, berbagai ukuran',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 8
                              };
                            case 'merchandise':
                              return {
                                name: 'Merchandise Custom',
                                description: 'Merchandise custom seperti mug, topi, atau giveaway',
                                price: '25000',
                                discount_price: '',
                                size_options: 'Standard',
                                material_options: 'Ceramic/Polyester',
                                color_options: 'Full Color',
                                finishing_options: 'Sublimation',
                                images: '',
                                estimated_time: '7-14 hari',
                                min_order: 50,
                                features: 'Bahan berkualitas, tahan lama, berbagai produk',
                                rating: 4.5,
                                reviews_count: 0,
                                is_featured: false,
                                is_new: false,
                                category_id: 9
                              };
                            default:
                              return {
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
                                category_id: null
                              };
                          }
                        };

                        setPrintingProductForm(getDefaultFormValues());
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      <Plus size={20} />
                      Tambah {activePrintingSubMenu === 'all' ? 'Produk' :
                        activePrintingSubMenu === 'undangan' ? 'Undangan' :
                          activePrintingSubMenu === 'sablon-kaos' ? 'Sablon' :
                            activePrintingSubMenu === 'banner' ? 'Banner' :
                              activePrintingSubMenu === 'id-card' ? 'ID Card' :
                                activePrintingSubMenu === 'kartu-nama' ? 'Kartu Nama' :
                                  activePrintingSubMenu === 'brosur-flyer' ? 'Brosur' :
                                    activePrintingSubMenu === 'stiker-label' ? 'Stiker' :
                                      activePrintingSubMenu === 'kemasan-produk' ? 'Kemasan' :
                                        activePrintingSubMenu === 'merchandise' ? 'Merchandise' : 'Produk'}
                    </button>
                  )}
                  {activeMenu === 'umrah-haji' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedItem({ type: 'umrah' });
                          setActionMode('add');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus size={20} />
                        Tambah Paket Umrah
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem({ type: 'haji' });
                          setActionMode('add');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus size={20} />
                        Tambah Paket Haji
                      </button>
                    </>
                  )}
                  {!['printing', 'umrah-haji'].includes(activeMenu) && (
                    <button
                      onClick={() => setActionMode('add')}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      <Plus size={20} />
                      Tambah Baru
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            {renderContent()}

            {/* Stats Overview */}
            {activeMenu === 'dashboard' && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-xs text-gray-500 mb-1">Gallery</h4>
                  <p className="text-2xl font-bold">{galleryItems.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-xs text-gray-500 mb-1">Testimonials</h4>
                  <p className="text-2xl font-bold">{testimonials.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-xs text-gray-500 mb-1">Packages</h4>
                  <p className="text-2xl font-bold">{packages.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-xs text-gray-500 mb-1">Venues</h4>
                  <p className="text-2xl font-bold">{venues.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="text-xs text-gray-500 mb-1">Printing</h4>
                  <p className="text-2xl font-bold">{printingProducts.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                  <h4 className="text-xs text-gray-500 mb-1">Paket Umrah</h4>
                  <p className="text-2xl font-bold text-green-600">{umrahPackages.length}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500">
                  <h4 className="text-xs text-gray-500 mb-1">Paket Haji</h4>
                  <p className="text-2xl font-bold text-purple-600">{hajiPackages.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component untuk masing-masing konten
const DashboardContent = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h3 className="text-lg font-bold mb-4">Selamat Datang di Admin Panel</h3>
    <p className="text-gray-600 mb-4">
      Gunakan panel ini untuk mengelola semua konten website Galeria Wedding.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Upload gambar dengan ukuran optimal untuk performa terbaik</li>
          <li>• Perbarui testimonial secara berkala</li>
          <li>• Cek semua tautan video sebelum dipublikasi</li>
          <li>• Update status order percetakan secara berkala</li>
          <li>• Periksa ketersediaan paket umrah & haji</li>
        </ul>
      </div>
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-2">📊 Aktivitas Terbaru</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Testimonial baru ditambahkan (1 jam yang lalu)</p>
          <p>• Gallery diupdate (2 hari yang lalu)</p>
          <p>• Package harga diperbarui (3 hari yang lalu)</p>
          <p>• Order percetakan baru (5 menit yang lalu)</p>
          <p>• Booking umrah dikonfirmasi (1 jam yang lalu)</p>
        </div>
      </div>
    </div>
  </div>
);

const GalleryContent = ({ items, onEdit, onDelete }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: any) => (
        <div key={item.id} className="border rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <Image className="text-gray-400" size={40} />
            )}
          </div>
          <div className="p-4">
            <h4 className="font-semibold">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.category}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <Edit size={16} className="inline mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex-1 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                <Trash2 size={16} className="inline mr-1" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TestimonialsContent = ({ items, onEdit, onDelete }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="space-y-4">
      {items.map((item: any) => (
        <div key={item.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">{item.name}</h4>
              <p className="text-sm text-gray-500">{item.date}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 hover:bg-red-100 rounded text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PackagesContent = ({ items, onEdit, onDelete }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="space-y-4">
      {items.map((item: any) => (
        <div key={item.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{item.name}</h4>
              <p className="text-gray-600">Rp {item.price.toLocaleString()}</p>
              {item.highlighted && (
                <span className="inline-block px-2 py-1 mt-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                  ★ Pilihan Utama
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const VenuesContent = ({ items, onEdit, onDelete }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item: any) => (
        <div key={item.id} className="border rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <MapPin className="text-gray-400" size={40} />
            )}
          </div>
          <div className="p-4">
            <h4 className="font-semibold">{item.title}</h4>
            <p className="text-sm text-gray-500">{item.category}</p>
            <p className="text-gray-600">{item.price}</p>
            {item.capacity && (
              <p className="text-sm text-gray-500">Kapasitas: {item.capacity}</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit(item)}
                className="flex-1 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <Edit size={16} className="inline mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex-1 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                <Trash2 size={16} className="inline mr-1" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const VideosContent = ({ items, onEdit, onDelete }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="space-y-4">
      {items.map((item: any) => (
        <div key={item.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatsContent = ({ items, onEdit, onDelete }: any) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="space-y-4">
      {items.map((item: any) => (
        <div key={item.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{item.label}</h4>
              <p className="text-2xl font-bold text-primary">{Number(item.value) || 0}+</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(item)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: any) => (
          <div key={item.id} className="border rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
              ) : item.videoPath ? (
                <video src={item.videoPath} className="w-full h-full object-cover" />
              ) : (
                <Video className="text-gray-400" size={40} />
              )}
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-500">Video ID: {item.id}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onEdit(item)}
                  className="flex-1 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  <Edit size={16} className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex-1 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  Hapus
                </button>
                <label className={`flex-1 py-2 rounded hover:bg-green-200 cursor-pointer text-center ${uploadingStates[item.id]
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-green-100 text-green-700'
                  }`}>
                  <Upload size={16} className="inline mr-1" />
                  {uploadingStates[item.id] ? 'Uploading...' : 'Upload Thumbnail'}
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Kelola Umrah & Haji</h3>
        <p className="text-gray-600">Kelola paket umrah, haji, dan booking pelanggan</p>
      </div>

      {/* Sub-menu Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {subMenuTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubMenu(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${activeSubMenu === tab.id
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-primary'
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubMenu === 'umrah' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Paket Umrah</h4>
            <button
              onClick={onAddUmrah}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={16} />
              Tambah Paket Umrah
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {umrahPackages.map((pkg: any) => (
              <div key={pkg.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold">{pkg.name}</h5>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditUmrah(pkg)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteUmrah(pkg.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                <div className="text-sm">
                  <p><strong>Harga:</strong> {formatPrice(pkg.price)}</p>
                  <p><strong>Durasi:</strong> {pkg.duration} hari</p>
                  <p><strong>Keberangkatan:</strong> {pkg.departure_city}</p>
                </div>
                <div className="mt-2 flex gap-1">
                  {pkg.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Featured</span>
                  )}
                  {pkg.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Aktif</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Nonaktif</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubMenu === 'haji' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Paket Haji</h4>
            <button
              onClick={onAddHaji}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus size={16} />
              Tambah Paket Haji
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hajiPackages.map((pkg: any) => (
              <div key={pkg.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold">{pkg.name}</h5>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditHaji(pkg)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteHaji(pkg.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                <div className="text-sm">
                  <p><strong>Harga:</strong> {formatPrice(pkg.price)}</p>
                  <p><strong>Kuota:</strong> {pkg.quota_year}</p>
                </div>
                <div className="mt-2 flex gap-1">
                  {pkg.featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Featured</span>
                  )}
                  {pkg.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Aktif</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Nonaktif</span>
                  )}
                </div>
              </div>
            ))}
          </div>
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

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
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
    return true; // Show all if no specific category
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">Kelola Produk Printing</h3>
        <p className="text-gray-600">Produk yang ditampilkan di halaman printing client</p>
      </div>

      {/* Sub-menu Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {subMenuTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSubMenuChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${activeSubMenu === tab.id
                ? 'text-primary border-primary'
                : 'text-gray-600 border-transparent hover:text-primary'
              }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product: any) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {product.images && product.images.length > 0 ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.images[0]}
                          alt={product.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Printer className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {product.name}
                        {product.is_featured && (
                          <Sparkles size={14} className="text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                        {product.description}
                      </div>
                      {product.discount_price && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Diskon {Math.round((1 - product.discount_price / product.price) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    {product.discount_price ? (
                      <>
                        <div className="text-sm font-medium text-red-600">
                          {formatPrice(product.discount_price)}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      per {product.min_order} pcs
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{product.min_order} pcs</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {product.estimated_time}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    {product.is_featured && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {renderStars(product.rating || 4.5)}
                  <div className="text-xs text-gray-500 mt-1">
                    {product.reviews_count || 0} reviews
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                      title="Edit Produk"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id, 'printing', 'product')}
                      className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                      title="Hapus Produk"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Printer className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            Belum ada produk {activeSubMenu === 'all' ? 'percetakan' : activeSubMenu === 'sablon-kaos' ? 'sablon kaos' : activeSubMenu === 'undangan' ? 'undangan' : 'banner'}
          </h3>
          <p className="text-gray-500 mb-6">
            Klik "Tambah Produk" untuk menambah produk baru{activeSubMenu === 'all' ? '' : ` kategori ${activeSubMenu === 'sablon-kaos' ? 'sablon kaos' : activeSubMenu === 'undangan' ? 'undangan' : 'banner'}`}.
          </p>
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
