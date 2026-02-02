import { useEffect, useState, useRef } from "react";
import { ChevronDown, Sparkles, Heart } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSettings } from "../hooks/useSettings";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1519225421214-51d4eb6e72d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1506574216779-a79c4a5b86c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
];

export default function Hero() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-carousel for images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const scrollToGallery = () => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 4,
        repeat: Infinity
      }
    }
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative h-screen w-full overflow-hidden bg-gray-900"
      data-testid="hero-section"
    >
      {/* Parallax Background Images with Overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${HERO_IMAGES[currentImageIndex]}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-20 text-white/20"
        variants={floatingVariants}
        animate="animate"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      <motion.div
        className="absolute top-32 right-32 text-white/20"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
      >
        <Heart className="w-6 h-6" />
      </motion.div>

      <motion.div
        className="absolute bottom-40 left-32 text-white/20"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
      >
        <Sparkles className="w-10 h-10" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-center px-4 text-center"
        style={{ opacity }}
      >
        <motion.div
          className="space-y-6 max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Main Heading */}
          <motion.h1
            className="text-responsive-5xl font-bold text-white leading-tight"
            variants={itemVariants}
          >
            {settings['hero-title'] || 'Your Perfect Wedding Awaits'}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-responsive-xl text-gray-100"
            variants={itemVariants}
          >
            {settings['hero-subtitle'] || 'Create unforgettable memories with our premium wedding planning and design services'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            variants={itemVariants}
          >
            <motion.button
              onClick={() =>
                document
                  .getElementById("booking")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover-lift hover-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {settings['hero-button-primary'] || 'Start Planning'}
            </motion.button>
            <motion.button
              onClick={() =>
                document
                  .getElementById("gallery")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-3 bg-white text-foreground rounded-md font-semibold hover-lift hover-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {settings['hero-button-secondary'] || 'View Gallery'}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <button onClick={scrollToGallery} className="text-white">
          <ChevronDown className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Enhanced Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {HERO_IMAGES.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentImageIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75 w-2"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </section>
  );
}
