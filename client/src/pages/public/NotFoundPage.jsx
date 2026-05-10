import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageTransition from "../../components/layout/PageTransition";
import Button from "../../components/ui/Button";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-[clamp(6rem,20vw,12rem)] leading-none text-accent">
            404
          </h1>
          <p className="font-display text-3xl text-text mt-4">
            {t("errors.notFound")}
          </p>
          <p className="font-body text-muted mt-2 mb-8">
            {t("errors.notFoundMessage")}
          </p>
          <Link to="/">
            <Button>{t("nav.home")}</Button>
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
