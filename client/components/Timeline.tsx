import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Palette, CheckCircle, Sparkles, Heart } from 'lucide-react';

interface TimelineStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    icon: <Calendar className="w-6 h-6" />,
    title: 'Konsultasi Awal',
    description: 'Pertemuan untuk memahami visi, budget, dan kebutuhan Anda. Kami akan mendengarkan semua ide dan harapan Anda untuk hari istimewa tersebut.',
    duration: 'Minggu 1',
  },
  {
    id: 2,
    icon: <Palette className="w-6 h-6" />,
    title: 'Design & Planning',
    description: 'Pembuatan konsep desain, mood board, dan timeline detail. Kami akan merancang tema dan konsep yang sesuai dengan kepribadian Anda.',
    duration: 'Minggu 2-4',
  },
  {
    id: 3,
    icon: <Users className="w-6 h-6" />,
    title: 'Seleksi Vendor',
    description: 'Pemilihan dan koordinasi dengan vendor terbaik untuk catering, dekorasi, entertainment, dan kebutuhan lainnya sesuai budget.',
    duration: 'Minggu 5-8',
  },
  {
    id: 4,
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Detail Execution',
    description: 'Finalisasi semua detail, fitting pakaian, rehearsal, dan persiapan akhir. Memastikan tidak ada yang terlewat.',
    duration: 'Minggu 9-12',
  },
  {
    id: 5,
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Final Check',
    description: 'Pengecekan terakhir semua vendor, venue, dan rundown acara. Tim kami pastikan semuanya ready untuk hari besar Anda.',
    duration: '1 Minggu Sebelum',
  },
  {
    id: 6,
    icon: <Heart className="w-6 h-6" />,
    title: 'Hari Istimewa',
    description: 'Tim koordinator kami akan memastikan acara berjalan sempurna dari awal hingga akhir. Anda tinggal menikmati momen indah bersama orang terkasih.',
    duration: 'Hari H',
  },
];

export default function Timeline() {
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

    const section = document.getElementById('timeline');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="timeline"
      className="py-20 px-4 bg-gradient-to-br from-primary/5 via-white to-primary/10"
      data-testid="timeline-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Proses Perencanaan Pernikahan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dari konsultasi pertama hingga hari istimewa Anda, kami akan mendampingi setiap langkah
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary via-primary/50 to-primary" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {TIMELINE_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                data-testid={`timeline-step-${step.id}`}
              >
                {/* Content Card */}
                <div className="flex-1">
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <div className="inline-block mb-3 px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                      {step.duration}
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white shadow-lg"
                  >
                    {step.icon}
                  </motion.div>
                  {/* Pulse Effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                    className="absolute inset-0 bg-primary rounded-full"
                  />
                </div>

                {/* Empty Space for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-16"
        >
          <button
            onClick={() =>
              document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
            data-testid="timeline-cta-button"
          >
            Mulai Perencanaan Sekarang
          </button>
        </motion.div>
      </div>
    </section>
  );
}
