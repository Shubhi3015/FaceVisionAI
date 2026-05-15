import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface StatsCardsProps {
  regionsDetected: number;
  processed: number;
  confidence: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  index,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-glass border border-slate-200/50 p-4 sm:p-6"
  >
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-text/70 text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">{value}</p>
      </div>
      <div className="text-accent opacity-60 shrink-0">{Icon}</div>
    </div>
  </motion.div>
);

export const StatsCards = ({
  regionsDetected,
  processed,
  confidence,
}: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        title="Total Regions"
        value={regionsDetected}
        icon={<BarChart3 className="w-8 h-8" />}
        index={0}
      />
      <StatCard
        title="Processed Regions"
        value={processed}
        icon={<BarChart3 className="w-8 h-8" />}
        index={1}
      />
      <StatCard
        title="Analysis Confidence"
        value={`${(confidence * 100).toFixed(0)}%`}
        icon={<BarChart3 className="w-8 h-8" />}
        index={2}
      />
    </div>
  );
};
