import { useEffect, useState, useRef } from "react";

export default function About() {
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger image animation first
          setIsImageVisible(true);
          // Then trigger text animation with delay
          setTimeout(() => {
            setIsTextVisible(true);
          }, 300);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 px-4 bg-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image with slide-right animation */}
          <div
            className={`transition-all duration-700 ease-out ${
              isImageVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Wedding Organizer"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>

          {/* Text content with fade and slide animation */}
          <div
            className={`transition-all duration-700 ease-out ${
              isTextVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Tentang Kami
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                D'Manten adalah tim profesional yang berdedikasi untuk
                mewujudkan hari istimewa Anda menjadi kenangan yang tak
                terlupakan. Dengan pengalaman lebih dari 10 tahun di industri
                wedding planning, kami memahami setiap detail yang membuat
                pernikahan Anda sempurna.
              </p>

              <p>
                Kami percaya bahwa setiap pernikahan adalah unik dan istimewa.
                Oleh karena itu, kami menyediakan solusi kustomisasi penuh untuk
                memastikan bahwa visi Anda menjadi kenyataan dengan sempurna.
              </p>

              <p>
                Tim kami yang berpengalaman siap membantu Anda dari tahap
                perencanaan awal hingga hari spesial tiba. Kami berkomitmen
                untuk memberikan layanan terbaik dengan attention to detail yang
                luar biasa.
              </p>
            </div>

            {/* Stats or highlights */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Pernikahan Sukses</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <p className="text-sm text-muted-foreground">Tahun Pengalaman</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <p className="text-sm text-muted-foreground">Kepuasan Klien</p>
              </div>
            </div>
          </div>
        </div>

        {/* Second About Section - Image on right, text on left */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content with slide-up animation */}
          <div
            className={`transition-all duration-700 ease-out ${
              isTextVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Layanan Premium Kami
            </h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Konsultasi Gratis
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Kami menawarkan konsultasi lengkap untuk memahami visi dan
                    budget Anda
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Vendor Terpercaya
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Jaringan vendor terbaik untuk memastikan kualitas layanan
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Koordinasi Lengkap
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Tim profesional kami menangani semua detail dari awal hingga
                    akhir
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image with slide-left animation */}
          <div
            className={`transition-all duration-700 ease-out order-first lg:order-last ${
              isImageVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-20"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Wedding Services"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
