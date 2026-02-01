import { useState, useEffect, useRef } from "react";
import { Play, MapPin } from "lucide-react";

interface Venue {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  price: string;
  capacity: string;
}

const VENUES: Venue[] = [
  {
    id: 1,
    title: "Crystal Ballroom",
    category: "Indoor",
    description: "Elegant indoor venue dengan chandelier mewah dan tata letak fleksibel",
    image:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    price: "15-30 juta",
    capacity: "100-500 tamu",
  },
  {
    id: 2,
    title: "Garden Paradise",
    category: "Outdoor",
    description: "Taman indah dengan pemandangan alam yang memukau untuk wedding outdoor",
    image:
      "https://images.unsplash.com/photo-1506574216779-a79c4a5b86c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    price: "10-25 juta",
    capacity: "50-300 tamu",
  },
  {
    id: 3,
    title: "Seaside Pavilion",
    category: "Beach",
    description: "Venue tepi pantai dengan pemandangan laut yang romantis dan suasana eksotis",
    image:
      "https://images.unsplash.com/photo-1519225421214-51d4eb6e72d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    price: "20-35 juta",
    capacity: "80-400 tamu",
  },
];

export default function WeddingShow() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="wedding-show"
      className="py-20 px-4 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isSectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Wedding Show
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Jelajahi berbagai pilihan venue eksklusif dan terpercaya untuk acara
            spesial Anda
          </p>
        </div>

        {/* Video Player Section */}
        <div
          className={`mb-16 transition-all duration-700 ${
            isSectionVisible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
        >
          <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gray-800 flex items-center justify-center relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1519167758481-dc80357cbdf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Wedding Show"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              
              {/* Play Button */}
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="absolute flex items-center justify-center gap-3 text-white group-hover:scale-110 transition-transform"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                  <Play className="w-8 h-8 ml-1" fill="white" />
                </div>
              </button>
            </div>

            {/* Info below video */}
            <div className="p-8 bg-white">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Menggunjungi Koleksi Wedding Venue Eksklusif
              </h3>
              <p className="text-muted-foreground">
                Tonton koleksi venue pernikahan terbaik kami yang telah dipercaya
                oleh ratusan pasangan dalam mewujudkan hari istimewa mereka.
              </p>
            </div>
          </div>
        </div>

        {/* Venue Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {VENUES.map((venue, index) => (
            <div
              key={venue.id}
              className={`rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                isSectionVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Image */}
              <div className="relative overflow-hidden h-64 bg-gray-200">
                <img
                  src={venue.image}
                  alt={venue.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  {venue.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 bg-white">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {venue.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {venue.description}
                </p>

                {/* Info */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Kapasitas: {venue.capacity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <span className="text-primary">Rp</span>
                    <span>{venue.price}</span>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() => {
                    const message = `Halo, saya tertarik dengan venue ${venue.title}. Bisakah kita diskusi lebih lanjut mengenai detail dan ketersediaannya?`;
                    window.open(
                      `https://wa.me/62812345678900?text=${encodeURIComponent(message)}`,
                      "_blank"
                    );
                  }}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
                >
                  Konsultasi Venue
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Information Section */}
        <div
          className={`bg-gray-50 rounded-lg p-8 md:p-12 transition-all duration-700 ${
            isSectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Informasi Venue
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="rounded-lg overflow-hidden shadow-lg h-80 bg-gray-200">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5897749250743!2d106.82714321533262!3d-6.174465961058034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3370c0d0001%3A0xf0d4b07cc63156e!2sJakarta%2C%20Indonesia!5e0!3m2!1sen!2sus!4v1234567890"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Info Text */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-foreground mb-2">Lokasi</h4>
                <p className="text-muted-foreground">
                  Jakarta, Indonesia. Semua venue kami berlokasi strategis dan
                  mudah diakses dari berbagai tempat.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-foreground mb-2">
                  Fasilitas
                </h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Parkir luas dan aman
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    AC dan sistem pendingin modern
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Kamar ganti dan ruang istirahat
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Sistem audio dan lighting profesional
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  const message = `Halo, saya ingin mengetahui lebih banyak tentang semua venue yang tersedia dan ketersediaannya untuk tanggal yang saya inginkan.`;
                  window.open(
                    `https://wa.me/62812345678900?text=${encodeURIComponent(message)}`,
                    "_blank"
                  );
                }}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors w-full md:w-auto"
              >
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <iframe
              className="w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Wedding Show"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
