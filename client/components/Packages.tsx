import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
  longDescription: string;
}

const PACKAGES: Package[] = [
  {
    id: 1,
    name: "Silver",
    price: 5000000,
    description: "Paket terjangkau untuk acara intim",
    longDescription:
      "Paket Silver dirancang untuk pasangan yang menginginkan pernikahan yang elegan namun tetap terjangkau. Dengan layanan koordinasi penuh, dekorasi sederhana namun berkelas, dan catering berkualitas, kami memastikan hari istimewa Anda berjalan sempurna.",
    features: [
      "Konsultasi gratis dengan wedding planner",
      "Dekorasi venue dengan tema pilihan Anda",
      "Koordinasi dengan venue dan vendor",
      "Makeup dan styling untuk pengantin",
      "Catering untuk hingga 100 tamu",
      "DJ dan sound system",
      "Dokumentasi foto dasar",
      "Koordinator hari H",
    ],
    highlighted: false,
  },
  {
    id: 2,
    name: "Gold",
    price: 10000000,
    description: "Pilihan terpopuler dengan layanan premium",
    longDescription:
      "Paket Gold kami adalah pilihan terbaik untuk pernikahan yang benar-benar spesial. Dengan tim profesional berpengalaman, dekorasi mewah, catering premium, dan layanan lengkap, kami pastikan setiap detail sempurna dan tamu Anda terkesan.",
    features: [
      "Konsultasi mendalam dan theme design",
      "Dekorasi premium dengan tema eksklusif",
      "Koordinasi lengkap vendor dan venue",
      "Paket makeup dan styling profesional",
      "Catering premium untuk hingga 300 tamu",
      "DJ, lighting, dan sound system premium",
      "Paket fotografi profesional",
      "Video highlights",
      "Koordinator dan asisten hari H",
      "Rehearsal dinner coordination",
    ],
    highlighted: true,
  },
  {
    id: 3,
    name: "Platinum",
    price: 20000000,
    description: "Kemewahan tanpa batas untuk hari istimewa Anda",
    longDescription:
      "Paket Platinum adalah ultimate experience untuk pernikahan impian Anda. Dengan layanan white-glove service, desain kustom, vendor pilihan terbaik, dan perhatian detail yang luar biasa, kami ciptakan pernikahan yang tak terlupakan seumur hidup.",
    features: [
      "Wedding planning & design konsultasi eksklusif",
      "Bespoke decoration design dengan konsep unik",
      "Seleksi venue premium dan koordinasi lengkap",
      "Elite makeup & styling team dengan makeup artist terkenal",
      "Catering mewah dengan menu kustom untuk unlimited tamu",
      "Live band, DJ premium, dan entertainment profesional",
      "Paket fotografi dan videografi premium",
      "Drone footage dan cinematic video",
      "Koordinator dedicated dan team besar hari H",
      "Pre-wedding photoshoot & konsultasi fashion",
      "Post-wedding event coordination",
      "24/7 support sebelum dan sesudah pernikahan",
    ],
    highlighted: false,
  },
];

export default function Packages() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("packages");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      id="packages"
      className={`py-20 px-4 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect package for your dream wedding
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PACKAGES.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`rounded-xl overflow-hidden transition-all duration-500 flex flex-col ${
                pkg.highlighted
                  ? "md:scale-105 bg-gradient-to-br from-foreground to-gray-800 text-white shadow-2xl"
                  : "bg-white text-foreground shadow-lg hover:shadow-2xl"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
              }}
            >
              {/* Featured Badge */}
              {pkg.highlighted && (
                <div className="bg-primary text-primary-foreground text-center py-3 font-bold text-sm">
                  ⭐ PILIHAN TERPOPULER
                </div>
              )}

              {/* Package Content */}
              <div className="p-8 flex-grow flex flex-col">
                {/* Title & Subtitle */}
                <h3 className="text-3xl font-bold mb-2">{pkg.name}</h3>
                <p
                  className={`text-sm mb-6 font-medium ${
                    pkg.highlighted ? "text-gray-200" : "text-muted-foreground"
                  }`}
                >
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mb-8 pb-8 border-b border-gray-300 border-opacity-20">
                  <p className="text-5xl font-bold mb-1">
                    {formatPrice(pkg.price)}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      pkg.highlighted
                        ? "text-gray-300"
                        : "text-muted-foreground"
                    }`}
                  >
                    Paket lengkap untuk hari istimewa Anda
                  </p>
                </div>

                {/* Long Description */}
                <p
                  className={`text-sm leading-relaxed mb-8 ${
                    pkg.highlighted ? "text-gray-100" : "text-muted-foreground"
                  }`}
                >
                  {pkg.longDescription}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8 flex-grow">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          pkg.highlighted ? "text-yellow-300" : "text-primary"
                        }`}
                      />
                      <span className={`text-sm ${
                        pkg.highlighted ? "text-gray-100" : "text-foreground"
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/62812345678900?text=Halo%2C%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(pkg.name)}%20seharga%20${encodeURIComponent(formatPrice(pkg.price))}%20untuk%20wedding%20saya.%20Bisakah%20kita%20diskusi%20lebih%20lanjut%3F`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 rounded-lg font-bold transition-colors text-center ${
                      pkg.highlighted
                        ? "bg-yellow-400 text-foreground hover:bg-yellow-300"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    Pilih Paket Ini
                  </a>
                  <button
                    onClick={() => {
                      const message = `Halo, saya ingin berkonsultasi tentang paket ${pkg.name}. Bisa kita diskusi detail lebih lanjut?`;
                      window.open(
                        `https://wa.me/62812345678900?text=${encodeURIComponent(message)}`,
                        "_blank"
                      );
                    }}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors text-center text-sm ${
                      pkg.highlighted
                        ? "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                        : "bg-gray-100 text-foreground hover:bg-gray-200"
                    }`}
                  >
                    Konsultasi Sekarang
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
