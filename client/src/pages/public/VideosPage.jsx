import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Loader } from "lucide-react";
import PageTransition from "../../components/layout/PageTransition";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import VideoPlayer from "../../components/ui/VideoPlayer";
import { videosApi } from "../../api/videos.api";
import { formatDate } from "../../utils/format";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function VideosPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["videos"],
      queryFn: ({ pageParam = 0 }) =>
        videosApi.getAll({ offset: pageParam, limit: 9 }),
      getNextPageParam: (lastPage, pages) =>
        lastPage.hasMore ? pages.length * 9 : undefined,
      initialPageParam: 0,
    });

  const allVideos = data?.pages.flatMap((p) => p.videos) || [];

  return (
    <PageTransition>
      <section className="pt-28 pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-none mb-14 text-text"
          >
            {t("videos.pageTitle")}
          </motion.h1>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader className="animate-spin text-accent" size={32} />
            </div>
          ) : allVideos.length === 0 ? (
            <p className="font-body text-lg text-muted text-center py-20">
              {t("videos.noVideos")}
            </p>
          ) : (
            <>
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {allVideos.map((video) => (
                  <motion.div key={video.id} variants={fadeUp}>
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

              {hasNextPage && (
                <div className="text-center mt-10">
                  <Button
                    variant="ghost"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      t("videos.loadMore")
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <Modal isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)}>
        {selectedVideo && (
          <div className="bg-surface">
            <VideoPlayer url={selectedVideo.youtube_url} playing />
            <div className="p-6">
              <h3 className="font-sub text-xl font-bold text-text">
                {selectedVideo[`title_${lang}`] || selectedVideo.title_en}
              </h3>
              {(selectedVideo[`desc_${lang}`] || selectedVideo.desc_en) && (
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
