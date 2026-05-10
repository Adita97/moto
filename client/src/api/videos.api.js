import client from "./axiosClient";

export const videosApi = {
  getAll: ({ offset = 0, limit = 9 } = {}) =>
    client
      .get("/api/videos", { params: { offset, limit } })
      .then((r) => r.data),

  getOne: (id) => client.get(`/api/videos/${id}`).then((r) => r.data),

  create: (formData) =>
    client
      .post("/api/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (id, formData) =>
    client
      .put(`/api/videos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  delete: (id) => client.delete(`/api/videos/${id}`).then((r) => r.data),
};
