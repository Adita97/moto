import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { authApi } from "../api/auth.api";
import toast from "react-hot-toast";

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth, isAuthenticated, user, isLoading } =
    useAuthStore();

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      setAuth(data.accessToken, data.user);
      navigate("/admin");
    },
    [setAuth, navigate],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout even if API fails
    }
    clearAuth();
    navigate("/admin/login");
    toast.success("Logged out");
  }, [clearAuth, navigate]);

  const tryRefresh = useCallback(async () => {
    try {
      const data = await authApi.refresh();
      setAuth(data.accessToken, data.user);
    } catch {
      clearAuth();
    }
  }, [setAuth, clearAuth]);

  return { login, logout, tryRefresh, isAuthenticated, user, isLoading };
}
