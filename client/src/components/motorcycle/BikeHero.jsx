import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ScrollVideoHero from "../ui/ScrollVideoHero";
import { useBikeData } from "../../hooks/useBikeData";

const ease = [0.22, 1, 0.36, 1];

export default function BikeHero() {
  const { t } = useTranslation();
  const { bike: bikeData } = useBikeData();

  return (
    <section className="relative">
      <ScrollVideoHero
        videoSrc={bikeData.heroVideo || null}
        posterSrc={bikeData.photos[0]}
        alt={`${bikeData.brand} ${bikeData.model}`}
        fallbackHeight="100vh"
      />

      {/* Overlay content pinned */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="sticky top-0 h-screen flex items-end">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease, delay: 0.15 }}
            >
              <p className="font-sub text-xs tracking-[0.2em] uppercase text-accent mb-4">
                {t("myBike.specs.brand")}: {bikeData.brand}
              </p>
              <h1 className="font-display text-[clamp(3rem,8vw,7rem)] leading-none text-text">
                {bikeData.model}
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.45 }}
                className="font-sub text-xl text-muted mt-2"
              >
                {bikeData.year} · {bikeData.engine}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
