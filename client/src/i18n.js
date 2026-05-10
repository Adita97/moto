import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import fr from "./locales/fr/translation.json";
import ro from "./locales/ro/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ro: { translation: ro },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "ro"],
    // Match 'en-US' → 'en', 'fr-FR' → 'fr', etc.
    load: "languageOnly",
    defaultNS: "translation",
    ns: ["translation"],
    detection: {
      // 1. User's explicit choice (localStorage)
      // 2. Browser language
      // 3. HTML lang attribute
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      // Convert 'en-US' to 'en' before lookup
      convertDetectedLanguage: (lng) => lng.split("-")[0],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;
