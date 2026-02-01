import { Check } from "lucide-react";
import { useEffect, useState } from "react";

interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
}

const PACKAGES: Package[] = [
  {
    id: 1,
    name: "Essential",
    price: 5000000,
    description: "Perfect for intimate gatherings",
    features: [
      "Decoration planning",
      "Venue coordination",
      "Up to 100 guests",
      "Basic makeup & styling",
      "Day-of coordination",
      "Simple catering package",
    ],
    highlighted: false,
  },
  {
    id: 2,
    name: "Premium",
    price: 10000000,
    description: "Our most popular choice",
    features: [
      "Complete decoration design",
      "Venue & vendor coordination",
      "Up to 300 guests",
      "Professional makeup & styling team",
      "Full day coordination",
      "Premium catering & bar service",
      "Photography package",
      "Entertainment services",
    ],
    highlighted: true,
  },
  {
    id: 3,
    name: "Luxury",
    price: 20000000,
    description: "The ultimate wedding experience",
    features: [
      "Bespoke decoration design",
      "Premium venue selection",
      "Unlimited guests",
      "Elite makeup & styling team",
      "Complete day & rehearsal coordination",
      "Luxury catering & exclusive bar",
      "Professional photography & videography",
      "Live entertainment & DJ",
      "Wedding planner consultation",
      "Post-wedding support",
    ],
    highlighted: false,
  },
];

export default function Packages() {
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

    const section = document.getElementById("packages");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      id="packages"
      className={`py-20 px-4 bg-gray-50 transition-all duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our Packages
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect package for your dream wedding
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKAGES.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`rounded-lg overflow-hidden transition-all duration-500 ${
                pkg.highlighted
                  ? "md:scale-105 bg-foreground text-white shadow-2xl"
                  : "bg-white text-foreground shadow-lg hover:shadow-xl"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: `${index * 150}ms`,
              }}
            >
              {/* Featured Badge */}
              {pkg.highlighted && (
                <div className="bg-primary text-primary-foreground text-center py-2 font-semibold text-sm">
                  Most Popular
                </div>
              )}

              {/* Package Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p
                  className={`text-sm mb-6 ${
                    pkg.highlighted ? "text-gray-200" : "text-muted-foreground"
                  }`}
                >
                  {pkg.description}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-4xl font-bold">{formatPrice(pkg.price)}</p>
                  <p
                    className={`text-sm mt-2 ${
                      pkg.highlighted
                        ? "text-gray-200"
                        : "text-muted-foreground"
                    }`}
                  >
                    Complete package
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() =>
                    document
                      .getElementById("booking")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`w-full py-3 rounded-md font-semibold transition-colors mb-8 ${
                    pkg.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  Choose Package
                </button>

                {/* Features List */}
                <div className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
