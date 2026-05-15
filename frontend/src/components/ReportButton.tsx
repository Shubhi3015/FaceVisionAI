import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface ReportButtonProps {
  onClick: () => void;
}

export const ReportButton = ({ onClick }: ReportButtonProps) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full sm:w-auto mx-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-xl sm:rounded-full font-semibold shadow-lg hover:shadow-xl transition text-sm sm:text-base touch-manipulation"
    >
      <Download className="w-5 h-5 shrink-0" />
      Download Analysis Report
    </motion.button>
  );
};
