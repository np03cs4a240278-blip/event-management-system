// Login.js — Sign in page
// Sends email + password to the PHP backend via API.post("/login")
// On success, AuthContext saves the user and redirects to dashboard

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import "./theme.css";
import "./Login.css";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" ? "/admin-dashboard" : "/user-dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // POST /api/login → { email, password }
      const loggedInUser = await login({ email, password });
      navigate(loggedInUser.role === "admin" ? "/admin-dashboard" : "/user-dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-header theme-header">
        <h1 className="site-name">EVENT MANAGEMENT SYSTEM</h1>
        <p className="site-tagline">Sign in to your account</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card">

          <h2 className="login-title">Welcome Back</h2>
          <p className="login-sub">Enter your details to continue</p>

          {loading && <p style={{ textAlign: "center", color: "#9CA3AF" }}>Checking session...</p>}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="theme-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="theme-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="theme-btn login-submit-btn"
              disabled={submitting || loading}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <p className="login-footer-text">
            Don't have an account?{" "}
            <Link to="/register" className="theme-link">Register here</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
