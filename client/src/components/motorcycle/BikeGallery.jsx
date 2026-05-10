import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useBikeData } from "../../hooks/useBikeData";
import Modal from "../ui/Modal";

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

const imgReveal = {
  hidden: { opacity: 0, scale: 0.88, filter: "blur(10px)" },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease, delay: i * 0.1 },
  }),
};

export default function BikeGallery() {
  const { t } = useTranslation();
  const { ref, inView } = useScrollReveal();
  const { bike: bikeData } = useBikeData();
  const [selected, setSelected] = useState(null);

  const gridPositions = [
    "col-span-6 row-span-2",
    "col-span-3 row-span-1",
    "col-span-3 row-span-1",
    "col-span-3 row-span-1",
    "col-span-3 row-span-1",
  ];

  return (
    <section className="py-20 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none mb-14 text-text"
        >
          {t("myBike.sectionGallery")}
        </motion.h2>

        <div className="grid grid-cols-12 grid-rows-2 gap-2 auto-rows-[200px] md:auto-rows-[280px]">
          {bikeData.photos.map((photo, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={imgReveal}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className={`${gridPositions[i] || "col-span-3"} overflow-hidden cursor-pointer`}
              whileHover={{ scale: 1.03, transition: { duration: 0.4 } }}
              onClick={() => setSelected(photo)}
            >
              <img
                src={photo}
                alt={`${bikeData.brand} ${bikeData.model} - ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <img
            src={selected}
            alt={`${bikeData.brand} ${bikeData.model}`}
            className="w-full h-auto max-h-[85vh] object-contain"
          />
        )}
      </Modal>
    </section>
  );
}
