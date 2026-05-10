import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Shield } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useThemeStore from "../../store/themeStore";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { cn } from "../../utils/cn";

export default function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/my-bike", label: t("nav.myBike") },
    { to: "/videos", label: t("nav.videos") },
  ];

  const linkClass = ({ isActive }) =>
    cn(
      "font-sub text-sm tracking-widest uppercase transition-colors py-1",
      isActive
        ? "text-accent border-b-2 border-accent"
        : "text-muted hover:text-accent",
    );

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-bg/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl text-text">
          MOTO <span className="text-accent">[YOUR NAME]</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              end={link.to === "/"}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:flex" />

          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-text transition-colors"
            aria-label={t("accessibility.toggleTheme")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <NavLink
            to={isAuthenticated ? "/admin" : "/admin/login"}
            className={({ isActive }) =>
              cn(
                "p-2 transition-colors",
                isActive ? "text-accent" : "text-muted hover:text-text",
              )
            }
            title={t("nav.adminLogin")}
          >
            <Shield size={18} />
          </NavLink>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted hover:text-text"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-surface border-b border-border"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClass}
                  onClick={() => setMobileOpen(false)}
                  end={link.to === "/"}
                >
                  {link.label}
                </NavLink>
              ))}
              <LanguageSwitcher className="sm:hidden" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
