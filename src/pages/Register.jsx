import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../api/endpoints";
import { auth } from "../firebase/firebase.config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast, Toaster } from "react-hot-toast";
import "./Pages.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photoURL: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isValidPassword = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const longEnough = pwd.length >= 6;
    return hasUpper && hasLower && longEnough;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isValidPassword(formData.password)) {
      toast.error(
        "Password must have uppercase, lowercase, and be at least 6 characters"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        displayName: formData.name,
        email: formData.email,
        photoURL: formData.photoURL,
        password: formData.password,
      });
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      login(user);
      toast.success("Account created successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
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
      toast.success("Signed up with Google");
      navigate("/dashboard");
    } catch (err) {
      console.error("Google register error:", err);

      // Handle popup blocker
      if (err.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups for this site.");
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled");
      } else if (err.code === "auth/cancelled-popup-request") {
        return;
      } else {
        toast.error(
          err.response?.data?.message || err.message || "Google signup failed"
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
      <Toaster position="top-center" reverseOrder={false} />
      <div className="form-container">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

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
            <label htmlFor="photoURL">Photo URL</label>
            <input
              id="photoURL"
              type="url"
              name="photoURL"
              value={formData.photoURL}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={handleGoogleRegister}
            disabled={loading}
            style={{ marginTop: 10 }}
          >
            {loading ? "Signing up..." : "Continue with Google"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
