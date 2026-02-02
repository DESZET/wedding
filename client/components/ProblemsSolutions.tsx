import { useEffect, useState, useRef } from "react";

const SHOWCASE_IMAGES = [
  "https://images.unsplash.com/photo-1519225421214-51d4eb6e72d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506574216779-a79c4a5b86c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519167758481-dc80357cbdf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
];

export default function ProblemsSolutions() {
  const [visibleImages, setVisibleImages] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger image animations sequentially
          SHOWCASE_IMAGES.forEach((_, index) => {
            setTimeout(() => {
              setVisibleImages((prev) => [...prev, index]);
            }, index * 100);
          });
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-background">
      {/* Hero Banner Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden bg-gray-900">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Problem Solution Banner"
          className="w-full h-full object-cover opacity-60"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            Anda Sedang Mengalami Ini?
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl animate-fade-in animation-delay-200">
            Kami memahami tantangan dalam merencanakan pernikahan impian. Itulah
            mengapa kami ada untuk solusinya.
          </p>
        </div>

        {/* Scroll indicator dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full opacity-60" />
          ))}
        </div>
      </div>

      {/* Image Grid Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Grid of showcase images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {SHOWCASE_IMAGES.map((image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg shadow-lg aspect-square group cursor-pointer transition-all duration-500 transform ${
                  visibleImages.includes(index)
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95"
                }`}
              >
                <img
                  src={image}
                  alt={`Showcase ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              </div>
            ))}
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            {/* Left - Text */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Mengapa Memilih Galeria wedding?
              </h2>
              <div className="space-y-4">
                {[
                  "Pengalaman 10+ tahun dalam industri wedding",
                  "Tim profesional yang berdedikasi penuh",
                  "Network vendor terpercaya dan berkualitas",
                  "Koordinasi detail yang sempurna",
                  "Harga transparan dan kompetitif",
                  "Dukungan 24/7 untuk kepuasan Anda",
                ].map((text, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl">✓</span>
                    <span className="text-muted-foreground text-lg">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Image */}
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1519225421214-51d4eb6e72d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Why Choose Us"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary to-yellow-400 rounded-xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Siap Mewujudkan Pernikahan Impian Anda?
            </h3>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Hubungi kami hari ini untuk konsultasi gratis dan temukan paket
              yang sempurna untuk acara istimewa Anda
            </p>
            <button
              onClick={() => {
                document
                  .getElementById("booking")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-10 py-4 bg-white text-primary rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg inline-block"
            >
              Hubungi Kami Sekarang
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </section>
  );
}
