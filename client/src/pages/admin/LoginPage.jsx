import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import useAuthStore from "../../store/authStore";
import Button from "../../components/ui/Button";
import PageTransition from "../../components/layout/PageTransition";

const loginSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(1).max(128),
});

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);
    try {
      await login(data);
    } catch {
      setError(t("admin.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md bg-surface border border-border p-10 shadow-2xl"
          {...(error && {
            animate: {
              scale: 1,
              opacity: 1,
              x: [0, -10, 10, -10, 10, 0],
            },
            transition: { duration: 0.4 },
          })}
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-text">
              MOTO <span className="text-accent">ADMIN</span>
            </h1>
            <p className="font-sub text-sm text-muted tracking-wider mt-2">
              {t("admin.loginTitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="font-sub text-xs tracking-widest uppercase text-muted block mb-2">
                {t("admin.username")}
              </label>
              <input
                {...register("username")}
                autoComplete="username"
                className="w-full bg-bg border border-border text-text font-body text-sm px-4 py-3 focus:outline-none focus:border-accent placeholder:text-muted transition-colors"
              />
              {errors.username && (
                <p className="text-danger text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="font-sub text-xs tracking-widest uppercase text-muted block mb-2">
                {t("admin.password")}
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full bg-bg border border-border text-text font-body text-sm px-4 py-3 pr-12 focus:outline-none focus:border-accent placeholder:text-muted transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-sm px-4 py-3 font-body">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                t("admin.loginButton")
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}
