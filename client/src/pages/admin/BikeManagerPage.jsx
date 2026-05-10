import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, Loader } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import BikeForm from "../../components/admin/BikeForm";
import { bikesApi } from "../../api/bikes.api";

export default function BikeManagerPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data: bikes = [], isLoading } = useQuery({
    queryKey: ["bikes"],
    queryFn: bikesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bikesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bike-active"] });
      toast.success(t("admin.bikeForm.deleteSuccess"));
      setDeleteId(null);
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => bikesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bike-active"] });
      toast.success(t("admin.bikeForm.activateSuccess"));
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const openCreate = () => {
    setEditingBike(null);
    setFormOpen(true);
  };

  const openEdit = (bike) => {
    setEditingBike(bike);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-text">
          {t("admin.bikesTitle")}
        </h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          {t("admin.addBike")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-accent" size={32} />
        </div>
      ) : bikes.length === 0 ? (
        <p className="text-muted font-body">{t("admin.noBikes")}</p>
      ) : (
        <div className="space-y-3">
          {bikes.map((bike) => (
            <div
              key={bike.id}
              className={`flex items-center gap-4 p-4 border transition-colors ${
                bike.is_active
                  ? "bg-accent/5 border-accent/30"
                  : "bg-surface border-border"
              }`}
            >
              {/* Photo preview */}
              {bike.photos?.[0] && (
                <img
                  src={bike.photos[0]}
                  alt={`${bike.brand} ${bike.model}`}
                  className="w-20 h-14 object-cover border border-border shrink-0"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-sub text-sm font-bold text-text truncate">
                    {bike.brand} {bike.model}
                  </p>
                  {bike.is_active === 1 && (
                    <span className="px-2 py-0.5 bg-accent/20 text-accent font-sub text-[10px] tracking-widest uppercase">
                      {t("admin.activeBike")}
                    </span>
                  )}
                </div>
                <p className="font-body text-xs text-muted">
                  {bike.year} · {bike.engine || "—"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {bike.is_active !== 1 && (
                  <button
                    onClick={() => activateMutation.mutate(bike.id)}
                    className="p-2 text-muted hover:text-gold transition-colors"
                    title={t("admin.setActive")}
                    disabled={activateMutation.isPending}
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  onClick={() => openEdit(bike)}
                  className="p-2 text-muted hover:text-accent transition-colors"
                  title={t("admin.editBike")}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteId(bike.id)}
                  className="p-2 text-muted hover:text-danger transition-colors"
                  title={t("admin.deleteBike")}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bike Form Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)}>
        <div className="bg-surface p-6 lg:p-10 border border-border max-h-[85vh] overflow-y-auto">
          <BikeForm bike={editingBike} onClose={() => setFormOpen(false)} />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-surface p-8 border border-border text-center max-w-sm mx-auto">
          <p className="font-body text-text mb-6">
            {t("admin.confirmDeleteBike")}
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                t("admin.deleteBike")
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
