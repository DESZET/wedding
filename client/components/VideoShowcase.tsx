import { useState } from 'react';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
  description: string;
}

const VIDEOS: Video[] = [
  {
    id: 1,
    title: 'Sarah & David Wedding Highlight',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'A beautiful beach wedding celebration',
  },
  {
    id: 2,
    title: 'Garden Wedding - Maya & Rudi',
    thumbnail: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Elegant garden ceremony',
  },
  {
    id: 3,
    title: 'Grand Ballroom - Rina & Ahmad',
    thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=400&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Luxury ballroom reception',
  },
];

export default function VideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <section
      id="videos"
      className="py-20 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
      data-testid="video-showcase-section"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Video Portfolio Kami
          </h2>
          <p className="text-lg text-gray-300">
            Saksikan hasil karya kami dalam menghadirkan momen tak terlupakan
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VIDEOS.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => setSelectedVideo(video)}
              data-testid={`video-thumbnail-${video.id}`}
            >
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </motion.div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                <p className="text-sm text-gray-400">{video.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              data-testid="video-modal"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                data-testid="close-video-button"
              >
                ✕
              </button>
              <div className="aspect-video">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-6 bg-gray-900">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedVideo.title}
                </h3>
                <p className="text-gray-300">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
