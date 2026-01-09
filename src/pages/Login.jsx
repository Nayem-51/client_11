import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import { toast, Toaster } from "react-hot-toast";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase.config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
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
      toast.success("Google login successful!");
      setTimeout(() => navigate(from, { replace: true }), 1000);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Google sign-in failed";
      toast.error(msg);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("admin@example.com");
    setPassword("123456");
    toast.success("Credentials filled! Click Login.");
  };

  return (
    <div className="auth-page">
      <Toaster position="top-center" />
      <div className="form-container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
           <h2 style={{ marginBottom: "0.5rem" }}>Welcome Back</h2>
           <p className="text-muted" style={{ margin: 0 }}>
             Sign in to access your lessons and progress
           </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginBottom: "1rem" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.5rem" }}>
             <button
               type="button"
               onClick={handleDemoLogin}
               className="btn btn-secondary"
               style={{ fontSize: "0.85rem" }}
             >
               🪄 Demo User
             </button>
             <button
               type="button"
               onClick={handleGoogleLogin}
               className="btn btn-secondary"
               style={{ fontSize: "0.85rem" }}
             >
               🇬 Google
             </button>
          </div>

          <div className="auth-link">
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
