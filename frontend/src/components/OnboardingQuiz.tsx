import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';
import type { OnboardingData } from '../types';

const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

interface Props {
  open: boolean;
  onComplete: (data: OnboardingData) => Promise<void>;
  onSkip?: () => void;
}

const STEPS = [
  { title: 'About you', subtitle: 'Help us personalize your experience' },
  { title: 'Your skin', subtitle: 'Tell us about your skin type' },
  { title: 'Safety & routine', subtitle: 'Allergies and products you use' },
];

export function OnboardingQuiz({ open, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<OnboardingData>({
    age: 25,
    gender: 'Prefer not to say',
    skin_type: 'Combination',
    allergies: '',
    current_products: '',
  });

  const update = (patch: Partial<OnboardingData>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onComplete(form);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg glass-card rounded-3xl shadow-glass-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white relative">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Quick setup</span>
          </div>
          <h2 className="text-2xl font-bold">{STEPS[step].title}</h2>
          <p className="text-white/80 text-sm mt-1">{STEPS[step].subtitle}</p>
          <div className="flex gap-2 mt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 min-h-[220px]"
            >
              {step === 0 && (
                <>
                  <label className="block">
                    <span className="text-sm font-medium text-text">Age</span>
                    <input
                      type="number"
                      min={13}
                      max={120}
                      value={form.age}
                      onChange={(e) => update({ age: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-4 py-3 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none dark:bg-slate-900 dark:border-violet-500/30"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-text">Gender</span>
                    <select
                      value={form.gender}
                      onChange={(e) => update({ gender: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-4 py-3 text-text focus:border-primary outline-none dark:bg-slate-900 dark:border-violet-500/30"
                    >
                      {GENDERS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              {step === 1 && (
                <div>
                  <span className="text-sm font-medium text-text block mb-3">Skin type</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SKIN_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => update({ skin_type: type })}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition border ${
                          form.skin_type === type
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <>
                  <label className="block">
                    <span className="text-sm font-medium text-text">Known allergies (optional)</span>
                    <textarea
                      value={form.allergies}
                      onChange={(e) => update({ allergies: e.target.value })}
                      placeholder="e.g. fragrance, salicylic acid, nuts in oils…"
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-4 py-3 text-text placeholder:text-muted focus:border-primary outline-none resize-none dark:bg-slate-900 dark:border-violet-500/30"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-text">Current products (optional)</span>
                    <textarea
                      value={form.current_products}
                      onChange={(e) => update({ current_products: e.target.value })}
                      placeholder="Cleanser, moisturizer, SPF, serums you use today…"
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-primary/20 bg-surface px-4 py-3 text-text placeholder:text-muted focus:border-primary outline-none resize-none dark:bg-slate-900 dark:border-violet-500/30"
                    />
                  </label>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6 pt-4 border-t border-primary/10">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-primary disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-soft-lg hover:opacity-95 transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-soft-lg hover:opacity-95 disabled:opacity-60 transition"
              >
                {submitting ? 'Saving…' : 'Start scanning'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
