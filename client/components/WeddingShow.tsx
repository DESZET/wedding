import { useState, useEffect, useRef } from "react";
import { Play, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { VenueItem, WeddingShowVideoItem } from "../../shared/api";

export default function WeddingShow() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [isVenuesVisible, setIsVenuesVisible] = useState(true);
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [weddingShowVideo, setWeddingShowVideo] = useState<WeddingShowVideoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const venuesRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch venues and wedding show video from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch venues
        const venuesResponse = await fetch('/api/venues');
        const venuesData = await venuesResponse.json();
        if (venuesData.success) {
          setVenues(venuesData.data);
        }

        // Fetch wedding show video
        const weddingShowVideosResponse = await fetch('/api/wedding-show-videos');
        const weddingShowVideosData = await weddingShowVideosResponse.json();
        if (weddingShowVideosData.success && weddingShowVideosData.data.length > 0) {
          // Take the first wedding show video
          setWeddingShowVideo(weddingShowVideosData.data[0]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Parallax effect for background
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // Intersection Observers untuk setiap bagian dengan ROOT MARGIN
  useEffect(() => {
    let headerObserver: IntersectionObserver;
    let videoObserver: IntersectionObserver;
    let venuesObserver: IntersectionObserver;
    let infoObserver: IntersectionObserver;

    // Inisialisasi observers dengan delay
    const initObservers = () => {
      // Header - muncul segera
      headerObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsHeaderVisible(true);
          }
        },
        { 
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px" // Delay sedikit
        }
      );

      // Video - muncul setelah header
      videoObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Tunggu header muncul dulu
            setTimeout(() => {
              setIsVideoVisible(true);
            }, 500);
          }
        },
        { 
          threshold: 0.2,
          rootMargin: "-100px 0px -150px 0px" // Delay lebih panjang
        }
      );

      // Venues - muncul jauh setelah video
      venuesObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Tunggu lebih lama agar user benar-benar scroll ke bawah
            setTimeout(() => {
              setIsVenuesVisible(true);
            }, 300);
          }
        },
        { 
          threshold: 0.3,
          rootMargin: "-200px 0px -200px 0px" // Jarak yang jauh dari top
        }
      );

      // Info - muncul paling akhir
      infoObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Tunggu venues muncul dulu
            setTimeout(() => {
              setIsInfoVisible(true);
            }, 400);
          }
        },
        { 
          threshold: 0.3,
          rootMargin: "-300px 0px -150px 0px" // Jarak paling jauh
        }
      );

      // Apply observers dengan delay
      setTimeout(() => {
        if (headerRef.current) headerObserver.observe(headerRef.current);
      }, 100);

      setTimeout(() => {
        if (videoRef.current) videoObserver.observe(videoRef.current);
      }, 300);

      setTimeout(() => {
        if (venuesRef.current) venuesObserver.observe(venuesRef.current);
      }, 500);

      setTimeout(() => {
        if (infoRef.current) infoObserver.observe(infoRef.current);
      }, 700);
    };

    initObservers();

    return () => {
      headerObserver?.disconnect();
      videoObserver?.disconnect();
      venuesObserver?.disconnect();
      infoObserver?.disconnect();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const slideUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="wedding-show"
      className="py-20 px-4 bg-background overflow-hidden relative"
    >
      {/* Parallax Background Element */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-5"
        style={{ y }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-teal-600/20"></div>
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - Muncul pertama */}
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeaderVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24" // Tambah margin besar
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Wedding Show
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Jelajahi berbagai pilihan venue eksklusif dan terpercaya untuk acara
              spesial Anda
            </p>
          </motion.div>
        </div>

        {/* Video Player Section - Muncul kedua */}
        <div ref={videoRef}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVideoVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="mb-40" // Tambah margin besar
          >
            <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative group cursor-pointer">
                <motion.img
                  initial={{ opacity: 0.6, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={weddingShowVideo?.thumbnail || "https://images.unsplash.com/photo-1519167758481-dc80357cbdf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
                  alt="Wedding Show"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVideoPlaying(true)}
                  className="absolute flex items-center justify-center gap-3 text-white"
                >
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                    <Play className="w-8 h-8 ml-1" fill="white" />
                  </div>
                </motion.button>
              </div>

              {/* Info below video */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isVideoVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-8 bg-white"
              >
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Menggunjungi Koleksi Wedding Venue Eksklusif
                </h3>
                <p className="text-muted-foreground">
                  Tonton koleksi venue pernikahan terbaik kami yang telah
                  dipercaya oleh ratusan pasangan dalam mewujudkan hari istimewa
                  mereka.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Spacer untuk memberikan jarak scroll */}
        <div className="h-20"></div>

        {/* Venue Categories - Muncul setelah scroll lebih jauh */}
        <div ref={venuesRef}>
          <motion.div
            initial="hidden"
            animate={isVenuesVisible ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40" // Tambah margin besar
          >
            <div className="md:col-span-3 mb-12">
              <motion.h3 
                variants={textVariants}
                className="text-3xl font-bold text-foreground text-center"
              >
                Pilihan Venue Eksklusif
              </motion.h3>
              <motion.p
                variants={textVariants}
                className="text-muted-foreground text-center mt-4 max-w-2xl mx-auto"
              >
                Temukan venue yang sempurna untuk hari spesial Anda
              </motion.p>
            </div>
            
            {venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500"
              >
                {/* Image */}
                <div className="relative overflow-hidden h-64 bg-gray-200">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    src={venue.image}
                    alt={venue.title}
                    className="w-full h-full object-cover"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isVenuesVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold"
                  >
                    {venue.category}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {venue.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {venue.description}
                  </p>

                  {/* Info */}
                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Kapasitas: {venue.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <span className="text-primary">Rp</span>
                      <span>{venue.price}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const message = `Halo, saya tertarik dengan venue ${venue.title}. Bisakah kita diskusi lebih lanjut mengenai detail dan ketersediaannya?`;
                      window.open(
                        `https://wa.me/62812345678900?text=${encodeURIComponent(message)}`,
                        "_blank",
                      );
                    }}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Konsultasi Venue
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>



        {/* Information Section - Muncul paling akhir */}
        <div ref={infoRef}>
          <motion.div
            initial="hidden"
            animate={isInfoVisible ? "visible" : "hidden"}
            variants={slideUpVariants}
            className="bg-gray-50 rounded-lg p-8 md:p-12"
          >
            <motion.h3 
              variants={textVariants}
              className="text-2xl md:text-3xl font-bold text-foreground mb-6"
            >
              Informasi Venue
            </motion.h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInfoVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="rounded-lg overflow-hidden shadow-lg h-80 bg-gray-200"
              >
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5897749250743!2d106.82714321533262!3d-6.174465961058034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3370c0d0001%3A0xf0d4b07cc63156e!2sJakarta%2C%20Indonesia!5e0!3m2!1sen!2sus!4v1234567890"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </motion.div>

              {/* Info Text */}
              <motion.div 
                initial="hidden"
                animate={isInfoVisible ? "visible" : "hidden"}
                variants={containerVariants}
                className="space-y-6"
              >
                <motion.div variants={textVariants}>
                  <h4 className="text-lg font-bold text-foreground mb-2">
                    Lokasi
                  </h4>
                  <p className="text-muted-foreground">
                    Jakarta, Indonesia. Semua venue kami berlokasi strategis dan
                    mudah diakses dari berbagai tempat.
                  </p>
                </motion.div>

                <motion.div variants={textVariants}>
                  <h4 className="text-lg font-bold text-foreground mb-2">
                    Fasilitas
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      Parkir luas dan aman
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      AC dan sistem pendingin modern
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      Kamar ganti dan ruang istirahat
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      Sistem audio dan lighting profesional
                    </li>
                  </ul>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const message = `Halo, saya ingin mengetahui lebih banyak tentang semua venue yang tersedia dan ketersediaannya untuk tanggal yang saya inginkan.`;
                    window.open(
                      `https://wa.me/62812345678900?text=${encodeURIComponent(message)}`,
                      "_blank",
                    );
                  }}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors w-full md:w-auto"
                >
                  Hubungi Kami
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-4xl aspect-video"
          >
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={() => setIsVideoPlaying(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
            {weddingShowVideo ? (
              <video
                className="w-full h-full rounded-lg"
                src={weddingShowVideo.videoPath}
                controls
                autoPlay
                title="Wedding Show Video"
              />
            ) : (
              <iframe
                className="w-full h-full rounded-lg"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Wedding Show"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}