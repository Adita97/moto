import { create } from "zustand";

const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "dark",

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return { theme: next };
    }),

  initTheme: () =>
    set((state) => {
      document.documentElement.classList.toggle("dark", state.theme === "dark");
      return {};
    }),
}));

export default useThemeStore;
