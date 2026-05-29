import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Palette, FileImage, Printer, 
  Scissors, CheckCircle, Package, Truck,
  Sparkles, Clock, Shield, ThumbsUp
} from 'lucide-react';

interface TimelineStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: string;
}

const PRINTING_TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'Konsultasi & Pemesanan',
    description: 'Diskusi awal untuk memahami kebutuhan Anda. Kami akan membantu memilih produk yang tepat, menentukan spesifikasi, dan memberikanestimasi harga yang sesuai dengan budget Anda.',
    duration: 'Hari 1',
  },
  {
    id: 2,
    icon: <Palette className="w-6 h-6" />,
    title: 'Design & Konsep',
    description: 'Tim desain profesional kami akan membuatkan konsep desain sesuai kebutuhan. Free revisi hingga 2x untuk memastikan desain sesuai dengan ekspektasi Anda.',
    duration: 'Hari 2-5',
  },
  {
    id: 3,
    icon: <FileImage className="w-6 h-6" />,
    title: 'Persiapan File Printing',
    description: 'Persiapan file akhir untuk cetak termasuk color correction, setting bleed, dan pre-press. Kami pastikan file siap cetak dengan kualitas optimal.',
    duration: 'Hari 3-4',
  },
  {
    id: 4,
    icon: <Printer className="w-6 h-6" />,
    title: 'Proses Printing',
    description: 'Proses pencetakan menggunakan mesin berkualitas tinggi dengan teknologi modern. Monitoring kualitas dilakukan secara berkala untuk memastikan hasil cetak maksimal.',
    duration: 'Hari 4-6',
  },
  {
    id: 5,
    icon: <Scissors className="w-6 h-6" />,
    title: 'Finishing',
    description: 'Proses finishing meliputi pemotongan, laminasi (glossy/matte), embossing, foil printing, penjilidan, dan proses akhir lainnya sesuai kebutuhan produk.',
    duration: 'Hari 5-7',
  },
  {
    id: 6,
    icon: <CheckCircle className="w-6 h-6" />,
    title: 'Quality Control',
    description: 'Tim QC kami melakukan inspeksi ketat untuk memastikan setiap produkpercetakan memenuhi standar kualitas. Setiap cacat akan diperbaiki sebelum packing.',
    duration: 'Hari 6-7',
  },
  {
    id: 7,
    icon: <Package className="w-6 h-6" />,
    title: 'Packaging',
    description: 'Produk dikemas dengan aman menggunakan material packaging yang berkualitas. Kami pastikan produk terlindungi dari kerusakan selama pengiriman.',
    duration: 'Hari 7',
  },
  {
    id: 8,
    icon: <Truck className="w-6 h-6" />,
    title: 'Pengiriman',
    description: 'Produk dikirim melalui kurir pilihan (JNE, J&T, SiCepat) dengan layanan terbaik. Tracking number akan diberikan untuk memantau status pengiriman.',
    duration: 'Hari 7-10',
  },
];

export default function PrintingTimeline() {
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

    const section = document.getElementById('printing-timeline');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="printing-timeline"
      className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50"
      data-testid="printing-timeline-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Proses Produksi</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Timeline Proses Percetakan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami menyediakan layanan percetakan lengkap dengan 9 kategori produk: Undangan Pernikahan, Sablon Kaos, Banner & Spanduk, ID Card, Kartu Nama, Brosur & Flyer, Stiker & Label, Kemasan Produk, dan Merchandise Lainnya. Cara pemesanan sangat mudah: pilih produk yang Anda butuhkan, konsultasikan desain dengan tim kami, dan kami akan memproses pesanan Anda dengan cepat dan profesional.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {PRINTING_TIMELINE_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                data-testid={`printing-timeline-step-${step.id}`}
              >
                {/* Content Card */}
                <div className="flex-1">
                  <div
                    className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                  >
                    <div className="inline-block mb-3 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full">
                      {step.duration}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg"
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
                      delay: index * 0.15,
                    }}
                    className="absolute inset-0 bg-blue-500 rounded-full"
                  />
                </div>

                {/* Empty Space for alternating layout */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Desain Gratis</h4>
            <p className="text-sm text-gray-600">Free desain untuk order minimal Rp 300rb</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Kualitas Terjamin</h4>
            <p className="text-sm text-gray-600">Mesin printing modern & bahan berkualitas</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-pink-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Garansi Kualitas</h4>
            <p className="text-sm text-gray-600">100% garansi ganti produk cacat</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Pengiriman Cepat</h4>
            <p className="text-sm text-gray-600">Kirim ke seluruh Indonesia</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
