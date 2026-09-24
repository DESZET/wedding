import { useState } from 'react';
import { Play, X, Film, Sparkles, Clock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoItem } from '@shared/api';
import { useApiCache } from '../hooks/useApiCache';
import { cloudinaryImage } from '../lib/cloudinary';

// Convert YouTube / Vimeo watch URL to embed URL
const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
};

// Fix thumbnail URL — handle Cloudinary & regular URLs
const fixThumbnail = (url: string): string => {
  if (!url) return '';
  // Already a Cloudinary URL — auto-optimize
  if (url.includes('res.cloudinary.com')) {
    return cloudinaryImage(url, 800);
  }
  return url;
};

// Skeleton card
function VideoSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 animate-pulse">
      <div className="aspect-video bg-white/10" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}

// Single video card
function VideoCard({
  video,
  index,
  onPlay,
}: {
  video: VideoItem;
  index: number;
  onPlay: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const thumb = fixThumbnail(video.thumbnail || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group cursor-pointer"
      onClick={onPlay}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 group-hover:border-amber-400/50 transition-all duration-500">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          {/* Skeleton while loading */}
          {!imgLoaded && !imgError && thumb && (
            <div className="absolute inset-0 bg-slate-800 animate-pulse" />
          )}

          {thumb && !imgError ? (
            <img
              src={thumb}
              alt={video.title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            // Fallback gradient when no thumbnail or error
            <div className="w-full h-full bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <Film className="w-16 h-16 text-white/20" />
            </div>
          )}

          {/* Dark cinematic overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 group-hover:from-black/70 transition-all duration-500" />

          {/* Shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping scale-125" />
              <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping scale-150 animation-delay-300" />
              {/* Button */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40 group-hover:shadow-amber-400/60 transition-shadow duration-300">
                <Play className="w-7 h-7 text-slate-900 ml-1" fill="currentColor" />
              </div>
            </motion.div>
          </div>

          {/* Duration badge (top right) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            <Film className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-semibold text-white tracking-wide">VIDEO</span>
          </div>

          {/* Watch hint (bottom left) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Eye className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-medium text-white">Tonton Sekarang</span>
          </div>
        </div>

        {/* Info bar below thumbnail */}
        <div className="px-5 py-4 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-sm">
          <h3 className="text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors duration-300">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function VideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const { data, loading } = useApiCache<VideoItem[]>('/videos');
  const videos: VideoItem[] = data ?? [];

  return (
    <section
      id="videos"
      className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-slate-950 via-gray-950 to-slate-900"
      data-testid="video-showcase-section"
    >
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold mb-5 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Video Portfolio Eksklusif</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
            Karya <span className="text-gradient bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Sinematik</span> Kami
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Setiap frame bercerita. Setiap momen diabadikan dengan jiwa untuk merayakan cinta yang abadi.
          </p>
        </motion.div>

        {/* Video grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <VideoSkeleton key={i} />)}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Film className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Belum ada video tersedia</p>
            <p className="text-sm mt-1 opacity-70">Tambahkan video melalui panel admin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                index={index}
                onPlay={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        )}

        {/* Decorative bottom line */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-400/20" />
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
            ))}
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-400/20" />
        </div>
      </div>

      {/* ─── Lightbox / Player Modal ─── */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
              data-testid="video-modal"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
                data-testid="close-video-button"
                aria-label="Tutup video"
              >
                <X className="w-5 h-5" />
                <span>Tutup</span>
              </button>

              {/* Player container */}
              <div className="rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10">
                <div className="aspect-video bg-black">
                  {getEmbedUrl(selectedVideo.videoPath) ? (
                    <iframe
                      src={getEmbedUrl(selectedVideo.videoPath)!}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : selectedVideo.videoPath ? (
                    <video
                      src={selectedVideo.videoPath}
                      poster={fixThumbnail(selectedVideo.thumbnail || '')}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full bg-black"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Film className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Title bar */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-950 to-slate-900 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{selectedVideo.title}</h3>
                    {selectedVideo.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{selectedVideo.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-amber-300 font-semibold">Sedang Diputar</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
