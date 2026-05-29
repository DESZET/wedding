import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building, FileText, Briefcase, CreditCard, Users, Plane, Star, Home, Calendar, CheckCircle, MapPin, Shield } from 'lucide-react';

// Workaround for framer-motion typing mismatch in this project setup
const MotionDiv = motion.div as any;


interface TimelineStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: string;
}

const UMRAH_HAJI_TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    icon: <Building className="w-6 h-6" />,
    title: 'Konsultasi & Pendaftaran',
    description: 'Pertemuan untuk memahami kebutuhan, pilihan paket, dan kesiapan fisik. Kami akan membantu Anda memilih paket yang paling sesuai dengan kebutuhan dan budget.',
    duration: 'Minggu 1',
  },
  {
    id: 2,
    icon: <FileText className="w-6 h-6" />,
    title: 'Pengurusan Dokumen',
    description: 'Bantuan pengurusan paspor, visa, vacc Meningitis, dan dokumen perjalanan lainnya. Tim kami akan guide langkah demi langkah.',
    duration: 'Minggu 2-4',
  },
  {
    id: 3,
    icon: <Briefcase className="w-6 h-6" />,
    title: 'Pemilihan Paket',
    description: 'Penentuan jadwal keberangkatan, hotel, maskapai, dan detail paket. Kami tawarkan opsi terbaik dengan harga kompetitif.',
    duration: 'Minggu 3-5',
  },
  {
    id: 4,
    icon: <CreditCard className="w-6 h-6" />,
    title: 'Pembayaran',
    description: 'Proses DP dan pelunasan dengan berbagai metode pembayaran. Kami sediakan cicilan ringan dengan bunga 0%.',
    duration: 'Minggu 4-6',
  },
  {
    id: 5,
    icon: <Users className="w-6 h-6" />,
    title: 'Briefing & Manasik',
    description: 'Pelatihan manasik umrah/haji, briefing keberangkatan, dan kesiapan fisik. Dipandu oleh ustadz/ustadzah berpengalaman.',
    duration: '1-2 Minggu Sebelum',
  },
  {
    id: 6,
    icon: <Plane className="w-6 h-6" />,
    title: 'Keberangkatan',
    description: 'Penjemputan di airport, perjalanan ke Jeddah/Mekah, dan check-in hotel. Tim kami akan sambut di airport Saudi.',
    duration: 'Hari 1-2',
  },
  {
    id: 7,
    icon: <Star className="w-6 h-6" />,
    title: 'Pelaksanaan Ibadah',
    description: 'Pelaksanaan Umrah/Haji dengan bimbingan intensif. Ziyarat ke berbagai tempat bersejarah dan kota suci.',
    duration: 'Hari 3-12',
  },
  {
    id: 8,
    icon: <Home className="w-6 h-6" />,
    title: 'Kepulangan',
    description: 'Check-out hotel, perjalanan kembali ke Indonesia, danwelcome back. Kami pastikan perjalanan pulang nyaman dan aman.',
    duration: 'Hari 13-14',
  },
];

export default function UmrahHajiTimeline() {
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

    const section = document.getElementById('umrah-haji-timeline');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="umrah-haji-timeline"
      className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50"
      data-testid="umrah-haji-timeline-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Proses Ibadah</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Proses Perjalanan Umrah & Haji
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dari pendaftaran hingga kepulangan, kami akan pendampingan setiap langkah perjalanan spiritual Anda
          </p>
        </MotionDiv>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-emerald-500 to-blue-500" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {UMRAH_HAJI_TIMELINE_STEPS.map((step, index) => (
              <MotionDiv
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                data-testid={`timeline-step-${step.id}`}
              >
                {/* Content Card */}
                <div className="flex-1">
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                  >

                    <div className="inline-block mb-3 px-3 py-1 bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-700 text-sm font-semibold rounded-full">
                      {step.duration}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <MotionDiv
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg"
                  >
                    {step.icon}
                  </MotionDiv>
                  {/* Pulse Effect */}
                  <MotionDiv
                    animate={{

                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.15,
                    }}
                    className="absolute inset-0 bg-blue-500 rounded-full"
                  />

                </div>

                {/* Empty Space for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Features Summary */}
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Berizin Resmi</h4>
            <p className="text-sm text-gray-600">Izin PPIU dan PIHK lengkap dari Kemenag RI</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Bimbingannya Intensif</h4>
            <p className="text-sm text-gray-600">Dipandu ustadz/ustadzah berpengalaman</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Fleksibel</h4>
            <p className="text-sm text-gray-600">Jadwal keberangkatan banyak pilihan</p>
          </div>
        </MotionDiv>

     

      
      </div>
    </section>
  );
}
