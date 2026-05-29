import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSettings } from "../hooks/useSettings.tsx";
import TiltCard from "./TiltCard";
import GlowBackground from "./GlowBackground";
import AnimatedHeading from "./AnimatedHeading";

export default function About() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const slideLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const slideRight = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-24 px-4 bg-background overflow-hidden"
      data-testid="about-section"
    >
      {/* Subtle Parallax Background */}
      <motion.div className="absolute inset-0 opacity-[0.03]" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
      </motion.div>

      <GlowBackground variant="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Image */}
          <motion.div variants={slideLeft}>
            <TiltCard tiltAmount={5} className="relative">
              <div className="glass-card rounded-2xl overflow-hidden shadow-2xl p-1.5">
                <motion.img
                  src={
                    settings["about-image-1"] ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  }
                  alt="Wedding Organizer"
                  className="w-full h-[480px] object-cover rounded-xl"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-4 -right-4 bg-primary text-white px-5 py-2.5 rounded-xl shadow-xl shadow-primary/20 font-semibold text-sm"
                initial={{ scale: 0, rotate: -10 }}
                animate={isVisible ? { scale: 1, rotate: 0 } : {}}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              >
                ✨ {settings["about-stat-2-value"] || "10+"} Years
              </motion.div>
            </TiltCard>
          </motion.div>

          {/* Text content */}
          <motion.div variants={slideRight} className="space-y-6">
            <AnimatedHeading
              text="Tentang Kami"
              className="text-responsive-4xl font-bold text-gradient"
            />

            <motion.div
              className="space-y-4 text-muted-foreground leading-relaxed"
              variants={containerVariants}
            >
              <motion.p variants={fadeUp}>
                {settings["about-paragraph-1"] ||
                  "Galeria Wedding adalah tim profesional yang berdedikasi untuk mewujudkan hari istimewa Anda menjadi kenangan yang tak terlupakan. Dengan pengalaman lebih dari 10 tahun di industri wedding planning, kami memahami setiap detail yang membuat pernikahan Anda sempurna."}
              </motion.p>
              <motion.p variants={fadeUp}>
                {settings["about-paragraph-2"] ||
                  "Kami percaya bahwa setiap pernikahan adalah unik dan istimewa. Oleh karena itu, kami menyediakan solusi kustomisasi penuh untuk memastikan bahwa visi Anda menjadi kenyataan dengan sempurna."}
              </motion.p>
              <motion.p variants={fadeUp}>
                {settings["about-paragraph-3"] ||
                  "Tim kami yang berpengalaman siap membantu Anda dari tahap perencanaan awal hingga hari spesial tiba. Kami berkomitmen untuk memberikan layanan terbaik dengan attention to detail yang luar biasa."}
              </motion.p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 pt-8"
              variants={containerVariants}
            >
              {[
                {
                  value: settings["about-stat-1-value"] || "500+",
                  label: settings["about-stat-1-label"] || "Pernikahan Sukses",
                },
                {
                  value: settings["about-stat-2-value"] || "10+",
                  label: settings["about-stat-2-label"] || "Tahun Pengalaman",
                },
                {
                  value: settings["about-stat-3-value"] || "98%",
                  label: settings["about-stat-3-label"] || "Kepuasan Klien",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center p-4 rounded-xl glass-card glow-border"
                  variants={fadeUp}
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Second About Section */}
        <motion.div
          className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          {/* Text content */}
          <motion.div className="space-y-6" variants={containerVariants}>
            <AnimatedHeading
              text={settings["about-services-title"] || "Layanan Premium Kami"}
              className="text-responsive-3xl font-bold text-gradient"
            />

            <div className="space-y-3">
              {[
                {
                  title:
                    settings["about-service-1-title"] || "Konsultasi Gratis",
                  desc:
                    settings["about-service-1-desc"] ||
                    "Kami menawarkan konsultasi lengkap untuk memahami visi dan budget Anda",
                },
                {
                  title:
                    settings["about-service-2-title"] || "Vendor Terpercaya",
                  desc:
                    settings["about-service-2-desc"] ||
                    "Jaringan vendor terbaik untuk memastikan kualitas layanan",
                },
                {
                  title:
                    settings["about-service-3-title"] || "Koordinasi Lengkap",
                  desc:
                    settings["about-service-3-desc"] ||
                    "Tim profesional kami menangani semua detail dari awal hingga akhir",
                },
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 group cursor-default"
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.8 + index * 0.15 }}
                  whileHover={{ x: 8 }}
                >
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-primary font-bold text-sm">✓</span>
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div className="order-first lg:order-last">
            <TiltCard tiltAmount={5}>
              <div className="glass-card rounded-2xl overflow-hidden shadow-2xl p-1.5">
                <motion.img
                  src={
                    settings["about-image-2"] ||
                    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  }
                  alt="Wedding Services"
                  className="w-full h-[480px] object-cover rounded-xl"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
