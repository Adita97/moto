import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import PageTransition from "../../components/layout/PageTransition";
import BikeHero from "../../components/motorcycle/BikeHero";
import BikeSpecs from "../../components/motorcycle/BikeSpecs";
import BikeGallery from "../../components/motorcycle/BikeGallery";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useBikeData } from "../../hooks/useBikeData";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease },
  },
};

export default function MyBikePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { ref: storyRef, inView: storyInView } = useScrollReveal();
  const { bike: bikeData } = useBikeData();

  return (
    <PageTransition>
      <BikeHero />
      <BikeSpecs />

      {/* Story Section */}
      <section className="py-20 lg:py-32 bg-surface" ref={storyRef}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={storyInView ? "visible" : "hidden"}
            className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none mb-14 text-text"
          >
            {t("myBike.sectionStory")}
          </motion.h2>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={storyInView ? "visible" : "hidden"}
            className="prose prose-invert prose-lg max-w-none font-body text-muted leading-relaxed"
          >
            <p>{bikeData.story[lang] || bikeData.story.en}</p>
          </motion.div>
        </div>
      </section>

      <BikeGallery />
    </PageTransition>
  );
}
