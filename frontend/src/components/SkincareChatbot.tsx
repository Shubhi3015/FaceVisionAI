import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { sendSkincareChat, type SkincareChatMessage } from '../services/api';

const OPEN_CHAT_EVENT = 'open-skincare-chat';

function formatInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const WELCOME =
  "Hi! I’m your **skincare guide**—ask about routines, SPF, dryness, acne habits, sensitive skin, or when to see a dermatologist. " +
  "I share general education only, not a diagnosis.";

export const SkincareChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<SkincareChatMessage[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: SkincareChatMessage = { role: 'user', content: trimmed };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const reply = await sendSkincareChat(nextHistory);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not reach the skincare assistant. Is the API running on port 8000?';
      setError(String(msg));
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => (open ? setOpen(false) : setOpen(true))}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30 ring-2 ring-white/40 dark:ring-slate-900/40 touch-manipulation"
        aria-label={open ? 'Close skincare chat' : 'Open skincare chat'}
      >
        {open ? <X className="h-7 w-7" aria-hidden /> : <MessageCircle className="h-7 w-7" aria-hidden />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="fixed bottom-24 right-5 z-[60] flex w-[min(100vw-2.5rem,22rem)] sm:w-[26rem] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-card shadow-glass-lg dark:border-slate-700/80 dark:bg-slate-900"
            role="dialog"
            aria-label="Skincare guide chat"
          >
            <div className="flex items-center gap-2 border-b border-slate-200/70 bg-primary/5 px-4 py-3 dark:border-slate-700/80 dark:bg-slate-800/80">
              <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">Skincare Guide</p>
                <p className="truncate text-xs text-text/60">General tips · not medical advice</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-text/70 hover:bg-primary/10 hover:text-primary"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={listRef}
              className="max-h-[min(360px,50vh)] space-y-3 overflow-y-auto px-3 py-3"
            >
              {messages.map((m, idx) => (
                <div
                  key={`${idx}-${m.role}`}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-slate-100 text-text dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{formatInlineBold(m.content)}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-3.5 py-2.5 text-sm text-text/70 dark:bg-slate-800">
                    <span className="inline-flex gap-1">
                      <span className="animate-pulse">Thinking</span>
                      <span className="inline-block animate-bounce">·</span>
                      <span className="inline-block animate-bounce [animation-delay:120ms]">·</span>
                      <span className="inline-block animate-bounce [animation-delay:240ms]">·</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="border-t border-slate-200/70 px-3 py-2 text-xs text-red-600 dark:border-slate-700 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-2 border-t border-slate-200/70 bg-card p-3 dark:border-slate-700">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about skincare…"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-text placeholder:text-text/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                disabled={loading}
                maxLength={4000}
                aria-label="Message"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export function openSkincareChat() {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}
