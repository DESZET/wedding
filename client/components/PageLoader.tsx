import { useEffect, useState } from "react";

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate page load - hide after 1.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, );

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      {/* Loading content */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo animation */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-4xl font-bold text-white">D</span>
        </div>

        {/* Loading bars */}
        <div className="space-y-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-12 bg-gradient-to-b from-primary to-transparent rounded-full"
                style={{
                  animation: `bounce 1.4s infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading text */}
        <p className="text-muted-foreground font-medium">Memuat...</p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.5;
            transform: scaleY(1);
          }
          40% {
            opacity: 1;
            transform: scaleY(1.2);
          }
        }
      `}</style>
    </div>
  );
}
