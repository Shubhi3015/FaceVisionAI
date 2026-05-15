import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#how', label: 'How it Works' },
  { href: '#docs', label: 'Documentation' },
  { href: '#contact', label: 'Contact' },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200/60 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <a href="#home" className="flex items-center gap-1 shrink-0">
            <span className="text-xl sm:text-2xl font-semibold text-primary">FaceVision</span>
            <span className="text-xl sm:text-2xl font-semibold text-accent">AI</span>
          </a>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-text hover:text-primary transition font-medium py-2"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2.5 rounded-xl hover:bg-primary/10 text-text transition touch-manipulation"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-xl text-text hover:bg-primary/10 hover:text-primary font-medium transition"
                >
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
