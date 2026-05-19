import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { openSkincareChat } from './SkincareChatbot';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Scan' },
  { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const closeMobile = () => setMobileOpen(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-card/80 border-b border-primary/10 shadow-soft"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-1 shrink-0">
            <span className="text-xl sm:text-2xl font-bold gradient-text">FaceVision</span>
            <span className="text-xl sm:text-2xl font-bold text-accent">AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map(({ to, label, requiresAuth }) =>
              requiresAuth && !user ? null : (
                <Link
                  key={to}
                  to={to}
                  className={`font-medium py-2 transition ${
                    location.pathname === to
                      ? 'text-primary'
                      : 'text-text hover:text-primary'
                  }`}
                >
                  {label}
                </Link>
              )
            )}
            <button
              type="button"
              onClick={() => openSkincareChat()}
              className="text-text hover:text-primary transition font-medium py-2"
            >
              Skincare Guide
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.email.split('@')[0]}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl hover:bg-primary/10 text-muted hover:text-primary transition"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition"
              >
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2.5 rounded-xl hover:bg-primary/10 text-text transition touch-manipulation"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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
            className="md:hidden overflow-hidden border-t border-primary/10 bg-card/95 backdrop-blur-lg"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label, requiresAuth }) =>
                requiresAuth && !user ? null : (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeMobile}
                    className="py-3 px-4 rounded-xl text-text hover:bg-primary/10 hover:text-primary font-medium transition"
                  >
                    {label}
                  </Link>
                )
              )}
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  openSkincareChat();
                }}
                className="py-3 px-4 rounded-xl text-left text-text hover:bg-primary/10 hover:text-primary font-medium transition"
              >
                Skincare Guide
              </button>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMobile}
                    className="py-3 px-4 rounded-xl text-primary font-medium"
                  >
                    {user.email}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                    className="py-3 px-4 rounded-xl text-left text-red-500 font-medium"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="py-3 px-4 rounded-xl bg-primary/10 text-primary font-semibold"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
