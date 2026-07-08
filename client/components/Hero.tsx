import { useEffect, useState, useRef } from "react";
import { ChevronDown, Sparkles, Heart, Star } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings.tsx";
import GlowBackground from "./GlowBackground";

const DEFAULT_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1519225421214-51d4eb6e72d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1506574216779-a79c4a5b86c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
];

// Decorative floating element positions
const FLOATING_ELEMENTS = [
  { Icon: Sparkles, size: "w-5 h-5", x: "10%", y: "15%", delay: 0 },
  { Icon: Heart, size: "w-4 h-4", x: "85%", y: "20%", delay: 1.5 },
  { Icon: Star, size: "w-3 h-3", x: "15%", y: "75%", delay: 3 },
  { Icon: Sparkles, size: "w-6 h-6", x: "90%", y: "70%", delay: 2 },
  { Icon: Heart, size: "w-3 h-3", x: "50%", y: "10%", delay: 4 },
];

export default function Hero() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const heroImages = (() => {
    const savedImages = settings['hero-images'];
    if (savedImages) {
      try {
        const parsed = JSON.parse(savedImages);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing hero-images setting:', e);
      }
    }
    return DEFAULT_HERO_IMAGES;
  })();

  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Scroll parallax
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const yVal = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 30);
    mouseY.set(yVal * 30);
  };

  const scrollToNext = () => {
    const nextSection = heroRef.current?.nextElementSibling;
    nextSection?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.5 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative h-screen w-full overflow-hidden bg-gray-900"
      onMouseMove={handleMouseMove}
      data-testid="hero-section"
    >
      {/* Parallax Background Images */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${heroImages[currentImageIndex]}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Gradient overlay — richer and more cinematic */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Ambient Glow (behind content) */}
      <GlowBackground variant="hero" className="opacity-40" />

      {/* Floating Decorative Elements with Mouse Parallax */}
      {FLOATING_ELEMENTS.map((el, i) => (
        <motion.div
          key={i}
          className="absolute text-white/10"
          style={{
            left: el.x,
            top: el.y,
            x: smoothX,
            y: smoothY,
          }}
          animate={{
            y: [-8, 8, -8],
            rotate: [-3, 3, -3],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: el.delay,
          }}
        >
          <el.Icon className={el.size} />
        </motion.div>
      ))}

      {/* Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity }}
      >
        <motion.div
          className="space-y-8 max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/70 text-xs font-medium tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              Premium Wedding Organizer
            </div>
          </motion.div>

          {/* Main Heading — serif for elegance */}
          <motion.h1
            className="font-serif text-responsive-5xl font-bold text-white leading-[1.1] tracking-tight"
            variants={itemVariants}
          >
            {settings['hero-title'] || 'Your Perfect Wedding Awaits'}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-responsive-xl text-white/75 leading-relaxed max-w-xl mx-auto"
            variants={itemVariants}
          >
            {settings['hero-subtitle'] || 'Create unforgettable memories with our premium wedding planning and design services'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-2"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => navigate('/packages')}
              className="group relative px-8 py-3.5 bg-primary text-white rounded-xl font-semibold text-sm overflow-hidden shadow-2xl shadow-primary/30"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative">
                {settings['hero-button-primary'] || 'Start Planning'}
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/gallery')}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {settings['hero-button-secondary'] || 'View Gallery'}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <button
          onClick={scrollToNext}
          className="flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Enhanced Carousel Indicators */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
        {heroImages.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className="relative h-1 rounded-full overflow-hidden bg-white/20"
            animate={{ width: index === currentImageIndex ? 32 : 8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {index === currentImageIndex && (
              <motion.div
                className="absolute inset-0 bg-white rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 6, ease: "linear" }}
                style={{ transformOrigin: "left" }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </section>
  );
}
