import client from "./axiosClient";

export const bikesApi = {
  getActive: () => client.get("/api/bikes/active").then((r) => r.data),

  getAll: () => client.get("/api/bikes").then((r) => r.data),

  getOne: (id) => client.get(`/api/bikes/${id}`).then((r) => r.data),

  create: (data) => client.post("/api/bikes", data).then((r) => r.data),

  update: (id, data) =>
    client.put(`/api/bikes/${id}`, data).then((r) => r.data),

  activate: (id) =>
    client.patch(`/api/bikes/${id}/activate`).then((r) => r.data),

  delete: (id) => client.delete(`/api/bikes/${id}`).then((r) => r.data),

  // Upload a single image file — returns { url: '/uploads/bike-photos/...' }
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return client
      .post("/api/bikes/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
