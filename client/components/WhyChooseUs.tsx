import { useEffect, useState, useRef } from "react";
import {
  Award,
  Heart,
  Shield,
  Zap,
  Users,
  Clock,
} from "lucide-react";

interface Benefit {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const BENEFITS: Benefit[] = [
  {
    id: 1,
    icon: <Award className="w-8 h-8" />,
    title: "10+ Tahun Pengalaman",
    description:
      "Dengan pengalaman lebih dari satu dekade, kami telah menangani ratusan pernikahan dengan sukses dan memuaskan",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    icon: <Heart className="w-8 h-8" />,
    title: "Passion & Dedikasi",
    description:
      "Setiap pernikahan adalah istimewa bagi kami. Kami bekerja dengan passion penuh untuk mewujudkan impian Anda",
    color: "from-pink-500 to-pink-600",
  },
  {
    id: 3,
    icon: <Shield className="w-8 h-8" />,
    title: "Terpercaya & Profesional",
    description:
      "Standar profesionalisme tinggi dan transparansi penuh adalah komitmen kami kepada setiap klien",
    color: "from-green-500 to-green-600",
  },
  {
    id: 4,
    icon: <Zap className="w-8 h-8" />,
    title: "Solusi Cepat & Efisien",
    description:
      "Proses yang terstruktur dan tim yang responsif memastikan setiap masalah terselesaikan dengan cepat",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: 5,
    icon: <Users className="w-8 h-8" />,
    title: "Network Vendor Terbaik",
    description:
      "Jaringan vendor pilihan kami telah terbukti memberikan kualitas terbaik untuk berbagai kebutuhan",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 6,
    icon: <Clock className="w-8 h-8" />,
    title: "Dukungan 24/7",
    description:
      "Tim kami siap membantu Anda kapan saja, sebelum, selama, bahkan sesudah acara berlangsung",
    color: "from-orange-500 to-orange-600",
  },
];

export default function WhyChooseUs() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger animations sequentially
          BENEFITS.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => [...prev, index]);
            }, index * 100);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Mengapa Harus Pilih Kami?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            D'Manten bukan hanya wedding organizer, tapi partner terpercaya dalam
            mewujudkan hari istimewa Anda
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`group relative overflow-hidden rounded-xl transition-all duration-500 transform ${
                visibleItems.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              } hover:-translate-y-2`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              />

              {/* Card Content */}
              <div className="relative p-8 bg-white border border-gray-200 rounded-xl h-full">
                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-lg mb-6 text-white bg-gradient-to-br ${benefit.color}`}
                >
                  {benefit.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                {/* Bottom accent line */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-y border-gray-200">
          {[
            { number: "500+", label: "Pernikahan Sukses", delay: 0 },
            { number: "10+", label: "Tahun Pengalaman", delay: 100 },
            { number: "98%", label: "Kepuasan Klien", delay: 200 },
            { number: "100+", label: "Vendor Partner", delay: 300 },
          ].map((stat, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-700 ${
                visibleItems.length > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: `${stat.delay}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-block">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Siap mewujudkan impian pernikahan Anda?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl">
              Hubungi kami hari ini untuk konsultasi gratis dan temukan paket
              yang sempurna untuk acara Anda
            </p>
            <button
              onClick={() => {
                document
                  .getElementById("packages")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-10 py-4 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors text-lg inline-block"
            >
              Lihat Paket Kami
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
