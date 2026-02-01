import { useEffect, useState } from "react";
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
  details: string[];
}

const SERVICES: Service[] = [
  {
    id: 1,
    icon: <Palette className="w-8 h-8" />,
    title: "Decoration & Design",
    description: "Transform your vision into a stunning reality",
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
    details: [
      "Complete planning",
      "Timeline management",
      "Vendor coordination",
      "Day-of coordination",
      "Problem solving",
    ],
  },
];

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("services");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      className={`py-20 px-4 bg-background transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive wedding planning solutions tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className={`p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {/* Icon */}
              <div className="mb-4 inline-block p-3 bg-primary/10 text-primary rounded-lg">
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{service.description}</p>

              {/* Details List */}
              <ul className="space-y-2">
                {service.details.map((detail, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
