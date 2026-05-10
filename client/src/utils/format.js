import { format } from "date-fns";
import { enUS, fr, ro } from "date-fns/locale";

const localeMap = { en: enUS, fr, ro };

export function formatDate(dateString, lang = "en") {
  return format(new Date(dateString), "PPP", {
    locale: localeMap[lang] ?? enUS,
  });
}
