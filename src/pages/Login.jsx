import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../api/endpoints";
import { auth } from "../firebase/firebase.config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import "./Pages.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      login(user);
      showToast("Logged in successfully", "success");
      navigate("/dashboard");
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setToast(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      // Sync with backend
      await authAPI.register({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName:
          firebaseUser.displayName || firebaseUser.email.split("@")[0],
        photoURL: firebaseUser.photoURL,
      });

      localStorage.setItem("token", token);

      // Fetch user from backend to get complete data
      const userResponse = await authAPI.getCurrentUser();
      const backendUser =
        userResponse.data?.data?.user || userResponse.data?.user;

      login(backendUser);
      showToast("Logged in with Google", "success");
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);

      // Handle popup blocker
      if (err.code === "auth/popup-blocked") {
        showToast(
          "Popup was blocked. Please allow popups for this site.",
          "error"
        );
      } else if (err.code === "auth/popup-closed-by-user") {
        showToast("Sign-in cancelled", "error");
      } else if (err.code === "auth/cancelled-popup-request") {
        // User clicked button multiple times, ignore
        return;
      } else {
        showToast(
          err.response?.data?.message || err.message || "Google login failed",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="page auth-page">
      <div className="form-container">
        <h2>Login</h2>
        {toast && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ marginTop: 10 }}
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
