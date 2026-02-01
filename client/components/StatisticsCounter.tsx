import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ end, duration = 2, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOutExpo * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref}>
      {prefix}{count}{suffix}
    </div>
  );
}

export default function StatisticsCounter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('statistics');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const stats = [
    { label: 'Pernikahan Sukses', value: 500, suffix: '+', icon: '💒' },
    { label: 'Tahun Pengalaman', value: 10, suffix: '+', icon: '⭐' },
    { label: 'Kepuasan Klien', value: 98, suffix: '%', icon: '😊' },
    { label: 'Vendor Partner', value: 100, suffix: '+', icon: '🤝' },
  ];

  return (
    <section
      id="statistics"
      className="py-20 px-4 bg-gradient-to-r from-primary via-primary/90 to-primary text-white"
      data-testid="statistics-section"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Prestasi Kami dalam Angka
          </h2>
          <p className="text-lg text-primary-foreground/90">
            Kepercayaan klien adalah bukti kualitas layanan kami
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
              data-testid={`stat-item-${index}`}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="text-6xl mb-4"
              >
                {stat.icon}
              </motion.div>
              <div className="text-5xl md:text-6xl font-bold mb-2">
                <AnimatedCounter
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2.5}
                />
              </div>
              <p className="text-lg font-medium text-primary-foreground/90">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
