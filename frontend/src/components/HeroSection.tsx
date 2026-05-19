import { motion } from 'framer-motion';

export const HeroSection = ({ onStartAnalysis }: { onStartAnalysis: () => void }) => {
  return (
    <section id="home" className="relative py-12 sm:py-20 md:py-28 lg:py-32 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-4 h-4 bg-primary/20 rounded-full"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-40 right-20 w-6 h-6 bg-accent/20 rounded-full"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-40 left-20 w-3 h-3 bg-secondary/20 rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-4 sm:mb-6 md:mb-8 leading-tight">
              Your personal
              <span className="block gradient-text">Skin Intelligence</span>
            </h1>
            <p className="text-base sm:text-lg text-muted mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-xl md:max-w-none mx-auto md:mx-0">
              AI-powered analysis, personalized guidance, and a dashboard to track your skin journey.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartAnalysis}
              className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-base sm:text-lg w-full sm:w-auto relative overflow-hidden group"
            >
              <span className="relative z-10">Start Analysis</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center relative order-first md:order-none"
          >
            {/* Animated scanning face illustration */}
            <div className="relative w-full max-w-md h-56 sm:h-72 md:h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl sm:rounded-3xl overflow-hidden border border-primary/20 backdrop-blur-sm">
              {/* Glowing grid overlay */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 400">
                {/* Grid lines */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={(i + 1) * 80}
                    x2="300"
                    y2={(i + 1) * 80}
                    stroke="#EF4444"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}
                {Array.from({ length: 3 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={(i + 1) * 75}
                    y1="0"
                    x2={(i + 1) * 75}
                    y2="400"
                    stroke="#F59E0B"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}
                {/* Face outline circle */}
                <circle cx="150" cy="150" r="80" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.5" />
                {/* Feature points */}
                <circle cx="120" cy="130" r="8" fill="#EF4444" opacity="0.7" />
                <circle cx="180" cy="130" r="8" fill="#EF4444" opacity="0.7" />
                <circle cx="150" cy="180" r="6" fill="#F59E0B" opacity="0.8" />
              </svg>

              {/* Animated scanning line */}
              <motion.div
                animate={{ y: [0, 320] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
              />

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>

            {/* Background glow */}
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl sm:rounded-3xl blur-2xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
