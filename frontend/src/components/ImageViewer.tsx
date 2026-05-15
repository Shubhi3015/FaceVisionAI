import { motion } from 'framer-motion';

interface ImageViewerProps {
  imageData: string;
  title: string;
}

export const ImageViewer = ({ imageData, title }: ImageViewerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-glass border border-slate-200/50 p-4 sm:p-6 overflow-hidden"
    >
      <h3 className="text-base sm:text-lg font-semibold text-text mb-3 sm:mb-4">{title}</h3>
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-primary/20 bg-slate-100/50">
        <img
          src={`data:image/png;base64,${imageData}`}
          alt={title}
          className="w-full h-auto max-h-[min(60vh,24rem)] object-contain"
        />
      </div>
    </motion.div>
  );
};
