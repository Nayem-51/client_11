import { apiClient } from "./apiClient";

export const authAPI = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.get("/auth/me"),
};

export const lessonsAPI = {
  getAll: () => apiClient.get("/lessons"),
  getById: (id) => apiClient.get(`/lessons/${id}`),
  create: (data) => apiClient.post("/lessons", data),
  update: (id, data) => apiClient.put(`/lessons/${id}`, data),
  delete: (id) => apiClient.delete(`/lessons/${id}`),
  getPublic: () => apiClient.get("/lessons/public"),
  addFavorite: (id) => apiClient.post(`/lessons/${id}/favorite`),
  removeFavorite: (id) => apiClient.delete(`/lessons/${id}/favorite`),
};

export const userAPI = {
  getProfile: () => apiClient.get("/users/profile"),
  updateProfile: (data) => apiClient.put("/users/profile", data),
  getFavorites: () => apiClient.get("/users/favorites"),
};

export const stripeAPI = {
  createCheckoutSession: (payload) =>
    apiClient.post("/stripe/create-checkout-session", payload),
};
