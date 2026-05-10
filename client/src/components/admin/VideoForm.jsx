import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { videosApi } from "../../api/videos.api";

const videoSchema = z.object({
  youtube_url: z
    .string()
    .url()
    .refine(
      (url) =>
        /^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(url) ||
        /^https:\/\/youtu\.be\//.test(url),
      { message: "Must be a valid YouTube URL" },
    ),
  title_en: z.string().min(3).max(150).trim(),
  title_fr: z.string().min(3).max(150).trim(),
  title_ro: z.string().min(3).max(150).trim(),
  desc_en: z.string().max(2000).trim().optional().or(z.literal("")),
  desc_fr: z.string().max(2000).trim().optional().or(z.literal("")),
  desc_ro: z.string().max(2000).trim().optional().or(z.literal("")),
});

export default function VideoForm({ video, onClose }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [langTab, setLangTab] = useState("en");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [youtubePreview, setYoutubePreview] = useState(null);

  const isEditing = !!video;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      youtube_url: video?.youtube_url || "",
      title_en: video?.title_en || "",
      title_fr: video?.title_fr || "",
      title_ro: video?.title_ro || "",
      desc_en: video?.desc_en || "",
      desc_fr: video?.desc_fr || "",
      desc_ro: video?.desc_ro || "",
    },
  });

  const youtubeUrl = watch("youtube_url");

  useEffect(() => {
    const id =
      youtubeUrl?.match(/[?&]v=([^&]+)/)?.[1] ||
      youtubeUrl?.match(/youtu\.be\/([^?]+)/)?.[1];
    if (id) {
      setYoutubePreview(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
    } else {
      setYoutubePreview(null);
    }
  }, [youtubeUrl]);

  const mutation = useMutation({
    mutationFn: (formData) =>
      isEditing
        ? videosApi.update(video.id, formData)
        : videosApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success(t("admin.form.saveSuccess"));
      onClose();
    },
    onError: () => {
      toast.error(t("errors.serverError"));
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== "") formData.append(k, v);
    });
    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }
    mutation.mutate(formData);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
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
        {isEditing ? t("admin.editVideo") : t("admin.addVideo")}
      </h2>

      {/* YouTube URL */}
      <div>
        <label className="font-sub text-xs tracking-widest uppercase text-muted block mb-2">
          {t("admin.form.youtubeUrl")}
        </label>
        <input
          {...register("youtube_url")}
          className="w-full bg-bg border border-border text-text font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-muted transition-colors"
          placeholder={t("admin.form.youtubeUrlHint")}
        />
        {errors.youtube_url && (
          <p className="text-danger text-xs mt-1">
            {errors.youtube_url.message}
          </p>
        )}
        {youtubePreview && (
          <img
            src={youtubePreview}
            alt="YouTube preview"
            className="mt-2 w-full max-w-xs aspect-video object-cover border border-border"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
      </div>

      {/* Language tabs */}
      <div className="flex gap-1 border-b border-border">
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

      {/* Title & Description per language */}
      {tabs.map((tab) => (
        <div
          key={tab.code}
          className={langTab === tab.code ? "space-y-4" : "hidden"}
        >
          <div>
            <label className="font-sub text-xs tracking-widest uppercase text-muted block mb-2">
              {t(
                `admin.form.title${tab.code.charAt(0).toUpperCase() + tab.code.slice(1)}`,
              )}
            </label>
            <input
              {...register(`title_${tab.code}`)}
              className="w-full bg-bg border border-border text-text font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-muted transition-colors"
            />
            {errors[`title_${tab.code}`] && (
              <p className="text-danger text-xs mt-1">
                {errors[`title_${tab.code}`].message}
              </p>
            )}
          </div>
          <div>
            <label className="font-sub text-xs tracking-widest uppercase text-muted block mb-2">
              {t(
                `admin.form.desc${tab.code.charAt(0).toUpperCase() + tab.code.slice(1)}`,
              )}
            </label>
            <textarea
              {...register(`desc_${tab.code}`)}
              rows={4}
              className="w-full bg-bg border border-border text-text font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-muted transition-colors resize-y"
            />
          </div>
        </div>
      ))}

      {/* Thumbnail upload */}
      <div>
        <label className="font-sub text-xs tracking-widest uppercase text-muted block mb-2">
          {t("admin.form.thumbnail")}
        </label>
        <p className="text-xs text-muted mb-2">
          {t("admin.form.thumbnailHint")}
        </p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-muted hover:text-text cursor-pointer transition-colors font-sub text-sm tracking-wider uppercase">
            <Upload size={16} />
            Choose file
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </label>
          {thumbnailPreview && (
            <div className="relative">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-20 h-12 object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                }}
                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}
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
