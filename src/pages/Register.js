// Register.js — Sign up page with lucide-react icons

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserCircle,
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import AppLogo from "../components/AppLogo";
import "./theme.css";
import "./Login.css";

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/user-dashboard", { replace: true });
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
      const response = await register({ name, email, password, role: "user" });
      setSuccess(
        response?.message || "Account created successfully. Please login to continue.",
      );
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message: response?.message || "Account created successfully. Please login to continue.",
          },
        });
      }, 800);
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header banner */}
      <div className="login-header theme-header">
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 8, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <AppLogo size="lg" />
        </div>
        <p className="site-tagline">Create your account to get started</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card" style={{ maxWidth: 480 }}>
          <h2 className="login-title">Sign Up</h2>
          <p className="login-sub">Fill in your details below</p>

          {error && (
            <div className="login-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}
          {success && (
            <div className="login-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={15} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <UserCircle size={14} />
                Full Name *
              </label>
              <input
                type="text"
                className="theme-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Mail size={14} />
                Email Address *
              </label>
              <input
                type="email"
                className="theme-input"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Lock size={14} />
                Password *
              </label>
              <input
                type="password"
                className="theme-input"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Lock size={14} />
                Confirm Password *
              </label>
              <input
                type="password"
                className="theme-input"
                placeholder="Re-enter your password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <p className="login-sub" style={{ margin: "0 0 16px", textAlign: "left" }}>
              New registrations are created as user accounts.
            </p>

            <button
              type="submit"
              className="theme-btn login-submit-btn"
              disabled={submitting}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <UserPlus size={16} />
              {submitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="login-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="theme-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
