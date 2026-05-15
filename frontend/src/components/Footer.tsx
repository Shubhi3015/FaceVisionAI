import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-lg py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs sm:text-sm text-text">
            © 2025 SkinSense AI. Advanced skin condition analysis.
          </p>
          <p className="text-[10px] sm:text-xs mt-3 sm:mt-4 text-text/60 max-w-md mx-auto px-2">
            For research and medical purposes only. Always consult with healthcare professionals.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
