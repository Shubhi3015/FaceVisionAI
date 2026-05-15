import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';

export const AnalysisHistory = ({ onSelectResult }: { onSelectResult: (result: AnalysisResult) => void }) => {
  const [history, setHistory] = useState<Array<{ id: string; result: AnalysisResult; timestamp: Date }>>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('analysisHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const removeFromHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem('analysisHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('analysisHistory');
  };

  if (history.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 transition"
        >
          <h3 className="font-semibold text-text">Analysis History ({history.length})</h3>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={20} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-blue-200 dark:border-blue-800 overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition cursor-pointer group"
                    onClick={() => onSelectResult(entry.result)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {entry.result.severity} severity •{' '}
                        <span className="text-xs text-text/60">
                          {entry.result.processed} issues
                        </span>
                      </p>
                      <p className="text-xs text-text/50">
                        {entry.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(entry.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 transition text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-blue-200 dark:border-blue-800 px-4 py-3">
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All History
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Export hook for adding to history
export const useAnalysisHistory = () => {
  return {
    addToHistory: (result: AnalysisResult) => {
      const event = new CustomEvent('addToHistory', { detail: result });
      window.dispatchEvent(event);
    },
  };
};
