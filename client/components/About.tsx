import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSettings } from "../hooks/useSettings";

export default function About() {
  const { settings } = useSettings();
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Parallax effect for background
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

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
      { threshold: 0.3 },
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
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 px-4 bg-background overflow-hidden relative"
      data-testid="about-section"
    >
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={isImageVisible ? "visible" : "hidden"}
        >
          {/* Image with 3D card effect */}
          <motion.div
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              rotateY: 5,
              rotateX: 5,
              transition: { duration: 0.3 }
            }}
            className="card-3d"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl p-2">
              <motion.img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Wedding Organizer"
                className="w-full h-[500px] object-cover rounded-xl"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Text content with glassmorphism */}
          <motion.div
            variants={textVariants}
            className="glass rounded-2xl p-8 hover-glow"
          >
            <motion.h2
              className="text-responsive-4xl font-bold text-gradient mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isTextVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Tentang Kami
            </motion.h2>

            <motion.div
              className="space-y-4 text-muted-foreground leading-relaxed"
              initial={{ opacity: 0 }}
              animate={isTextVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p>
                Galeria Wedding adalah tim profesional yang berdedikasi untuk
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
            </motion.div>

            {/* Stats with animated counters */}
            <motion.div
              className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={isTextVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.div
                className="text-center hover-lift"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">
                  Pernikahan Sukses
                </p>
              </motion.div>
              <motion.div
                className="text-center hover-lift"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-3xl font-bold text-primary mb-2">10+</div>
                <p className="text-sm text-muted-foreground">
                  Tahun Pengalaman
                </p>
              </motion.div>
              <motion.div
                className="text-center hover-lift"
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <p className="text-sm text-muted-foreground">Kepuasan Klien</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Second About Section with enhanced animations */}
        <motion.div
          className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isTextVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {/* Text content with glassmorphism */}
          <motion.div
            className="glass rounded-2xl p-8 hover-glow"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h3
              className="text-responsive-3xl font-bold text-gradient mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={isTextVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1, duration: 0.6 }}
            >
              {settings['about-services-title'] || 'Layanan Premium Kami'}
            </motion.h3>

            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate={isTextVisible ? "visible" : "hidden"}
            >
              {[
                {
                  title: settings['about-service-1-title'] || "Konsultasi Gratis",
                  desc: settings['about-service-1-desc'] || "Kami menawarkan konsultasi lengkap untuk memahami visi dan budget Anda"
                },
                {
                  title: settings['about-service-2-title'] || "Vendor Terpercaya",
                  desc: settings['about-service-2-desc'] || "Jaringan vendor terbaik untuk memastikan kualitas layanan"
                },
                {
                  title: settings['about-service-3-title'] || "Koordinasi Lengkap",
                  desc: settings['about-service-3-desc'] || "Tim profesional kami menangani semua detail dari awal hingga akhir"
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 hover-lift p-4 rounded-lg hover:bg-white/5 transition-colors"
                  variants={cardVariants}
                  whileHover={{ x: 10 }}
                >
                  <motion.div
                    className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-primary font-bold">✓</span>
                  </motion.div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {service.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {service.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image with 3D card effect */}
          <motion.div
            className="card-3d order-first lg:order-last"
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              rotateY: -5,
              rotateX: 5,
              transition: { duration: 0.3 }
            }}
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl p-2">
              <motion.img
                src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Wedding Services"
                className="w-full h-[500px] object-cover rounded-xl"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
