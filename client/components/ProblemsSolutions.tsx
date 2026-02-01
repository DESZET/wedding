import { useEffect, useState, useRef } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Zap,
} from "lucide-react";

interface Problem {
  id: number;
  icon: React.ReactNode;
  problem: string;
  solution: string;
}

const PROBLEMS: Problem[] = [
  {
    id: 1,
    icon: <Clock className="w-8 h-8" />,
    problem: "Waktu Terbatas untuk Merencanakan",
    solution:
      "Kami menangani semua detail planning dengan timeline yang terstruktur dan profesional",
  },
  {
    id: 2,
    icon: <Users className="w-8 h-8" />,
    problem: "Mengoordinasikan Banyak Vendor",
    solution:
      "Network vendor terpercaya kami siap membantu dengan koordinasi sempurna",
  },
  {
    id: 3,
    icon: <DollarSign className="w-8 h-8" />,
    problem: "Budget yang Tidak Jelas",
    solution:
      "Kami tawarkan paket transparan dengan breakdown jelas sesuai budget Anda",
  },
  {
    id: 4,
    icon: <AlertCircle className="w-8 h-8" />,
    problem: "Stress dan Kebingungan di Hari H",
    solution:
      "Koordinator profesional kami handle semua di hari H, Anda hanya tinggal enjoy",
  },
  {
    id: 5,
    icon: <Zap className="w-8 h-8" />,
    problem: "Detail yang Terlewatkan",
    solution:
      "Checklist detail kami memastikan tidak ada yang terlewatkan sampai hari istimewa",
  },
  {
    id: 6,
    icon: <CheckCircle className="w-8 h-8" />,
    problem: "Kualitas Hasil yang Diragukan",
    solution:
      "Portfolio 500+ pernikahan sukses kami membuktikan kualitas dan profesionalisme",
  },
];

export default function ProblemsSolutions() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger animations sequentially
          PROBLEMS.forEach((_, index) => {
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
    <section ref={sectionRef} className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Anda Sedang Mengalami Ini?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kami memahami tantangan dalam merencanakan pernikahan impian. Itulah
            mengapa kami ada untuk solusinya.
          </p>
        </div>

        {/* Problems & Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROBLEMS.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-lg p-8 border-l-4 border-primary transition-all duration-500 transform hover:shadow-2xl hover:-translate-y-2 ${
                visibleItems.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Problem Section */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg text-red-600">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      TANTANGAN
                    </p>
                  </div>
                </div>
                <p className="text-foreground font-bold text-lg">
                  {item.problem}
                </p>
              </div>

              {/* Solution Section */}
              <div>
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      SOLUSI KAMI
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">{item.solution}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-xl text-muted-foreground mb-6">
            Biarkan kami menangani kompleksitas perencanaan pernikahan Anda
          </p>
          <button
            onClick={() => {
              document
                .getElementById("booking")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-10 py-4 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors text-lg"
          >
            Hubungi Kami Sekarang
          </button>
        </div>
      </div>
    </section>
  );
}
