import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "facevision-theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      className="inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-white/90 px-3 py-2 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800"
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};
