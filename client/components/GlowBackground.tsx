import { motion } from "framer-motion";

interface GlowBackgroundProps {
  className?: string;
  variant?: "hero" | "section" | "subtle";
}

export default function GlowBackground({
  className = "",
  variant = "hero",
}: GlowBackgroundProps) {
  const configs = {
    hero: {
      blobs: [
        {
          color: "hsl(38 90% 55% / 0.12)",
          size: "45%",
          pos: { x: "15%", y: "20%" },
          duration: 18,
        },
        {
          color: "hsl(270 30% 78% / 0.08)",
          size: "40%",
          pos: { x: "75%", y: "60%" },
          duration: 22,
        },
        {
          color: "hsl(10 50% 72% / 0.07)",
          size: "35%",
          pos: { x: "50%", y: "30%" },
          duration: 25,
        },
      ],
    },
    section: {
      blobs: [
        {
          color: "hsl(38 90% 55% / 0.06)",
          size: "35%",
          pos: { x: "20%", y: "30%" },
          duration: 20,
        },
        {
          color: "hsl(270 30% 78% / 0.04)",
          size: "30%",
          pos: { x: "80%", y: "70%" },
          duration: 24,
        },
      ],
    },
    subtle: {
      blobs: [
        {
          color: "hsl(38 90% 55% / 0.04)",
          size: "30%",
          pos: { x: "25%", y: "40%" },
          duration: 22,
        },
        {
          color: "hsl(140 20% 68% / 0.03)",
          size: "25%",
          pos: { x: "70%", y: "60%" },
          duration: 26,
        },
      ],
    },
  };

  const config = configs[variant];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {config.blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.pos.x,
            top: blob.pos.y,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
