import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    question: 'Berapa lama waktu yang dibutuhkan untuk mempersiapkan pernikahan?',
    answer: 'Idealnya, perencanaan pernikahan dimulai 6-12 bulan sebelum hari H. Namun, kami juga dapat membantu pernikahan dengan persiapan lebih singkat. Semakin cepat Anda memulai, semakin banyak pilihan vendor dan venue yang tersedia.',
  },
  {
    id: 2,
    question: 'Apa saja yang termasuk dalam paket wedding organizer?',
    answer: 'Setiap paket mencakup konsultasi pernikahan, koordinasi vendor, desain dan dekorasi, manajemen timeline, dan koordinator hari H. Paket yang lebih premium mencakup layanan tambahan seperti pre-wedding photoshoot, entertainment, dan layanan personalisasi eksklusif.',
  },
  {
    id: 3,
    question: 'Apakah saya bisa kustomisasi paket sesuai kebutuhan?',
    answer: 'Tentu saja! Kami sangat fleksibel dan dapat menyesuaikan paket sesuai dengan kebutuhan dan budget Anda. Kami juga menawarkan paket custom untuk kebutuhan yang lebih spesifik. Hubungi kami untuk konsultasi gratis.',
  },
  {
    id: 4,
    question: 'Berapa minimal jumlah tamu yang bisa ditangani?',
    answer: 'Kami dapat menangani pernikahan dengan berbagai skala, mulai dari intimate wedding dengan 50 tamu hingga grand wedding dengan 500+ tamu. Tim kami berpengalaman dalam mengelola acara berbagai ukuran dengan standar kualitas yang sama.',
  },
  {
    id: 5,
    question: 'Bagaimana sistem pembayaran untuk paket wedding organizer?',
    answer: 'Sistem pembayaran kami sangat fleksibel. Biasanya kami meminta booking fee 30% di awal, cicilan 40% sebelum 3 bulan dari hari H, dan pelunasan 30% sebelum 1 bulan dari acara. Kami juga bisa diskusikan opsi pembayaran lain yang sesuai dengan kondisi Anda.',
  },
  {
    id: 6,
    question: 'Apakah vendor bisa dari pilihan sendiri?',
    answer: 'Tentu! Kami sangat terbuka jika Anda sudah memiliki vendor pilihan sendiri. Kami akan berkoordinasi dengan vendor pilihan Anda untuk memastikan semuanya berjalan lancar. Namun, kami juga memiliki network vendor terpercaya jika Anda membutuhkan rekomendasi.',
  },
  {
    id: 7,
    question: 'Bagaimana jika ada perubahan rencana mendadak?',
    answer: 'Kami memahami bahwa perubahan bisa terjadi. Tim kami sangat responsif dan siap membantu menangani perubahan rencana. Kami akan bekerja sama dengan Anda dan vendor terkait untuk memastikan perubahan dapat dilakukan dengan smooth dan sesuai timeline.',
  },
  {
    id: 8,
    question: 'Apakah ada garansi jika terjadi masalah di hari H?',
    answer: 'Kami memiliki tim koordinator berpengalaman yang akan standby di hari H untuk memastikan semuanya berjalan sempurna. Jika ada masalah, tim kami akan segera menangani dengan cepat dan profesional. Kami juga memiliki backup plan untuk berbagai skenario.',
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('faq');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const toggleItem = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="py-20 px-4 bg-background"
      data-testid="faq-section"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p className="text-lg text-muted-foreground">
            Temukan jawaban untuk pertanyaan umum seputar layanan kami
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              data-testid={`faq-item-${item.id}`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                data-testid={`faq-question-${item.id}`}
              >
                <span className="text-lg font-semibold text-foreground pr-8">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: openId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-6 h-6 text-primary" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl"
        >
          <p className="text-lg text-foreground mb-4">
            Masih ada pertanyaan lain?
          </p>
          <button
            onClick={() =>
              document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            data-testid="faq-cta-button"
          >
            Hubungi Kami Sekarang
          </button>
        </motion.div>
      </div>
    </section>
  );
}
