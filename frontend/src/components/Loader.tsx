import { motion } from 'framer-motion';

export const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 sm:py-20"
    >
      <motion.div
        animate={{ scaleX: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="h-1 w-24 sm:w-32 bg-gradient-to-r from-primary via-secondary to-accent rounded-full shadow-glass mb-4 sm:mb-6"
      />
      <p className="text-sm sm:text-base text-text font-semibold">Processing facial regions…</p>
    </motion.div>
  );
};
