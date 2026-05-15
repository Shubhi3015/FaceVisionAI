import { motion } from 'framer-motion';

interface SeverityBadgeProps {
  severity: 'Low' | 'Medium' | 'High';
}

export const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const colorMap = {
    Low: 'bg-gradient-to-r from-primary to-secondary',
    Medium: 'bg-gradient-to-r from-green-500 to-accent',
    High: 'bg-gradient-to-r from-red-500 to-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-block px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-white shadow-lg text-sm sm:text-base ${colorMap[severity]}`}
    >
      Severity Score: {severity}
    </motion.div>
  );
};
