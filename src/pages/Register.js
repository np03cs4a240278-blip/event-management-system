// Register.js — Sign up page
// Sends name + email + password to the PHP backend via API.post("/register")
// On success, redirects to login page

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import "./theme.css";
import "./Login.css";

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");
  const [submitting, setSubmitting]           = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" ? "/admin-dashboard" : "/user-dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      // POST /api/register → { name, email, password }
      await register({ name, email, password });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-header theme-header">
        <h1 className="site-name">EVENT MANAGEMENT SYSTEM</h1>
        <p className="site-tagline">Create your account to get started</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card" style={{ maxWidth: 480 }}>

          <h2 className="login-title">Sign Up</h2>
          <p className="login-sub">Fill in your details below</p>

          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="theme-input" placeholder="Enter your full name"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="theme-input" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="theme-input" placeholder="Minimum 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="theme-input" placeholder="Re-enter your password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="theme-btn login-submit-btn" disabled={submitting}>
              {submitting ? "Creating account..." : "Sign Up"}
            </button>

          </form>

          <p className="login-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="theme-link">Login</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
