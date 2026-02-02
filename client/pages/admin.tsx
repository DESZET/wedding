import { useState, useEffect } from "react";
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
  Eye
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

// API functions
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

type MenuItem = 'dashboard' | 'gallery' | 'testimonials' | 'packages' | 'venues' | 'videos' | 'wedding-show' | 'stats' | 'settings';
type ActionMode = 'view' | 'add' | 'edit';

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItem>('dashboard');
  const [actionMode, setActionMode] = useState<ActionMode>('view');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Data states
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [weddingShowVideos, setWeddingShowVideos] = useState<VideoItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  // Form states
  const [galleryForm, setGalleryForm] = useState<CreateGalleryItem>({ title: '', category: '', image: '' });
  const [testimonialForm, setTestimonialForm] = useState<CreateTestimonialItem>({ name: '', rating: 5, text: '', date: '' });
  const [packageForm, setPackageForm] = useState<{ name: string; price: string; description: string; highlighted: boolean }>({ name: '', price: '', description: '', highlighted: false });
  const [venueForm, setVenueForm] = useState<CreateVenueItem>({ title: '', category: '', price: '', capacity: '', description: '', image: '' });
  const [venueImagePreview, setVenueImagePreview] = useState<string>('');
  const [videoForm, setVideoForm] = useState<CreateVideoItem>({ title: '', description: '', videoPath: '', thumbnail: '' });
  const [statsForm, setStatsForm] = useState<{ label: string; value: string; image: string }>({ label: '', value: '', image: '' });
  const [statsFormImage, setStatsFormImage] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [galleryRes, testimonialsRes, packagesRes, venuesRes, videosRes, weddingShowRes, statsRes] = await Promise.all([
          apiRequest('/gallery'),
          apiRequest('/testimonials'),
          apiRequest('/packages'),
          apiRequest('/venues'),
          apiRequest('/videos'),
          apiRequest('/wedding-show-videos'),
          apiRequest('/stats')
        ]);
        if (galleryRes.success) setGalleryItems(galleryRes.data);
        if (testimonialsRes.success) setTestimonials(testimonialsRes.data);
        if (packagesRes.success) setPackages(packagesRes.data);
        if (venuesRes.success) setVenues(venuesRes.data);
        if (videosRes.success) setVideos(videosRes.data);
        if (weddingShowRes.success) setWeddingShowVideos(weddingShowRes.data);
        if (statsRes.success) setStats(statsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!selectedItem && actionMode === 'edit') return;

    setIsLoading(true);
    try {
      let response: any;
      const endpoint = `/${activeMenu}`;

      if (actionMode === 'add') {
        switch(activeMenu) {
          case 'gallery':
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(galleryForm)
            });
            if (response.success) {
              setGalleryItems(prev => [...prev, response.data]);
            }
            break;
          case 'testimonials':
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(testimonialForm)
            });
            if (response.success) {
              setTestimonials(prev => [...prev, response.data]);
            }
            break;
          case 'packages':
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(packageForm)
            });
            if (response.success) {
              setPackages(prev => [...prev, response.data]);
            }
            break;
          case 'venues':
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(venueForm)
            });
            if (response.success) {
              setVenues(prev => [...prev, response.data]);
            }
            break;
          case 'videos':
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(videoForm)
            });
            if (response.success) {
              setVideos(prev => [...prev, response.data]);
            }
            break;
          case 'stats':
            response = await apiRequest(endpoint, {
              method: 'POST',
              body: JSON.stringify(statsForm)
            });
            if (response.success) {
              setStats(prev => [...prev, response.data]);
            }
            break;
        }
      } else if (actionMode === 'edit') {
        switch(activeMenu) {
          case 'gallery':
            response = await apiRequest(`${endpoint}/${selectedItem.id}`, {
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
            response = await apiRequest(`${endpoint}/${selectedItem.id}`, {
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
            response = await apiRequest(`${endpoint}/${selectedItem.id}`, {
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
            response = await apiRequest(`${endpoint}/${selectedItem.id}`, {
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
            response = await apiRequest(`${endpoint}/${selectedItem.id}`, {
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
            response = await apiRequest(`${endpoint}/${selectedItem.id}`, {
              method: 'PUT',
              body: JSON.stringify(statsForm)
            });
            if (response.success) {
              setStats(prev => prev.map(item =>
                item.id === selectedItem.id ? response.data : item
              ));
            }
            break;
        }
      }

      if (response?.success) {
        alert('Data berhasil disimpan!');
        setActionMode('view');
        resetForms();
      } else {
        alert('Gagal menyimpan data: ' + (response?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any, type: MenuItem) => {
    setSelectedItem(item);
    setActionMode('edit');

    switch(type) {
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
        setStatsForm(item);
        break;
    }
  };

  const handleDelete = async (id: number, type: MenuItem) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;

    setIsLoading(true);
    try {
      const response = await apiRequest(`/${type === 'wedding-show' ? 'wedding-show-videos' : type}/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        switch(type) {
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

  const resetForms = () => {
    setGalleryForm({ title: '', category: '', image: '' });
    setTestimonialForm({ name: '', rating: 5, text: '', date: '' });
    setPackageForm({ name: '', price: '', description: '', highlighted: false });
    setVenueForm({ title: '', category: '', price: '', capacity: '', description: '', image: '' });
    setVideoForm({ title: '', description: '', videoPath: '', thumbnail: '' });
    setStatsForm({ label: '', value: '' });
    setSelectedItem(null);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'gallery', label: 'Gallery', icon: <Image size={20} /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare size={20} /> },
    { id: 'packages', label: 'Packages', icon: <Package size={20} /> },
    { id: 'venues', label: 'Venues', icon: <MapPin size={20} /> },
    { id: 'videos', label: 'Videos', icon: <Video size={20} /> },
    { id: 'wedding-show', label: 'Wedding Show', icon: <Video size={20} /> },
    { id: 'stats', label: 'Statistics', icon: <Users size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    if (actionMode === 'add' || actionMode === 'edit') {
      return renderForm();
    }

    switch(activeMenu) {
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
      case 'stats':
        return <StatsContent
          items={stats}
          onEdit={(item) => handleEdit(item, 'stats')}
          onDelete={(id) => handleDelete(item, 'stats')}
        />;
      case 'settings':
        return <SettingsContent />;
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
                onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
              />
              <input
                type="text"
                placeholder="Kategori"
                className="w-full p-3 border rounded-lg"
                value={galleryForm.category}
                onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})}
              />
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
                          setGalleryForm({...galleryForm, image: uploadResponse.data.path});
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
                onChange={(e) => setTestimonialForm({...testimonialForm, name: e.target.value})}
              />
              <textarea
                placeholder="Testimoni"
                className="w-full p-3 border rounded-lg"
                rows={4}
                value={testimonialForm.text}
                onChange={(e) => setTestimonialForm({...testimonialForm, text: e.target.value})}
              />
              <input
                type="number"
                placeholder="Rating (1-5)"
                min="1"
                max="5"
                className="w-full p-3 border rounded-lg"
                value={testimonialForm.rating}
                onChange={(e) => setTestimonialForm({...testimonialForm, rating: Number(e.target.value) || 5})}
              />
              <input
                type="date"
                className="w-full p-3 border rounded-lg"
                value={testimonialForm.date}
                onChange={(e) => setTestimonialForm({...testimonialForm, date: e.target.value})}
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
                onChange={(e) => setPackageForm({...packageForm, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Harga"
                className="w-full p-3 border rounded-lg"
                value={packageForm.price}
                onChange={(e) => setPackageForm({...packageForm, price: e.target.value})}
              />
              <textarea
                placeholder="Deskripsi"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={packageForm.description}
                onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={packageForm.highlighted}
                  onChange={(e) => setPackageForm({...packageForm, highlighted: e.target.checked})}
                />
                <span>Ditampilkan sebagai pilihan utama</span>
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
                onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
              />
              <textarea
                placeholder="Deskripsi Video"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={videoForm.description}
                onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
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
                          setVideoForm({...videoForm, videoPath: uploadResponse.data.path});
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
                          setVideoForm({...videoForm, thumbnail: uploadResponse.data.path});
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
                onChange={(e) => setVenueForm({...venueForm, title: e.target.value})}
              />
              <input
                type="text"
                placeholder="Kategori"
                className="w-full p-3 border rounded-lg"
                value={venueForm.category}
                onChange={(e) => setVenueForm({...venueForm, category: e.target.value})}
              />
              <input
                type="text"
                placeholder="Harga"
                className="w-full p-3 border rounded-lg"
                value={venueForm.price}
                onChange={(e) => setVenueForm({...venueForm, price: e.target.value})}
              />
              <input
                type="number"
                placeholder="Kapasitas"
                className="w-full p-3 border rounded-lg"
                value={venueForm.capacity}
                onChange={(e) => setVenueForm({...venueForm, capacity: e.target.value ? Number(e.target.value) : undefined})}
              />
              <textarea
                placeholder="Deskripsi"
                className="w-full p-3 border rounded-lg"
                rows={3}
                value={venueForm.description}
                onChange={(e) => setVenueForm({...venueForm, description: e.target.value})}
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
                          setVenueForm({...venueForm, image: uploadResponse.data.path});
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
                  onChange={(e) => setStatsForm({...statsForm, label: e.target.value})}
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
                onChange={(e) => setStatsForm({...statsForm, value: e.target.value})}
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
                          setStatsForm({...statsForm, image: uploadResponse.data.path});
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

              {actionMode === 'view' && activeMenu !== 'dashboard' && activeMenu !== 'settings' && (
                <button
                  onClick={() => setActionMode('add')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <Plus size={20} />
                  Tambah Baru
                </button>
              )}
            </div>

            {/* Content */}
            {renderContent()}

            {/* Stats Overview */}
            {activeMenu === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="text-sm text-gray-500 mb-2">Total Gallery</h4>
                  <p className="text-3xl font-bold">{galleryItems.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="text-sm text-gray-500 mb-2">Total Testimonials</h4>
                  <p className="text-3xl font-bold">{testimonials.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="text-sm text-gray-500 mb-2">Total Packages</h4>
                  <p className="text-3xl font-bold">{packages.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="text-sm text-gray-500 mb-2">Active Venues</h4>
                  <p className="text-3xl font-bold">{venues.length}</p>
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
        </ul>
      </div>
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-2">📊 Aktivitas Terbaru</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Testimonial baru ditambahkan (1 jam yang lalu)</p>
          <p>• Gallery diupdate (2 hari yang lalu)</p>
          <p>• Package harga diperbarui (3 hari yang lalu)</p>
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
  const [uploadingStates, setUploadingStates] = useState<{[key: number]: boolean}>({});

  const handleUploadThumbnail = async (itemId: number, file: File) => {
    setUploadingStates(prev => ({ ...prev, [itemId]: true }));

    try {
      const uploadResponse = await uploadFile(file);
      if (uploadResponse.success) {
        // Update the video with thumbnail
        const updateResponse = await apiRequest(`/wedding-show-videos/${itemId}`, {
          method: 'PUT',
          body: JSON.stringify({ thumbnail: uploadResponse.data.path })
        });

        if (updateResponse.success) {
          alert('Thumbnail berhasil diupload!');
          // Update the local state instead of reloading
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
                <label className={`flex-1 py-2 rounded hover:bg-green-200 cursor-pointer text-center ${
                  uploadingStates[item.id]
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

const SettingsContent = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h3 className="text-lg font-bold mb-6">Pengaturan Umum</h3>

    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3">Informasi Kontak</h4>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nomor Telepon"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Alamat"
            className="w-full p-3 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Sosial Media</h4>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Instagram URL"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Facebook URL"
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="YouTube URL"
            className="w-full p-3 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Tema Warna</h4>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-primary rounded cursor-pointer"></div>
          <div className="w-10 h-10 bg-secondary rounded cursor-pointer"></div>
          <div className="w-10 h-10 bg-accent rounded cursor-pointer"></div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
          Simpan Pengaturan
        </button>
        <button className="px-6 py-3 border rounded-lg hover:bg-gray-50">
          Reset
        </button>
      </div>
    </div>
  </div>
);

export default Admin;
