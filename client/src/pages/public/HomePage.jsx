import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import PageTransition from "../../components/layout/PageTransition";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import VideoPlayer from "../../components/ui/VideoPlayer";
import ScrollVideoHero from "../../components/ui/ScrollVideoHero";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useBikeData } from "../../hooks/useBikeData";
import { videosApi } from "../../api/videos.api";
import { formatDate } from "../../utils/format";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 50, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: -60, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: 60, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { ref: bikeRef, inView: bikeInView } = useScrollReveal();
  const { ref: videosRef, inView: videosInView } = useScrollReveal();
  const { bike: bikeData } = useBikeData();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data: videosData } = useQuery({
    queryKey: ["videos", "latest"],
    queryFn: () => videosApi.getAll({ offset: 0, limit: 3 }),
  });

  const videos = videosData?.videos || [];

  return (
    <PageTransition>
      {/* HERO — scroll-driven video (falls back to image until video is added) */}
      <section className="relative">
        <ScrollVideoHero
          videoSrc={bikeData.heroVideo || null}
          posterSrc={bikeData.photos[0]}
          alt={`${bikeData.brand} ${bikeData.model}`}
          fallbackHeight="100vh"
        />

        {/* Overlay content pinned to screen */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="sticky top-0 h-screen flex items-end">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-accent" />
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex items-end justify-between pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 80, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="font-sub text-xs tracking-[0.2em] uppercase text-accent">
                    LIVE — RIDER
                  </span>
                </div>

                <h1 className="font-display text-[clamp(4rem,12vw,10rem)] leading-none text-text">
                  {t("hero.headline")}
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease, delay: 0.5 }}
                  className="font-body text-base text-muted max-w-xl mt-4 leading-relaxed"
                >
                  {t("hero.subline")}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease, delay: 0.7 }}
                  className="flex flex-wrap gap-4 mt-8"
                >
                  <Link to="/my-bike">
                    <Button>{t("hero.ctaBike")}</Button>
                  </Link>
                  <Link to="/videos">
                    <Button variant="ghost">{t("hero.ctaVideos")}</Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats (desktop) — count-in animation */}
              <motion.div
                initial={{ opacity: 0, x: 60, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1, ease, delay: 0.4 }}
                className="hidden lg:flex flex-col gap-6 text-right"
              >
                {[
                  { number: "12,000+", label: "km ridden" },
                  { number: "3", label: "years riding" },
                  { number: "1", label: "bike" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease, delay: 0.6 + i * 0.15 }}
                  >
                    <p className="font-display text-4xl text-text">
                      {stat.number}
                    </p>
                    <p className="font-sub text-xs tracking-widest uppercase text-muted">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BIKE TEASER */}
      <section className="py-20 lg:py-32" ref={bikeRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={bikeInView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          >
            <motion.div variants={slideRight} className="overflow-hidden">
              <motion.img
                src={bikeData.photos[1] || bikeData.photos[0]}
                alt={`${bikeData.brand} ${bikeData.model}`}
                className="w-full h-[400px] object-cover"
                loading="lazy"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease }}
              />
            </motion.div>

            <motion.div variants={slideLeft}>
              <p className="font-sub text-xs tracking-[0.2em] uppercase text-accent mb-4">
                {t("myBike.specs.brand")}: {bikeData.brand}
              </p>
              <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none text-text">
                {bikeData.model}
              </h2>

              <div className="mt-6 space-y-3">
                {[
                  [t("myBike.specs.year"), bikeData.year],
                  [t("myBike.specs.engine"), bikeData.engine],
                  [t("myBike.specs.power"), bikeData.power],
                ].map(([label, value], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 30 }}
                    animate={bikeInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, ease, delay: 0.3 + i * 0.1 }}
                    className="flex justify-between border-b border-border pb-2"
                  >
                    <span className="font-sub text-sm text-muted uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="font-body text-sm text-text">{value}</span>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/my-bike"
                className="inline-block mt-8 font-sub text-sm tracking-widest uppercase text-accent border-b border-accent pb-1 hover:text-accent2 hover:border-accent2 transition-colors"
              >
                {t("hero.ctaBike")} →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* LATEST VIDEOS TEASER */}
      {videos.length > 0 && (
        <section className="py-20 lg:py-32 bg-surface" ref={videosRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={videosInView ? "visible" : "hidden"}
              className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none mb-14 text-text"
            >
              {t("videos.pageTitle")}
            </motion.h2>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate={videosInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {videos.map((video) => (
                <motion.div key={video.id} variants={fadeScale}>
                  <Card onClick={() => setSelectedVideo(video)}>
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={
                          video.thumbnail
                            ? `/uploads/thumbnails/${video.thumbnail}`
                            : `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`
                        }
                        alt={video[`title_${lang}`] || video.title_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center">
                          <Play className="text-white ml-1" size={24} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-sub text-xl font-bold leading-tight text-text">
                        {video[`title_${lang}`] || video.title_en}
                      </h3>
                      <p className="font-body text-xs text-muted mt-2">
                        {t("videos.postedOn", {
                          date: formatDate(video.published_at, lang),
                        })}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-10">
              <Link
                to="/videos"
                className="font-sub text-sm tracking-widest uppercase text-accent border-b border-accent pb-1 hover:text-accent2 hover:border-accent2 transition-colors"
              >
                {t("videos.loadMore")} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Video Modal */}
      <Modal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)}>
        {selectedVideo && (
          <div className="bg-surface">
            <VideoPlayer url={selectedVideo.youtube_url} playing />
            <div className="p-6">
              <h3 className="font-sub text-xl font-bold text-text">
                {selectedVideo[`title_${lang}`] || selectedVideo.title_en}
              </h3>
              {selectedVideo[`desc_${lang}`] && (
                <p className="font-body text-sm text-muted mt-2">
                  {selectedVideo[`desc_${lang}`] || selectedVideo.desc_en}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}
