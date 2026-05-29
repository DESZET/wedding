import { motion } from "framer-motion";

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "h4";
  delay?: number;
  once?: boolean;
}

export default function AnimatedHeading({
  text,
  className = "",
  tag: Tag = "h2",
  delay = 0,
  once = true,
}: AnimatedHeadingProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: 40,
      opacity: 0,
      rotateX: -40,
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      className={`overflow-hidden ${className}`}
    >
      <Tag className="flex flex-wrap justify-center gap-x-[0.3em] leading-tight">
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordVariants}
            className="inline-block"
            style={{ perspective: 600 }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  );
}
