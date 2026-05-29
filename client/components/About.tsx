import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSettings } from "../hooks/useSettings.tsx";
import { 
  Sparkles, CheckCircle2, Award, Heart, Shield, Users, Clock, ArrowRight,
  TrendingUp, Compass, Target, Feather
} from "lucide-react";
import TiltCard from "./TiltCard";
import GlowBackground from "./GlowBackground";
import AnimatedHeading from "./AnimatedHeading";
import SectionWrapper from "./SectionWrapper";

export default function About() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

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
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const slideLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const slideRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const brandValues = [
    {
      icon: <Feather className="w-6 h-6 text-primary" />,
      title: settings["about-pillar-1-title"] || "Desain Orisinal & Estetik",
      desc: settings["about-pillar-1-desc"] || "Kami menentang dekorasi templatis. Setiap lengkungan bunga, pencahayaan, dan tata letak dirancang khusus untuk merefleksikan karakter cinta unik Anda."
    },
    {
      icon: <Compass className="w-6 h-6 text-primary" />,
      title: settings["about-pillar-2-title"] || "Perencanaan Tanpa Hambatan",
      desc: settings["about-pillar-2-desc"] || "Dari koordinasi vendor katering hingga gladi resik, tim ahli kami mengelola seluruh proses secara presisi agar Anda dapat menikmati hari bahagia sepenuhnya."
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: settings["about-pillar-3-title"] || "Komitmen Anggaran Transparan",
      desc: settings["about-pillar-3-desc"] || "Tidak ada biaya tersembunyi. Kami bekerja secara cerdas dan transparan untuk memberikan kualitas dekorasi dan layanan terbaik sesuai anggaran yang Anda sepakati."
    }
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-32 px-4 bg-slate-50 overflow-hidden"
      data-testid="about-section"
    >
      {/* Premium Parallax Abstract Lines */}
      <motion.div className="absolute inset-0 opacity-[0.05]" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
      </motion.div>

      <GlowBackground variant="subtle" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Core Introductory Row */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Elegant Collage Frame - Left */}
          <motion.div variants={slideLeft} className="lg:col-span-5 relative">
            <TiltCard tiltAmount={4} className="relative">
              <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl p-3 border border-white/60">
                <motion.img
                  src={
                    settings["about-image-1"] ||
                    "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={settings["about-image-1-alt"] || "Seni Pernikahan Galeria Wedding"}
                  className="w-full h-[520px] object-cover rounded-2xl shadow-inner"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              {/* Float Glassmorphic Badge */}
              <motion.div
                className="absolute -bottom-6 -right-6 bg-gradient-to-br from-primary to-amber-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-primary/20 font-serif border border-primary/20 flex items-center gap-3"
                initial={{ scale: 0, rotate: 12 }}
                animate={isVisible ? { scale: 1, rotate: 0 } : {}}
                transition={{ delay: 0.7, type: "spring", stiffness: 180 }}
              >
                <div className="text-3xl font-black">{settings["about-badge-value"] || settings["about-stat-2-value"] || "10+"}</div>
                <div className="text-xs font-semibold tracking-wider leading-tight uppercase border-l border-white/20 pl-3">
                  {settings["about-badge-label"] ? (
                    settings["about-badge-label"].includes(" ") ? (
                      <>
                        {settings["about-badge-label"].split(" ")[0]}
                        <br />
                        {settings["about-badge-label"].split(" ").slice(1).join(" ")}
                      </>
                    ) : (
                      settings["about-badge-label"]
                    )
                  ) : (
                    <>Tahun<br />Dedikasi</>
                  )}
                </div>
              </motion.div>
            </TiltCard>
          </motion.div>

          {/* Luxury Editorial Story - Right */}
          <motion.div variants={slideRight} className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{settings["about-hero-badge"] || "Kreator Pernikahan Impian Anda"}</span>
              </div>
              
              {settings["about-hero-title"] ? (
                <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight text-slate-800">
                  {settings["about-hero-title"]}
                </h2>
              ) : (
                <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight text-slate-800">
                  Seni Merajut Kisah Cinta Menjadi <span className="text-gradient">Kenangan Abadi</span>
                </h2>
              )}
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed font-light text-base md:text-lg">
              <p>
                {settings["about-paragraph-1"] || "Di Galeria Wedding, kami percaya pernikahan bukanlah sekadar upacara formalitas satu hari. Pernikahan adalah monumen perayaan dari perjalanan cinta unik Anda berdua. Kami hadir untuk menyingkirkan segala kecemasan teknis dan menggantinya dengan kemudahan perencanaan yang menyenangkan."}
              </p>
              <p className="border-l-2 border-primary/40 pl-5 italic text-slate-700 font-medium">
                {settings["about-paragraph-2"] || `"Kami tidak membuat replika pernikahan orang lain. Kami mendengarkan cerita Anda, merumuskan konsep orisinal, dan mengeksekusinya secara presisi dengan standar kualitas pelayanan tertinggi."`}
              </p>
              <p>
                {settings["about-paragraph-3"] || "Didukung oleh tim lapangan bersertifikat dan jaringan vendor premium yang teruji, kami berkomitmen penuh memberikan perhatian menyeluruh terhadap detail terkecil (attention to detail) dari fase desain konsep awal hingga hari bahagia Anda diselenggarakan dengan sempurna."}
              </p>
            </div>

            {/* High-End Clean Stats Badges */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200">
              {[
                {
                  value: settings["about-stat-1-value"] || "500+",
                  label: settings["about-stat-1-label"] || "Resepsi Sukses",
                  icon: <Heart className="w-4 h-4 text-rose-500" />
                },
                {
                  value: settings["about-stat-2-value"] || "10+",
                  label: settings["about-stat-2-label"] || "Tahun Pengalaman",
                  icon: <Award className="w-4 h-4 text-amber-500" />
                },
                {
                  value: settings["about-stat-3-value"] || "98%",
                  label: settings["about-stat-3-label"] || "Kepuasan Klien",
                  icon: <Users className="w-4 h-4 text-blue-500" />
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/80 p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-2xl font-serif font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                      {stat.value}
                    </span>
                    {stat.icon}
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wide uppercase leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Second Row: Brand Core Values (Attractive & Modern Cards) */}
        <div className="mt-32">
          <SectionWrapper id="about-values-header" delay={100} animationType="fade-in-up">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-serif font-black text-slate-800">
                {settings["about-pillar-title"] || "Pilar Layanan Utama Kami"}
              </h3>
              <p className="text-slate-500 max-w-xl mx-auto mt-3">
                {settings["about-pillar-desc"] || "Karakteristik kerja yang membedakan kami dengan layanan EO pernikahan konvensional"}
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brandValues.map((value, idx) => (
              <SectionWrapper key={idx} id={`value-${idx}`} delay={200 + idx * 100} animationType="fade-in-up">
                <div className="h-full bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl border border-slate-100/50 hover:border-slate-200 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between relative group overflow-hidden">
                  
                  {/* Decorative glowing gradient circle */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-primary/5 to-amber-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-inner">
                      {value.icon}
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors">
                      {value.title}
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {value.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mt-6 pt-6 border-t border-slate-100 select-none">
                    <span>Orisinalitas</span>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>

        {/* Third Row: Professional B2B Partnerships / Trust Checkpoints */}
        <motion.div
          className="mt-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {/* Left Checkpoints */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-serif font-black text-slate-800">
                {settings["about-services-title"] || "Pendampingan Menyeluruh"}
              </h3>
              <p className="text-slate-500 leading-relaxed max-w-xl font-light">
                {settings["about-services-desc"] || "Kami merancang sistem kerja terintegrasi agar setiap langkah persiapan pernikahan terasa ringan dan terkendali."}
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: settings["about-service-1-title"] || "Konsultasi Tanpa Batas",
                  desc: settings["about-service-1-desc"] || "Kami membuka ruang diskusi bebas kapan pun untuk mendengarkan perubahan visi dan penyusunan budget berkala."
                },
                {
                  title: settings["about-service-2-title"] || "Mitra Vendor Kredibel",
                  desc: settings["about-service-2-desc"] || "Akses eksklusif ke ratusan mitra katering legendaris, dekorator premium, dan gaun berlisensi dengan diskon khusus."
                },
                {
                  title: settings["about-service-3-title"] || "Manajemen Hari H yang Solid",
                  desc: settings["about-service-3-desc"] || "Lebih dari 10 crew lapangan profesional berjaga secara ketat mengoordinasikan tamu VIP, alur hidangan, dan kelancaran rundown."
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300 group cursor-default border border-transparent hover:border-slate-100"
                  initial={{ opacity: 0, x: -30 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + index * 0.15, ease: "easeOut" }}
                  whileHover={{ x: 6 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary text-primary group-hover:text-white transition-all duration-500 shadow-inner">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                      {service.title}
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-light">
                      {service.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Image Feature */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <TiltCard tiltAmount={4}>
              <div className="bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl p-3 border border-white/60">
                <motion.img
                  src={
                    settings["about-image-2"] ||
                    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={settings["about-image-2-alt"] || "Mitra Vendor Pernikahan Terbaik"}
                  className="w-full h-[520px] object-cover rounded-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </TiltCard>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
