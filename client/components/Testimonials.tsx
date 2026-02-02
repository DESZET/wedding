import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
  date: string;
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('testimonials');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        const data = await response.json();
        if (data.success) {
          setTestimonials(data.data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        handleNext();
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [currentIndex, testimonials.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section
      id="testimonials"
      className="py-20 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden"
      data-testid="testimonials-section"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Apa Kata Klien Kami?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kepuasan klien adalah prioritas utama kami. Dengar cerita mereka!
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {testimonials.length > 0 ? (
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
              >
              {/* Quote Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Quote className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < testimonials[currentIndex].rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-center text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Client Info */}
              <div className="flex flex-col items-center">
                <img
                  src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop"
                  alt={testimonials[currentIndex].name}
                  className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-primary/20"
                />
                <h4 className="text-xl font-bold text-foreground mb-1">
                  {testimonials[currentIndex].name}
                </h4>
                <p className="text-sm text-muted-foreground mb-1">
                  Pasangan Pengantin
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonials[currentIndex].date}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          ) : (
            <div className="text-center text-muted-foreground">
              Loading testimonials...
            </div>
          )}

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-colors z-10"
            data-testid="testimonial-prev-button"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-colors z-10"
            data-testid="testimonial-next-button"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
              }`}
              data-testid={`testimonial-indicator-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
