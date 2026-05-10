import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Video, Calendar, Globe, Plus } from "lucide-react";
import useAuthStore from "../../store/authStore";
import Button from "../../components/ui/Button";
import { videosApi } from "../../api/videos.api";
import { formatDate } from "../../utils/format";

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["videos", "admin-all"],
    queryFn: () => videosApi.getAll({ offset: 0, limit: 100 }),
  });

  const videos = data?.videos || [];
  const totalVideos = data?.total || 0;
  const lastUpload = videos.length > 0 ? videos[0].published_at : null;
  const langCoverage = videos.filter(
    (v) => v.title_en && v.title_fr && v.title_ro,
  ).length;

  const stats = [
    { icon: Video, label: t("admin.totalVideos"), value: totalVideos },
    {
      icon: Calendar,
      label: t("admin.lastUpload"),
      value: lastUpload ? formatDate(lastUpload, lang) : "—",
    },
    {
      icon: Globe,
      label: t("admin.langCoverage"),
      value: `${langCoverage}/${totalVideos}`,
    },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-text mb-8">
        {t("admin.welcome", { name: user?.username || "Admin" })}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border p-6 flex items-start gap-4"
          >
            <stat.icon className="text-accent mt-1" size={22} />
            <div>
              <p className="font-display text-3xl text-text">{stat.value}</p>
              <p className="font-sub text-xs tracking-widest uppercase text-muted mt-1">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="font-sub text-sm tracking-widest uppercase text-muted mb-4">
          {t("admin.quickActions")}
        </h2>
        <Link to="/admin/videos">
          <Button>
            <Plus size={16} />
            {t("admin.addVideo")}
          </Button>
        </Link>
      </div>

      {/* Recent Videos */}
      {videos.length > 0 && (
        <div>
          <h2 className="font-sub text-sm tracking-widest uppercase text-muted mb-4">
            {t("admin.recentVideos")}
          </h2>
          <div className="space-y-2">
            {videos.slice(0, 5).map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 bg-surface border border-border p-3"
              >
                <img
                  src={
                    video.thumbnail
                      ? `/uploads/thumbnails/${video.thumbnail}`
                      : `https://img.youtube.com/vi/${video.youtube_id}/default.jpg`
                  }
                  alt={video.title_en}
                  className="w-16 h-10 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sub text-sm font-bold text-text truncate">
                    {video.title_en}
                  </p>
                  <p className="font-body text-xs text-muted">
                    {formatDate(video.published_at, lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
