import client from "./axiosClient";

export const authApi = {
  login: (credentials) =>
    client.post("/api/auth/login", credentials).then((r) => r.data),
  refresh: () => client.post("/api/auth/refresh").then((r) => r.data),
  logout: () => client.post("/api/auth/logout").then((r) => r.data),
};
