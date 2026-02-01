import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PARTNERS = [
  { id: 1, name: 'Luxury Hotels', logo: '🏨' },
  { id: 2, name: 'Premium Catering', logo: '🍽️' },
  { id: 3, name: 'Top Photographers', logo: '📸' },
  { id: 4, name: 'Best Entertainment', logo: '🎵' },
  { id: 5, name: 'Elite Decorators', logo: '🎨' },
  { id: 6, name: 'Fashion Brands', logo: '👗' },
  { id: 7, name: 'Makeup Artists', logo: '💄' },
  { id: 8, name: 'Transport Services', logo: '🚗' },
];

export default function TrustBadges() {
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

    const section = document.getElementById('partners');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="partners"
      className="py-16 px-4 bg-gray-50"
      data-testid="partners-section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Dipercaya oleh Partner Terbaik
          </h3>
          <p className="text-muted-foreground">
            Kami bekerja sama dengan vendor dan supplier terbaik di industri
          </p>
        </motion.div>

        {/* Scrolling Animation */}
        <div className="relative overflow-hidden">
          <div className="flex gap-12 animate-scroll">
            {/* Duplicate for infinite scroll effect */}
            {[...PARTNERS, ...PARTNERS].map((partner, index) => (
              <motion.div
                key={`${partner.id}-${index}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: (index % PARTNERS.length) * 0.1 }}
                className="flex-shrink-0 w-32 h-32 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow flex flex-col items-center justify-center gap-2 group"
                data-testid={`partner-badge-${partner.id}`}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-5xl"
                >
                  {partner.logo}
                </motion.div>
                <p className="text-xs font-semibold text-center text-muted-foreground group-hover:text-primary transition-colors">
                  {partner.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Certifications/Awards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: '🏆', text: 'Best Wedding Organizer 2024' },
            { icon: '⭐', text: 'Customer Choice Award' },
            { icon: '✓', text: 'ISO Certified' },
            { icon: '💎', text: 'Premium Service Provider' },
          ].map((badge, index) => (
            <motion.div
              key={badge.text}
              whileHover={{ y: -5 }}
              className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md"
              data-testid={`certification-${index}`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-sm font-semibold text-foreground">{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
