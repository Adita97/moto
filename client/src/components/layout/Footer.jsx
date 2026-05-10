import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-sub text-sm tracking-wider text-muted">
          {t("footer.tagline")}
        </p>
        <p className="font-body text-xs text-muted">
          &copy; {year} MOTO. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
