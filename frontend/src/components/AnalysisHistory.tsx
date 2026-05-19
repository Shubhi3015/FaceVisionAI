import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { deleteScan, fetchScanDetail, fetchScans } from '../services/api';

export const AnalysisHistory = ({
  onSelectResult,
}: {
  onSelectResult: (result: AnalysisResult) => void;
}) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<
    Array<{ id: string | number; result: AnalysisResult; timestamp: Date }>
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (user) {
      setLoading(true);
      try {
        const scans = await fetchScans();
        setHistory(
          scans.map((s) => ({
            id: s.id,
            result: {
              regions_detected: s.regions_detected,
              processed: s.processed,
              confidence: s.confidence,
              severity: s.severity as AnalysisResult['severity'],
              regions: [],
              overall: {
                primary_concern: s.primary_concern,
                average_score: s.confidence * 100,
                per_issue_avg: { Acne: 0, Redness: 0, Pigmentation: 0 },
                severity: s.severity,
                recommendation: null,
              },
            },
            timestamp: new Date(s.created_at),
          }))
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    const saved = localStorage.getItem('analysisHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((h: { id: string; result: AnalysisResult; timestamp: string }) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        })));
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [user]);

  useEffect(() => {
    const onAdd = (e: Event) => {
      const detail = (e as CustomEvent<AnalysisResult>).detail;
      if (user) {
        void loadHistory();
        return;
      }
      const entry = {
        id: crypto.randomUUID(),
        result: detail,
        timestamp: new Date(),
      };
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, 20);
        localStorage.setItem('analysisHistory', JSON.stringify(updated));
        return updated;
      });
    };
    window.addEventListener('addToHistory', onAdd);
    return () => window.removeEventListener('addToHistory', onAdd);
  }, [user]);

  const removeFromHistory = async (id: string | number) => {
    if (user && typeof id === 'number') {
      await deleteScan(id);
      void loadHistory();
      return;
    }
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem('analysisHistory', JSON.stringify(updated));
  };

  const handleSelect = async (entry: (typeof history)[0]) => {
    if (user && typeof entry.id === 'number') {
      try {
        const detail = await fetchScanDetail(entry.id);
        onSelectResult(detail.result);
      } catch {
        onSelectResult(entry.result);
      }
      return;
    }
    onSelectResult(entry.result);
  };

  if (!user && history.length === 0) return null;
  if (user && !loading && history.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl overflow-hidden shadow-soft"
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-primary/5 transition"
        >
          <h3 className="font-semibold text-text flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {user ? 'Your scan history' : 'Analysis history'} ({history.length})
          </h3>
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
              className="border-t border-primary/10 overflow-hidden"
            >
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-muted text-center py-4">Loading…</p>
                ) : (
                  history.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-surface dark:bg-slate-800/50 rounded-xl hover:shadow-md transition cursor-pointer group"
                      onClick={() => void handleSelect(entry)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {entry.result.overall?.primary_concern ?? entry.result.severity} ·{' '}
                          {entry.result.severity} severity
                        </p>
                        <p className="text-xs text-muted">
                          {entry.timestamp.toLocaleString()}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          void removeFromHistory(entry.id);
                        }}
                        className="p-1 opacity-0 group-hover:opacity-100 transition text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export const useAnalysisHistory = () => ({
  addToHistory: (result: AnalysisResult) => {
    window.dispatchEvent(new CustomEvent('addToHistory', { detail: result }));
  },
});
