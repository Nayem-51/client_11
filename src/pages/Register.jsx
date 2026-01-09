import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import { toast, Toaster } from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase.config";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photoURL: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.register(formData);
      login(data.token, data.user);
      toast.success("Registration successful!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const { data } = await authAPI.googleLogin({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });

      login(data.data.token, data.data.user);
      toast.success("Google registration successful!");
      setTimeout(() => navigate("/", { replace: true }), 1000);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Google registration failed";
      toast.error(msg);
    }
  };

  return (
    <div className="auth-page">
      <Toaster position="top-center" />
      <div className="form-container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
           <h2 style={{ marginBottom: "0.5rem" }}>Create Account</h2>
           <p className="text-muted" style={{ margin: 0 }}>
             Join our community of lifelong learners
           </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Photo URL (Optional)</label>
            <input
              type="url"
              name="photoURL"
              placeholder="https://..."
              value={formData.photoURL}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginBottom: "1rem" }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          
           <button
             type="button"
             onClick={handleGoogleSignup}
             className="btn btn-secondary btn-block"
             style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}
           >
             🇬 Sign up with Google
           </button>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
