import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

const languages = [
  { code: "en", flag: "🇬🇧", label: "English", short: "EN" },
  { code: "fr", flag: "🇫🇷", label: "Français", short: "FR" },
  { code: "ro", flag: "🇷🇴", label: "Română", short: "RO" },
];

export default function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    languages.find((l) => i18n.language?.startsWith(l.code)) ?? languages[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const select = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200",
          "font-sub text-xs tracking-widest uppercase",
          open
            ? "border-accent text-accent bg-accent/10"
            : "border-border text-muted hover:border-accent/50 hover:text-text",
        )}
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.short}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          <ChevronDown size={12} />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-40 bg-surface/95 backdrop-blur-xl border border-border rounded-sm shadow-xl overflow-hidden z-50"
          >
            {languages.map((lang) => {
              const active = i18n.language?.startsWith(lang.code);
              return (
                <li key={lang.code}>
                  <button
                    role="option"
                    aria-selected={active}
                    onClick={() => select(lang.code)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      "font-sub text-xs tracking-wider",
                      active
                        ? "text-accent bg-accent/10"
                        : "text-muted hover:text-text hover:bg-white/5",
                    )}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="flex-1">{lang.label}</span>
                    {active && (
                      <motion.span
                        layoutId="langCheck"
                        className="w-1.5 h-1.5 rounded-full bg-accent"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
