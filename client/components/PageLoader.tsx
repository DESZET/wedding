import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -20,
            transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }
          }}
          className="fixed inset-0 bg-background z-50 flex items-center justify-center"
        >
          {/* Loading content */}
          <div className="flex flex-col items-center gap-6">
            {/* Logo animation */}
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-primary to-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-primary/20"
              animate={{
                scale: [1, 1.08, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-4xl font-serif font-bold text-white">G</span>
            </motion.div>

            {/* Loading bars */}
            <div className="space-y-2">
              <div className="flex gap-1.5 justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary/30 rounded-full"
                    animate={{
                      scaleY: [0.6, 1.2, 0.6],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Loading text */}
            <motion.p 
              className="text-muted-foreground font-serif tracking-wider text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              MEMUAT...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
