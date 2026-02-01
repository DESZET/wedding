import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappNumber = '6285329077987';
  const defaultMessage = 'Halo! Saya tertarik dengan layanan wedding organizer Galeria Wedding. Bisakah kita diskusi lebih lanjut?';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50"
          data-testid="floating-whatsapp"
        >
          {/* Chat Bubble */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="absolute bottom-20 right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden mb-4"
              >
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">Galeria Wedding</h3>
                      <p className="text-xs text-green-100">Biasanya membalas dalam 1 jam</p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 rounded-full p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
                    <p className="text-sm text-gray-700">
                      👋 Hai! Ada yang bisa kami bantu untuk pernikahan impian Anda?
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    data-testid="whatsapp-chat-button"
                  >
                    Mulai Chat
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full p-4 shadow-2xl hover:shadow-green-500/50 transition-shadow"
            data-testid="floating-whatsapp-button"
          >
            <MessageCircle className="w-7 h-7" />
          </motion.button>

          {/* Pulse Effect */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-green-500 rounded-full -z-10"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
