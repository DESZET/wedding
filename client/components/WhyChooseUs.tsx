import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Award, Heart, Shield, Zap, Users, Clock } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import TiltCard from "./TiltCard";
import GlowBackground from "./GlowBackground";
import AnimatedHeading from "./AnimatedHeading";

const DEFAULT_BENEFITS = [
  { title: "10+ Tahun Pengalaman", description: "Dengan pengalaman lebih dari satu dekade, kami telah menangani ratusan pernikahan dengan sukses dan memuaskan", color: "from-blue-500 to-cyan-500" },
  { title: "Passion & Dedikasi", description: "Setiap pernikahan adalah istimewa bagi kami. Kami bekerja dengan passion penuh untuk mewujudkan impian Anda", color: "from-rose-400 to-pink-500" },
  { title: "Terpercaya & Profesional", description: "Standar profesionalisme tinggi dan transparansi penuh adalah komitmen kami kepada setiap klien", color: "from-emerald-500 to-green-500" },
  { title: "Solusi Cepat & Efisien", description: "Proses yang terstruktur dan tim yang responsif memastikan setiap masalah terselesaikan dengan cepat", color: "from-amber-400 to-orange-500" },
  { title: "Network Vendor Terbaik", description: "Jaringan vendor pilihan kami telah terbukti memberikan kualitas terbaik untuk berbagai kebutuhan", color: "from-violet-500 to-purple-500" },
  { title: "Dukungan 24/7", description: "Tim kami siap membantu Anda kapan saja, sebelum, selama, bahkan sesudah acara berlangsung", color: "from-orange-400 to-red-500" },
];

const ICONS = [
  <Award className="w-6 h-6" />,
  <Heart className="w-6 h-6" />,
  <Shield className="w-6 h-6" />,
  <Zap className="w-6 h-6" />,
  <Users className="w-6 h-6" />,
  <Clock className="w-6 h-6" />,
];

export default function WhyChooseUs() {
  const { settings } = useSettings();
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const title = settings["why-title"] || "Mengapa Harus Pilih Kami?";
  const subtitle =
    settings["why-subtitle"] ||
    "Galeria Wedding bukan hanya wedding organizer, tapi partner terpercaya dalam mewujudkan hari istimewa Anda";

  const benefits = DEFAULT_BENEFITS.map((def, i) => ({
    ...def,
    title: settings[`why-benefit-${i + 1}-title`] || def.title,
    description: settings[`why-benefit-${i + 1}-desc`] || def.description,
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-24 px-4 overflow-hidden mesh-gradient"
      data-testid="why-choose-us-section"
    >
      <GlowBackground variant="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <AnimatedHeading
            text={title}
            className="text-responsive-4xl font-bold text-gradient mb-5"
          />
          <motion.p
            className="text-responsive-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {benefits.map((benefit, index) => (
            <motion.div key={index} variants={cardVariants}>
              <TiltCard
                className="h-full"
                tiltAmount={6}
              >
                <div className="glass-card glow-border rounded-2xl p-7 h-full relative group transition-all duration-500">
                  {/* Accent top line */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${benefit.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`inline-flex p-3 rounded-xl mb-5 text-white bg-gradient-to-br ${benefit.color} shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {ICONS[index]}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
