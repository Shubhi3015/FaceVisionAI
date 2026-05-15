import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto w-full mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 backdrop-blur-lg border border-red-500/30 rounded-xl shadow-glass flex items-start gap-3 sm:gap-4"
    >
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base text-red-600 font-medium break-words">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 flex-shrink-0 p-1 touch-manipulation"
        aria-label="Dismiss error"
      >
        <X className="w-5 h-5" />
      </button>
    </motion.div>
  );
};
