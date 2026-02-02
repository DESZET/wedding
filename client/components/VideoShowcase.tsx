import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoItem } from '@shared/api';



export default function VideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        if (data.success) {
          setVideos(data.data);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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
          {videos.length > 0 ? videos.map((video, index) => (
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
          )) : (
            <div className="col-span-full text-center text-gray-400">
              Loading videos...
            </div>
          )}
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
                <video
                  src={selectedVideo.videoPath}
                  title={selectedVideo.title}
                  controls
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
