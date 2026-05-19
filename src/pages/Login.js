// Login.js — Login page with role selector and forgot password OTP flow

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  UserCircle,
  ShieldCheck,
  LogIn,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import "./theme.css";
import "./Login.css";

function getHomeRoute(user) {
  return user?.role === "admin" ? "/admin/dashboard" : "/user-dashboard";
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login, requestPasswordResetOtp } = useAuth();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!loading && user) navigate(getHomeRoute(user), { replace: true });
  }, [loading, navigate, user]);

  useEffect(() => {
    if (location.state?.message) {
      setInfo(location.state.message);
    }
  }, [location.state]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role to continue.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const authenticatedUser = await login({ email, password, role });
      navigate(getHomeRoute(authenticatedUser), { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Login failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then click Forgot password.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await requestPasswordResetOtp({ email });
      const responseData = response || {};
      navigate("/verify-otp", {
        state: {
          email,
          context: "forgot-password",
          redirectTo: "/login",
          message: responseData.message,
          expires_at: responseData.expires_at,
          expires_in_seconds: responseData.expires_in_seconds,
          resend_available_at: responseData.resend_available_at,
          resend_in_seconds: responseData.resend_in_seconds,
          delivery_mode: responseData.delivery_mode,
          delivery_path: responseData.delivery_path,
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header banner */}
      <div className="login-header theme-header">
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <Sparkles size={28} color="#1E1B4B" />
          <span style={{ fontSize: 22, fontWeight: 800, color: "#1E1B4B" }}>EventPro</span>
        </div>
        <p className="site-tagline">Sign in to your account</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-sub">Select your role and sign in</p>

          {loading && (
            <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
              Checking session...
            </p>
          )}

          {info && !error && (
            <div className="login-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={15} />
              {info}
            </div>
          )}

          {error && (
            <div className="login-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Role selector */}
          <div className="role-selector">
            <p className="role-selector__label">Login as *</p>
            <div className="role-selector__options">
              <label className={`role-option ${role === "user" ? "role-option--active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => handleRoleSelect("user")}
                />
                <span className="role-option__icon"><UserCircle size={22} /></span>
                <span className="role-option__text">User</span>
              </label>
              <label className={`role-option ${role === "admin" ? "role-option--active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === "admin"}
                  onChange={() => handleRoleSelect("admin")}
                />
                <span className="role-option__icon"><ShieldCheck size={22} /></span>
                <span className="role-option__text">Admin</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleLogin} autoComplete="off">
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
                autoComplete="off"
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
                placeholder="Enter your password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forgot password */}
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-primary-dark)",
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Lock size={12} />
              Forgot password?
            </button>

            <button
              type="submit"
              className="theme-btn login-submit-btn"
              disabled={submitting || loading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <LogIn size={16} />
              {submitting
                ? "Signing in..."
                : `Login as ${role === "admin" ? "Admin" : role === "user" ? "User" : "..."}`}
            </button>
          </form>

          <p className="login-footer-text">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="theme-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
