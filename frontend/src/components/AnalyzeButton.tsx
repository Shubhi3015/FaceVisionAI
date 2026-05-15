import { motion } from 'framer-motion';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const AnalyzeButton = ({ onClick, disabled }: AnalyzeButtonProps) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-full font-semibold text-base sm:text-lg transition shadow-lg touch-manipulation ${
        disabled
          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl active:scale-[0.98]'
      }`}
    >
      Analyze Image
    </motion.button>
  );
};
