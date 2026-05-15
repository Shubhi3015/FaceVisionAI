import { motion } from 'framer-motion';

interface HeatmapViewerProps {
  heatmapData: string;
}

export const HeatmapViewer = ({ heatmapData }: HeatmapViewerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-glass border border-slate-200/50 p-4 sm:p-6"
    >
      <h3 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">Heatmap Visualization</h3>
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-primary/20 bg-slate-100/50 mb-4 sm:mb-6">
        <img
          src={`data:image/png;base64,${heatmapData}`}
          alt="Heatmap"
          className="w-full h-auto max-h-[min(60vh,24rem)] object-contain"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500 shrink-0" />
          <span className="text-text/70">Low Intensity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500 shrink-0" />
          <span className="text-text/70">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 shrink-0" />
          <span className="text-text/70">High Intensity</span>
        </div>
      </div>
    </motion.div>
  );
};
