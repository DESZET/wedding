import { useState, useEffect } from "react";
import {
  Sparkles, Calendar, Users, Shield, Heart, Phone, Clock, ArrowRight,
  ChevronDown, Check, MessageCircle, FileText, Award, TrendingUp,
  HelpCircle, Quote, Star, CheckCircle2, ChevronRight
} from "lucide-react";
import Packages from "@/components/Packages";
import Timeline from "@/components/Timeline";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import ReviewSection from "@/components/ReviewSection";
import { useSettings } from "@/hooks/useSettings";

export default function PackagesPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const whatsappNumber = settings["wedding-whatsapp"] ? settings["wedding-whatsapp"].replace(/\D/g, "") : (settings["whatsapp"] ? settings["whatsapp"].replace(/\D/g, "") : "6285329077987");
  const defaultMessage = settings["wedding-whatsapp-message"] || "Halo! Saya tertarik untuk berkonsultasi mengenai paket pernikahan premium di Galeria Wedding. Bisakah kita berdiskusi lebih lanjut?";

  const stats = [
    { icon: <Users className="w-8 h-8 text-primary" />, value: settings["wedding-stat-1-val"] || "500+", label: settings["wedding-stat-1-lbl"] || "Pernikahan Sukses" },
    { icon: <Award className="w-8 h-8 text-primary" />, value: settings["wedding-stat-2-val"] || "10+", label: settings["wedding-stat-2-lbl"] || "Tahun Pengalaman" },
    { icon: <Heart className="w-8 h-8 text-primary" />, value: settings["wedding-stat-3-val"] || "98%", label: settings["wedding-stat-3-lbl"] || "Kepuasan Klien" },
    { icon: <Shield className="w-8 h-8 text-primary" />, value: settings["wedding-stat-4-val"] || "100%", label: settings["wedding-stat-4-lbl"] || "Vendor Berlisensi" }
  ];

  const processes = [
    {
      step: "01",
      title: settings["wedding-proc-1-title"] || "Konsultasi Konsep",
      desc: settings["wedding-proc-1-desc"] || "Diskusikan tema pernikahan impian Anda, estimasi jumlah tamu, serta rancangan anggaran bersama perencana pernikahan profesional kami."
    },
    {
      step: "02",
      title: settings["wedding-proc-2-title"] || "Pemilihan Vendor",
      desc: settings["wedding-proc-2-desc"] || "Kami membantu mengoordinasikan pilihan tempat (venue), dekorasi estetik, katering lezat, gaun pengantin, tata rias, dan dokumentasi terbaik."
    },
    {
      step: "03",
      title: settings["wedding-proc-3-title"] || "Koordinasi Hari H",
      desc: settings["wedding-proc-3-desc"] || "Tim wedding organizer kami siap mengoordinasikan seluruh alur acara secara mendetail sejak pagi hari hingga resepsi usai agar berjalan sempurna."
    }
  ];

  const whyUs = [
    {
      title: settings["wedding-why-1-title"] || "Kustomisasi Desain & Paket",
      desc: settings["wedding-why-1-desc"] || "Semua detail pernikahan dapat disesuaikan sepenuhnya agar merepresentasikan keunikan cinta Anda berdua."
    },
    {
      title: settings["wedding-why-2-title"] || "Jaringan Vendor Premium",
      desc: settings["wedding-why-2-desc"] || "Bekerja sama dengan ratusan vendor dekorasi, katering, rias, dan dokumentasi terbaik yang telah teruji kualitasnya."
    },
    {
      title: settings["wedding-why-3-title"] || "Tim Organizer Terlatih",
      desc: settings["wedding-why-3-desc"] || "Tim lapangan kami sigap, profesional, dan berpengalaman dalam mengatasi situasi darurat di hari H."
    },
    {
      title: settings["wedding-why-4-title"] || "Transparansi Biaya & Kontrak",
      desc: settings["wedding-why-4-desc"] || "Semua alokasi biaya direncanakan secara transparan tanpa ada biaya tersembunyi yang mendadak."
    }
  ];

  const faqs = [
    {
      question: settings["wedding-faq-1-q"] || "Apakah item di dalam paket pernikahan bisa diubah atau dikustomisasi?",
      answer: settings["wedding-faq-1-a"] || "Tentu saja! Kami sangat fleksibel. Semua paket pernikahan kami bersifat kustomisasi penuh. Anda dapat menambah, mengurangi, atau mengganti item di dalam paket sesuai dengan konsep, jumlah tamu undangan, dan anggaran pernikahan Anda."
    },
    {
      question: settings["wedding-faq-2-q"] || "Kapan waktu terbaik untuk mulai menggunakan jasa wedding organizer?",
      answer: settings["wedding-faq-2-a"] || "Waktu terbaik adalah sekitar 6 hingga 12 bulan sebelum hari pernikahan. Ini memberikan waktu yang sangat cukup untuk mengamankan vendor utama seperti venue impian, dekorator terfavorit, serta perizinan secara tenang tanpa terburu-buru."
    },
    {
      question: settings["wedding-faq-3-q"] || "Apakah Galeria Wedding melayani pernikahan di luar kota?",
      answer: settings["wedding-faq-3-a"] || "Ya, kami sangat senang melayani pernikahan destinasi di luar kota maupun luar pulau. Tim planner kami siap berkoordinasi dan melakukan survei lokasi dengan penyesuaian biaya transportasi dan akomodasi tim di lokasi acara."
    },
    {
      question: settings["wedding-faq-4-q"] || "Bagaimana sistem pembayaran dan terminasi kontrak?",
      answer: settings["wedding-faq-4-a"] || "Pembayaran dilakukan secara bertahap untuk kemudahan Anda: Booking fee awal sebesar 30% untuk mengamankan tanggal, 40% setelah semua vendor terkonfirmasi, dan pelunasan 30% maksimal 2 minggu sebelum hari bahagia diselenggarakan."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* 3. Packages Grid (Dynamically loaded component) */}
      <SectionWrapper id="packages-list" delay={100} animationType="fade-in-up">
        <Packages />
      </SectionWrapper>

      {/* 4. Timeline (Dynamically loaded component) */}
      <SectionWrapper id="packages-timeline" delay={200} animationType="fade-in-up">
        <Timeline />
      </SectionWrapper>

      {/* 5. Why Choose Galeria Wedding */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="max-w-7xl mx-auto px-4">
          <SectionWrapper id="why-wedding-header" delay={100} animationType="fade-in-up">
            <div className="text-center mb-16">
              {settings["wedding-why-title"] ? (
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {settings["wedding-why-title"]}
                </h2>
              ) : (
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Mengapa Memilih <span className="text-primary font-serif">Galeria Wedding?</span>
                </h2>
              )}
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {settings["wedding-why-desc"] || "Komitmen penuh kami dalam merancang dan menyempurnakan kenangan terindah hidup Anda"}
              </p>
            </div>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map((item, idx) => (
              <SectionWrapper key={idx} id={`why-${idx}`} delay={200 + idx * 100} animationType="fade-in-up">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-6">
                      <Check className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm mb-4">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider">
                    <span>Terjamin Kualitas</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-4">
          <SectionWrapper id="faq-wedding-header" delay={100} animationType="fade-in-up">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-slate-800">
                {settings["wedding-faq-title"] || "Pertanyaan Umum"}
              </h2>
              <p className="text-lg text-slate-500">
                {settings["wedding-faq-subtitle"] || "Jawaban lengkap seputar perencanaan pernikahan bersama Galeria Wedding"}
              </p>
            </div>
          </SectionWrapper>

          <SectionWrapper id="faq-wedding-content" delay={200} animationType="fade-in-up">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:bg-slate-50/80"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 hover:text-primary transition-colors"
                  >
                    <span className="font-semibold text-lg text-slate-800 leading-snug">{faq.question}</span>
                    <ChevronRight
                      className={`w-6 h-6 text-slate-400 flex-shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-90 text-primary' : ''}`}
                    />
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-6 pt-1 text-slate-600 leading-relaxed text-sm animate-slide-up">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* 7. Reviews Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="max-w-7xl mx-auto px-4">
          <SectionWrapper id="wedding-reviews" delay={100} animationType="fade-in-up">
            <ReviewSection
              type="wedding"
              itemId={0}
              itemName="Layanan Wedding Organizer"
              accent="primary"
            />
          </SectionWrapper>
        </div>
      </section>

      {/* 8. Elegant Call-To-Action Banner */}
      <section className="py-20 bg-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Rose background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <SectionWrapper id="cta-wedding" delay={100} animationType="scale-in">
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6">
              {settings["wedding-cta-title"] || "Siap Mewujudkan Pernikahan Impian Anda?"}
            </h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 opacity-80 font-light leading-relaxed">
              {settings["wedding-cta-desc"] || "Konsultasikan konsep tema impian, detail akomodasi, katering, serta estimasi anggaran secara lengkap. Tim perencana pernikahan kami siap membantu mewujudkannya dengan sempurna."}
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-primary text-white hover:bg-primary-foreground text-lg font-bold rounded-full shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1 inline-flex items-center gap-3"
            >
              <MessageCircle size={22} className="fill-white text-primary" />
              <span>Mulai Konsultasi Gratis Sekarang</span>
            </a>
          </SectionWrapper>
        </div>
      </section>

      <Footer />
    </div>
  );
}
