import React, { createContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api/endpoints";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, []);

  const syncUserFromApi = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      // backend returns { success: true, data: { user: {...} } }
      // axios response.data is the body.
      const currentUser =
        response.data?.data?.user ||
        response.data?.user ||
        response.data ||
        null;

      if (currentUser) {
        console.log(
          "✓ User synced from API - isPremium:",
          currentUser.isPremium,
          "- Email:",
          currentUser.email
        );
        // Create a new object to force re-render
        const updatedUser = { ...currentUser };
        setUser(updatedUser);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        console.warn("No user data received from API");
      }
    } catch (error) {
      console.error(
        "Failed to sync user from backend:",
        error?.message || error
      );
      // Don't logout on refresh errors, just log them
      if (error?.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }

    // Always re-sync from backend (single source of truth for premium plan)
    syncUserFromApi();
  }, [syncUserFromApi]);

  const login = (token, userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    refreshUser: syncUserFromApi,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
