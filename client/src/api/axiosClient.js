import axios from "axios";
import useAuthStore from "../store/authStore";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

// Request interceptor: attach access token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 → auto-refresh
let refreshing = false;
let waitQueue = [];

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    // Don't intercept the refresh call itself, or already-retried requests
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/api/auth/refresh")
    ) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          waitQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }

      original._retry = true;
      refreshing = true;

      try {
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );
        useAuthStore.getState().setAuth(data.accessToken, data.user);
        waitQueue.forEach((q) => q.resolve(data.accessToken));
        waitQueue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch (e) {
        waitQueue.forEach((q) => q.reject(e));
        waitQueue = [];
        useAuthStore.getState().clearAuth();
        return Promise.reject(e);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

export default client;
