import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Gauge, Zap, Weight, Wind, Calendar, Palette } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useBikeData } from "../../hooks/useBikeData";

const specsMeta = [
  { key: "engine", icon: Gauge, field: "engine" },
  { key: "power", icon: Zap, field: "power" },
  { key: "torque", icon: Zap, field: "torque" },
  { key: "weight", icon: Weight, field: "weight" },
  { key: "topSpeed", icon: Wind, field: "topSpeed" },
  { key: "year", icon: Calendar, field: "year" },
  { key: "color", icon: Palette, field: "color" },
  { key: "mileage", icon: Gauge, field: "mileage" },
];

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

const cardReveal = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease, delay: i * 0.07 },
  }),
};

export default function BikeSpecs() {
  const { t } = useTranslation();
  const { ref, inView } = useScrollReveal();
  const { bike: bikeData } = useBikeData();
  const specsConfig = specsMeta.map((s) => ({
    ...s,
    value: String(bikeData[s.field] || ""),
  }));

  return (
    <section className="py-20 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none mb-14 text-text"
        >
          {t("myBike.sectionSpecs")}
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {specsConfig.map(({ key, icon: Icon, value }, i) => (
            <motion.div
              key={key}
              custom={i}
              variants={cardReveal}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="bg-surface border border-border p-6 hover:border-accent/40 transition-colors duration-300"
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
            >
              <Icon className="text-accent mb-3" size={22} />
              <p className="font-display text-3xl text-accent">{value}</p>
              <p className="font-sub text-xs tracking-widest uppercase text-muted mt-1">
                {t(`myBike.specs.${key}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
