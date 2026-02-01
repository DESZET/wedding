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
    icon: <Palette className="w-8 h-8" />,
    title: "Decoration & Design",
    description: "Transform your vision into a stunning reality",
    color: "from-purple-500 to-pink-500",
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
    icon: <Sparkles className="w-8 h-8" />,
    title: "Bridal & Makeup",
    description: "Look your absolute best on your special day",
    color: "from-rose-500 to-pink-500",
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
    icon: <Utensils className="w-8 h-8" />,
    title: "Catering Services",
    description: "Delicious food that matches your style",
    color: "from-orange-500 to-red-500",
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
    icon: <Music className="w-8 h-8" />,
    title: "Entertainment",
    description: "Keep your guests entertained all night",
    color: "from-blue-500 to-purple-500",
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
    icon: <Camera className="w-8 h-8" />,
    title: "Photography & Video",
    description: "Capture every precious moment",
    color: "from-green-500 to-teal-500",
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
    icon: <Heart className="w-8 h-8" />,
    title: "Event Coordination",
    description: "Everything managed with love and care",
    color: "from-red-500 to-pink-500",
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
      staggerChildren: 0.2,
      delayChildren: 0.1,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
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
      className="py-20 px-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden"
      data-testid="services-section"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-responsive-4xl font-bold text-gradient mb-4">
            Our Services
          </h2>
          <p className="text-responsive-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive wedding planning solutions tailored to your needs
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />

              {/* Card */}
              <div className="glass rounded-2xl p-8 h-full hover-glow relative z-10">
                {/* Icon with gradient background */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br ${service.color} text-white shadow-lg`}
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {service.icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Details List with animations */}
                <motion.ul
                  className="space-y-3"
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.3 + index * 0.1,
                      }
                    }
                  }}
                >
                  {service.details.map((detail, idx) => (
                    <motion.li
                      key={idx}
                      className="flex items-center gap-3 text-sm text-foreground/80"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.4 }
                        }
                      }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.span
                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`}
                        whileHover={{ scale: 1.5 }}
                        transition={{ duration: 0.2 }}
                      />
                      {detail}
                    </motion.li>
                  ))}
                </motion.ul>

                {/* Hover effect line */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} rounded-b-2xl`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />
              </div>
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
              document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover-lift hover-glow text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Today
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
