import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { PackageItem } from "../../shared/api";

export default function Packages() {
  const [isVisible, setIsVisible] = useState(false);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        const data = await response.json();
        if (data.success) {
          setPackages(data.data);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
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
          {packages.map((pkg, index) => (
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
                  {pkg.longDescription || pkg.description || 'No description available'}
                </p>

                {/* Features List */}
                <div className="space-y-3 mb-8 flex-grow">
                  {(pkg.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          pkg.highlighted ? "text-yellow-300" : "text-primary"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          pkg.highlighted ? "text-gray-100" : "text-foreground"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/6285329077987?text=Halo%2C%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(pkg.name)}%20seharga%20${encodeURIComponent(formatPrice(pkg.price))}%20untuk%20wedding%20saya.%20Bisakah%20kita%20diskusi%20lebih%20lanjut%3F`}
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
                        `https://wa.me/6285329077987?text=${encodeURIComponent(message)}`,
                        "_blank",
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
