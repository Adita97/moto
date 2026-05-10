import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease },
      }}
      exit={{
        opacity: 0,
        y: -16,
        filter: "blur(4px)",
        transition: { duration: 0.35, ease },
      }}
    >
      {children}
    </motion.div>
  );
}
