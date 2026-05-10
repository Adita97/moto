import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import VideoForm from "../../components/admin/VideoForm";
import { videosApi } from "../../api/videos.api";
import { formatDate } from "../../utils/format";

export default function VideoManagerPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["videos", "admin-all"],
    queryFn: () => videosApi.getAll({ offset: 0, limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => videosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success(t("admin.form.deleteSuccess"));
      setDeleteId(null);
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const videos = data?.videos || [];

  const openCreate = () => {
    setEditingVideo(null);
    setFormOpen(true);
  };

  const openEdit = (video) => {
    setEditingVideo(video);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-text">
          {t("admin.videosTitle")}
        </h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          {t("admin.addVideo")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-accent" size={32} />
        </div>
      ) : videos.length === 0 ? (
        <p className="text-muted font-body">{t("videos.noVideos")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="font-sub text-xs tracking-widest uppercase text-muted text-left py-3 px-2">
                  Thumbnail
                </th>
                <th className="font-sub text-xs tracking-widest uppercase text-muted text-left py-3 px-2">
                  Title (EN)
                </th>
                <th className="font-sub text-xs tracking-widest uppercase text-muted text-left py-3 px-2 hidden sm:table-cell">
                  Date
                </th>
                <th className="font-sub text-xs tracking-widest uppercase text-muted text-right py-3 px-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className="border-b border-border/50 hover:bg-surface2/50"
                >
                  <td className="py-3 px-2">
                    <img
                      src={
                        video.thumbnail
                          ? `/uploads/thumbnails/${video.thumbnail}`
                          : `https://img.youtube.com/vi/${video.youtube_id}/default.jpg`
                      }
                      alt={video.title_en}
                      className="w-20 h-12 object-cover"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-sub text-sm font-bold text-text">
                      {video.title_en}
                    </p>
                  </td>
                  <td className="py-3 px-2 hidden sm:table-cell">
                    <p className="font-body text-xs text-muted">
                      {formatDate(video.published_at, lang)}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(video)}
                        className="p-2 text-muted hover:text-accent transition-colors"
                        title={t("admin.editVideo")}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(video.id)}
                        className="p-2 text-muted hover:text-danger transition-colors"
                        title={t("admin.deleteVideo")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Video Form Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)}>
        <div className="bg-surface p-6 lg:p-10 border border-border max-h-[85vh] overflow-y-auto">
          <VideoForm video={editingVideo} onClose={() => setFormOpen(false)} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-surface p-8 border border-border text-center max-w-sm mx-auto">
          <p className="font-body text-text mb-6">{t("admin.confirmDelete")}</p>
          <div className="flex justify-center gap-4">
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                t("admin.deleteVideo")
              )}
            </Button>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              {t("admin.form.cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
