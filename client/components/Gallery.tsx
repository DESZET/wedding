import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  id: number;
  title: string;
  category: string;
  image: string;
}

const GALLERY_ITEMS: GalleryImage[] = [
  {
    id: 1,
    title: "Classic Ballroom",
    category: "Decoration",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Beach Wedding",
    category: "Decoration",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Elegant Arrangement",
    category: "Decoration",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Garden Venue",
    category: "Venue",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Makeup & Beauty",
    category: "Makeup",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Bridal Fashion",
    category: "Fashion",
    image: "/placeholder.svg",
  },
  {
    id: 7,
    title: "Groom Style",
    category: "Fashion",
    image: "/placeholder.svg",
  },
  {
    id: 8,
    title: "Catering",
    category: "Catering",
    image: "/placeholder.svg",
  },
];

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const section = document.getElementById("gallery");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const categories = [
    "All",
    "Decoration",
    "Venue",
    "Makeup",
    "Fashion",
    "Catering",
  ];
  const filteredItems =
    filter === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === filter);

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % GALLERY_ITEMS.length);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(
        selectedIndex === 0 ? GALLERY_ITEMS.length - 1 : selectedIndex - 1,
      );
    }
  };

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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Gallery
          </h2>
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() =>
                setSelectedIndex(
                  GALLERY_ITEMS.findIndex((i) => i.id === item.id),
                )
              }
              className="group cursor-pointer overflow-hidden rounded-lg"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                    <p className="font-semibold text-lg">{item.title}</p>
                    <p className="text-sm text-gray-200">{item.category}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full">
            <img
              src={GALLERY_ITEMS[selectedIndex].image}
              alt={GALLERY_ITEMS[selectedIndex].title}
              className="w-full rounded-lg max-h-[80vh] object-contain"
            />
            <div className="text-center text-white mt-4">
              <p className="text-xl font-semibold">
                {GALLERY_ITEMS[selectedIndex].title}
              </p>
              <p className="text-gray-300">
                {GALLERY_ITEMS[selectedIndex].category}
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </section>
  );
}
