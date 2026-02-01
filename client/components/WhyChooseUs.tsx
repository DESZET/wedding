import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Award, Heart, Shield, Zap, Users, Clock } from "lucide-react";

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
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden" data-testid="why-choose-us-section">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={visibleItems.length > 0 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-responsive-4xl font-bold text-gradient mb-4">
            Mengapa Harus Pilih Kami?
          </h2>
          <p className="text-responsive-lg text-muted-foreground max-w-2xl mx-auto">
            D'Manten bukan hanya wedding organizer, tapi partner terpercaya
            dalam mewujudkan hari istimewa Anda
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={visibleItems.length > 0 ? "visible" : "hidden"}
        >
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              variants={cardVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative overflow-hidden"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}
              />

              {/* Card Content */}
              <div className="glass rounded-2xl p-8 h-full hover-glow relative z-10">
                {/* Icon */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl mb-6 text-white bg-gradient-to-br ${benefit.color} shadow-lg`}
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {benefit.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>

                {/* Bottom accent line */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} rounded-b-2xl`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-y border-white/20"
          initial={{ opacity: 0, y: 30 }}
          animate={visibleItems.length > 0 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {[
            { number: "500+", label: "Pernikahan Sukses", delay: 0 },
            { number: "10+", label: "Tahun Pengalaman", delay: 100 },
            { number: "98%", label: "Kepuasan Klien", delay: 200 },
            { number: "100+", label: "Vendor Partner", delay: 300 },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={statVariants}
              className="text-center hover-lift"
              whileHover={{ scale: 1.1 }}
              transition={{ delay: stat.delay / 1000 }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={visibleItems.length > 0 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="inline-block">
            <motion.h3
              className="text-2xl font-bold text-gradient mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={visibleItems.length > 0 ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1, duration: 0.5 }}
            >
              Siap mewujudkan impian pernikahan Anda?
            </motion.h3>
            <motion.p
              className="text-muted-foreground mb-8 max-w-xl"
              initial={{ opacity: 0 }}
              animate={visibleItems.length > 0 ? { opacity: 1 } : {}}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Hubungi kami hari ini untuk konsultasi gratis dan temukan paket
              yang sempurna untuk acara Anda
            </motion.p>
            <motion.button
              onClick={() => {
                document
                  .getElementById("packages")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover-lift hover-glow text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={visibleItems.length > 0 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              Lihat Paket Kami
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
