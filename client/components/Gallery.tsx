import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  image: string;
}

/** Transforms a Cloudinary URL to auto-compress and resize for thumbnails */
function cloudinaryThumb(url: string, width = 600): string {
  if (!url) return url;
  // Cloudinary URL pattern: .../upload/...
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace(
      "/upload/",
      `/upload/f_auto,q_auto,w_${width},c_fill/`
    );
  }
  return url;
}

/** Skeleton card shown while image loads */
function ImageSkeleton() {
  return (
    <div className="w-full h-full bg-gray-200 animate-pulse" />
  );
}

/** Single gallery card with lazy loading + skeleton */
function GalleryCard({
  item,
  onClick,
}: {
  item: GalleryImage;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const thumb = cloudinaryThumb(item.image, 600);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!loaded && !error && <ImageSkeleton />}
        {!error ? (
          <img
            src={thumb}
            alt={item.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
            Gambar tidak tersedia
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white px-2">
            <p className="font-semibold text-lg drop-shadow">{item.title}</p>
            <p className="text-sm text-gray-200">{item.category}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [isVisible, setIsVisible] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 },
    );
    const section = document.getElementById("gallery");
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        if (data.success) {
          const validItems = (data.data as GalleryImage[]).filter(
            (item) =>
              item.image &&
              !item.image.startsWith('/uploads/') &&
              !item.image.startsWith('uploads/')
          );
          setGalleryItems(validItems);
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const categories = ["All", "Dekorasi", "Tratag/Tarub", "Makeup", "Percetakan", "Umrah"];
  const filteredItems =
    filter === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === filter);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null)
      setSelectedIndex((selectedIndex + 1) % galleryItems.length);
  }, [selectedIndex, galleryItems.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex !== null)
      setSelectedIndex(selectedIndex === 0 ? galleryItems.length - 1 : selectedIndex - 1);
  }, [selectedIndex, galleryItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, handleNext, handlePrev]);

  return (
    <section
      id="gallery"
      className={`py-20 px-4 bg-background transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Gallery</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our portfolio of beautiful weddings and events
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onClick={() =>
                  setSelectedIndex(galleryItems.findIndex((i) => i.id === item.id))
                }
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-4 text-center py-20 text-muted-foreground">
                Belum ada foto di kategori ini.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedIndex(null); }}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Tutup"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full">
            {/* Full resolution in lightbox, still auto format */}
            <img
              src={cloudinaryThumb(galleryItems[selectedIndex].image, 1600)}
              alt={galleryItems[selectedIndex].title}
              loading="eager"
              className="w-full rounded-lg max-h-[80vh] object-contain"
            />
            <div className="text-center text-white mt-4">
              <p className="text-xl font-semibold">{galleryItems[selectedIndex].title}</p>
              <p className="text-gray-300">{galleryItems[selectedIndex].category}</p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Berikutnya"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </section>
  );
}
