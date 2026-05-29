import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Utensils,
  Music,
  Camera,
  Palette,
  Heart,
} from "lucide-react";
import TiltCard from "./TiltCard";
import GlowBackground from "./GlowBackground";
import AnimatedHeading from "./AnimatedHeading";

interface Service {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  details: string[];
}

const SERVICES: Service[] = [
  {
    id: 1,
    icon: <Palette className="w-7 h-7" />,
    title: "Decoration & Design",
    description: "Transform your vision into a stunning reality",
    color: "from-violet-500 to-purple-500",
    details: [
      "Full venue decoration",
      "Theme consultation",
      "Floral arrangements",
      "Lighting design",
      "Seating arrangements",
    ],
  },
  {
    id: 2,
    icon: <Sparkles className="w-7 h-7" />,
    title: "Bridal & Makeup",
    description: "Look your absolute best on your special day",
    color: "from-rose-400 to-pink-500",
    details: [
      "Professional makeup",
      "Hair styling",
      "Bridal consultation",
      "Trial sessions",
      "Touch-up service",
    ],
  },
  {
    id: 3,
    icon: <Utensils className="w-7 h-7" />,
    title: "Catering Services",
    description: "Delicious food that matches your style",
    color: "from-amber-400 to-orange-500",
    details: [
      "Menu planning",
      "Premium ingredients",
      "Dietary accommodations",
      "Bar service",
      "Staff & service",
    ],
  },
  {
    id: 4,
    icon: <Music className="w-7 h-7" />,
    title: "Entertainment",
    description: "Keep your guests entertained all night",
    color: "from-blue-500 to-cyan-500",
    details: [
      "DJ & live music",
      "MC services",
      "Dance floor setup",
      "Sound system",
      "Entertainment coordination",
    ],
  },
  {
    id: 5,
    icon: <Camera className="w-7 h-7" />,
    title: "Photography & Video",
    description: "Capture every precious moment",
    color: "from-emerald-500 to-teal-500",
    details: [
      "Professional photographers",
      "Videography",
      "Drone footage",
      "Photo editing",
      "Digital album",
    ],
  },
  {
    id: 6,
    icon: <Heart className="w-7 h-7" />,
    title: "Event Coordination",
    description: "Everything managed with love and care",
    color: "from-red-400 to-rose-500",
    details: [
      "Complete planning",
      "Timeline management",
      "Vendor coordination",
      "Day-of coordination",
      "Problem solving",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
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

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    const section = document.getElementById("services");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      className="relative py-24 px-4 overflow-hidden mesh-gradient"
      data-testid="services-section"
    >
      <GlowBackground variant="section" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <AnimatedHeading
            text="Our Services"
            className="text-responsive-4xl font-bold text-gradient mb-5"
          />
          <motion.p
            className="text-responsive-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Comprehensive wedding planning solutions tailored to your needs
          </motion.p>
        </div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {SERVICES.map((service) => (
            <motion.div key={service.id} variants={cardVariants}>
              <TiltCard className="h-full" tiltAmount={5}>
                <div className="glass-card glow-border rounded-2xl p-7 h-full relative group transition-all duration-500">
                  {/* Accent top line */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${service.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`inline-flex p-3.5 rounded-xl mb-5 bg-gradient-to-br ${service.color} text-white shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {service.icon}
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Details List */}
                  <ul className="space-y-2.5">
                    {service.details.map((detail, idx) => (
                      <motion.li
                        key={idx}
                        className="flex items-center gap-2.5 text-sm text-foreground/75"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          delay: 0.4 + idx * 0.05,
                          duration: 0.3,
                        }}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.color} flex-shrink-0`}
                        />
                        {detail}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.button
            onClick={() => {
              document
                .getElementById("booking")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold overflow-hidden shadow-xl shadow-primary/20 btn-magnetic"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">Get Started Today</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
