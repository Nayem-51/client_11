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
  getPublic: (params) => apiClient.get("/lessons/public", { params }),
  addFavorite: (id) => apiClient.post(`/lessons/${id}/favorite`),
  removeFavorite: (id) => apiClient.delete(`/lessons/${id}/favorite`),
  toggleFeature: (id) => apiClient.put(`/lessons/${id}/feature`),
};

export const userAPI = {
  getProfile: () => apiClient.get("/users/profile"),
  updateProfile: (data) => apiClient.put("/users/profile", data),
  getFavorites: () => apiClient.get("/users/favorites"),
};

export const adminAPI = {
  getStats: () => apiClient.get("/admin/stats"),
  getUsers: (params) => apiClient.get("/admin/users", { params }),
  changeUserRole: (userId, role) =>
    apiClient.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => apiClient.put(`/admin/users/${userId}/deactivate`), // Using deactivate as delete
  getLessons: (params) => apiClient.get("/admin/lessons", { params }),
  toggleLessonFeature: (lessonId) =>
    apiClient.put(`/admin/lessons/${lessonId}/feature`),
  deleteLesson: (lessonId) => apiClient.delete(`/admin/lessons/${lessonId}`),
  markAsReviewed: (lessonId) =>
    apiClient.put(`/admin/lessons/${lessonId}/review`),
  getReportedLessons: (params) =>
    apiClient.get("/admin/reported-lessons", { params }),
  getReports: (params) => apiClient.get("/admin/reports", { params }),
  resolveReport: (reportId, data) =>
    apiClient.put(`/admin/reports/${reportId}/resolve`, data),
};

export const categoriesAPI = {
  getAll: () => apiClient.get("/categories"),
  create: (data) => apiClient.post("/categories", data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

export const stripeAPI = {
  createCheckoutSession: (payload) =>
    apiClient.post("/stripe/create-checkout-session", payload),
  manualUpgrade: (userId) => apiClient.post(`/stripe/manual-upgrade/${userId}`),
};
