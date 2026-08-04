"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Loader2 } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    // 1. Trigger the blur overlay instantly
    setIsSwitching(true);

    // 2. Wait a tiny fraction of a second, then switch the theme behind the blur
    setTimeout(() => {
      if (isDark) {
        document.documentElement.classList.remove("dark");
        localStorage.theme = "light";
        setIsDark(false);
      } else {
        document.documentElement.classList.add("dark");
        localStorage.theme = "dark";
        setIsDark(true);
      }

      // 3. Keep the blur up just long enough for the browser to repaint, then fade out
      setTimeout(() => {
        setIsSwitching(false);
      }, 300);
    }, 150);
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        aria-label="Toggle Dark Mode"
        className="relative flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 shrink-0 cursor-pointer"
      >
        <Sun
          className={`absolute w-4 h-4 transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          className={`absolute w-4 h-4 transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-indigo-400"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </button>

      {/* The Smooth Transition Overlay */}
      {isSwitching && (
        <div className="fixed inset-0 z-[99999] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      )}
    </>
  );
}
