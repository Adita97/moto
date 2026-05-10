import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function Card({ className, children, onClick, ...props }) {
  return (
    <motion.div
      className={cn(
        "bg-surface border border-border overflow-hidden group cursor-pointer",
        className,
      )}
      onClick={onClick}
      whileHover={{
        y: -6,
        borderColor: "rgba(230, 48, 18, 0.4)",
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
      whileTap={{ scale: 0.985 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
