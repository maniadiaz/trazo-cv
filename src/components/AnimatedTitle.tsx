import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const letter: Variants = {
  hidden: { y: -50, opacity: 0, filter: "blur(14px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 70, damping: 14 } },
};

/** Título que cae letra por letra con desenfoque (técnica estrella del template). */
export default function AnimatedTitle({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.h1 aria-label={text} variants={container} initial="hidden" animate="visible" className={className}>
      {text.split("").map((ch, i) => (
        <motion.span key={i} aria-hidden variants={letter} className="inline-block">
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/** Entrada "blur-in" reutilizable. */
export const blurIn = (delay = 0) => ({
  initial: { opacity: 0, y: 16, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
});
