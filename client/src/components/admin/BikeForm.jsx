import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { bikesApi } from "../../api/bikes.api";

const bikeSchema = z.object({
  brand: z.string().min(1).max(100).trim(),
  model: z.string().min(1).max(100).trim(),
  year: z.coerce.number().int().min(1900).max(2100),
  color: z.string().max(100).trim().optional().or(z.literal("")),
  engine: z.string().max(100).trim().optional().or(z.literal("")),
  power: z.string().max(100).trim().optional().or(z.literal("")),
  torque: z.string().max(100).trim().optional().or(z.literal("")),
  weight: z.string().max(100).trim().optional().or(z.literal("")),
  top_speed: z.string().max(100).trim().optional().or(z.literal("")),
  mileage: z.string().max(100).trim().optional().or(z.literal("")),
  hero_video: z.string().max(500).trim().optional().or(z.literal("")),
  story_en: z.string().max(5000).trim().optional().or(z.literal("")),
  story_fr: z.string().max(5000).trim().optional().or(z.literal("")),
  story_ro: z.string().max(5000).trim().optional().or(z.literal("")),
});

const inputClass =
  "w-full bg-bg border border-border text-text font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-muted transition-colors";

function Field({ label, error, children }) {
  return (
    <div>
      <label className="font-sub text-xs tracking-widest uppercase text-muted block mb-2">
        {label}
      </label>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error.message}</p>}
    </div>
  );
}

export default function BikeForm({ bike, onClose }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [langTab, setLangTab] = useState("en");
  const [photos, setPhotos] = useState(bike?.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!bike;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bikeSchema),
    defaultValues: {
      brand: bike?.brand || "",
      model: bike?.model || "",
      year: bike?.year || new Date().getFullYear(),
      color: bike?.color || "",
      engine: bike?.engine || "",
      power: bike?.power || "",
      torque: bike?.torque || "",
      weight: bike?.weight || "",
      top_speed: bike?.top_speed || "",
      mileage: bike?.mileage || "",
      hero_video: bike?.hero_video || "",
      story_en: bike?.story_en || "",
      story_fr: bike?.story_fr || "",
      story_ro: bike?.story_ro || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing ? bikesApi.update(bike.id, data) : bikesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bike-active"] });
      toast.success(t("admin.form.saveSuccess"));
      onClose();
    },
    onError: () => toast.error(t("errors.serverError")),
  });

  const onSubmit = (data) => {
    mutation.mutate({ ...data, photos });
  };

  const addPhoto = () => {
    const url = newPhotoUrl.trim();
    if (url && !photos.includes(url)) {
      setPhotos([...photos, url]);
      setNewPhotoUrl("");
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(files.map((f) => bikesApi.uploadPhoto(f)));
      setPhotos((prev) => [...prev, ...results.map((r) => r.url)]);
    } catch {
      toast.error(t("errors.serverError"));
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected later
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const tabs = [
    { code: "en", label: "🇬🇧 EN" },
    { code: "fr", label: "🇫🇷 FR" },
    { code: "ro", label: "🇷🇴 RO" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="font-display text-3xl text-text">
        {isEditing ? t("admin.editBike") : t("admin.addBike")}
      </h2>

      {/* Basic info row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={t("myBike.specs.brand")} error={errors.brand}>
          <input {...register("brand")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.model")} error={errors.model}>
          <input {...register("model")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.year")} error={errors.year}>
          <input type="number" {...register("year")} className={inputClass} />
        </Field>
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t("myBike.specs.color")} error={errors.color}>
          <input {...register("color")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.engine")} error={errors.engine}>
          <input {...register("engine")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.power")} error={errors.power}>
          <input {...register("power")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.torque")} error={errors.torque}>
          <input {...register("torque")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.weight")} error={errors.weight}>
          <input {...register("weight")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.topSpeed")} error={errors.top_speed}>
          <input {...register("top_speed")} className={inputClass} />
        </Field>
        <Field label={t("myBike.specs.mileage")} error={errors.mileage}>
          <input {...register("mileage")} className={inputClass} />
        </Field>
        <Field label={t("admin.bikeForm.heroVideo")} error={errors.hero_video}>
          <input
            {...register("hero_video")}
            className={inputClass}
            placeholder="/hero.mp4"
          />
        </Field>
      </div>

      {/* Language tabs for story */}
      <div>
        <p className="font-sub text-xs tracking-widest uppercase text-muted mb-3">
          {t("myBike.sectionStory")}
        </p>
        <div className="flex gap-1 border-b border-border mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.code}
              type="button"
              onClick={() => setLangTab(tab.code)}
              className={`px-4 py-2 font-sub text-sm tracking-wider transition-colors ${
                langTab === tab.code
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted hover:text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {tabs.map((tab) => (
          <div key={tab.code} className={langTab === tab.code ? "" : "hidden"}>
            <textarea
              {...register(`story_${tab.code}`)}
              rows={5}
              className={`${inputClass} resize-y`}
              placeholder={t("myBike.storyPlaceholder")}
            />
          </div>
        ))}
      </div>

      {/* Photos */}
      <div>
        <p className="font-sub text-xs tracking-widest uppercase text-muted mb-3">
          {t("admin.bikeForm.photos")}
        </p>

        {/* Photo thumbnails */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {photos.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-20 object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-danger text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload from device */}
        <div className="mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-3 border border-dashed border-border text-muted hover:border-accent hover:text-accent transition-colors font-body text-sm w-full justify-center disabled:opacity-50"
          >
            <Upload size={16} />
            {uploading
              ? t("admin.bikeForm.uploading")
              : t("admin.bikeForm.uploadFromDevice")}
          </button>
        </div>

        {/* Add by URL */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhoto();
              }
            }}
            className={`${inputClass} flex-1`}
            placeholder={t("admin.bikeForm.photoUrlPlaceholder")}
          />
          <Button type="button" onClick={addPhoto} className="shrink-0">
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? t("admin.form.saving") : t("admin.form.save")}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          {t("admin.form.cancel")}
        </Button>
      </div>
    </form>
  );
}
