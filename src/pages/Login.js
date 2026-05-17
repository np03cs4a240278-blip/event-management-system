import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import myLogo from "../assets/mylogo.png";
import "./theme.css";
import "./Login.css";

function getHomeRoute(user) {
  if (user?.must_change_password) return "/profile";
  return user?.role === "admin" ? "/admin/dashboard" : "/user-dashboard";
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login } = useAuth();
  const [role, setRole]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(location.state?.message || "");

  useEffect(() => {
    if (!loading && user) navigate(getHomeRoute(user), { replace: true });
  }, [loading, navigate, user]);

  // Switch role — pre-fill demo credentials so login is instant
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) { setError("Please select a role to continue."); return; }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const authenticatedUser = await login({ email, password, role });
      navigate(getHomeRoute(authenticatedUser), { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Login failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    const nextPath = email.trim()
      ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
      : "/forgot-password";

    navigate(nextPath);
  };

  return (
    <div className="login-page">

      <div className="login-header theme-header">
        <p className="site-tagline">Sign in to your account</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card">
          <img
            src={myLogo}
            alt="Event Management System"
            className="auth-card-logo"
            onClick={() => navigate("/")}
          />

          <h2 className="login-title">Welcome Back</h2>
          <p className="login-sub">Select your role and sign in to continue.</p>

          {loading && <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>Checking session...</p>}
          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          {/* ── ROLE SELECTOR ── */}
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
                <span className="role-option__icon">👤</span>
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
                <span className="role-option__icon">🛡️</span>
                <span className="role-option__text">Admin</span>
              </label>

            </div>
          </div>

          <form onSubmit={handleLogin} autoComplete="off">

            <div className="form-group">
              <label className="form-label">Email Address *</label>
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

            <div className="form-group">
              <label className="form-label">Password *</label>
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

            <button
              type="button"
              onClick={handleForgotPassword}
              style={{ background: "none", border: "none", color: "#818CF8", cursor: "pointer",
                       padding: 0, fontSize: 13, fontWeight: 600, marginBottom: 12, display: "block" }}
            >
              Forgot password?
            </button>

            <button type="submit" className="theme-btn login-submit-btn" disabled={submitting || loading}>
              {submitting ? "Signing in..." : `Login as ${role === "admin" ? "Admin" : role === "user" ? "User" : "..."}`}
            </button>

          </form>

          <p className="login-footer-text">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="theme-link">Register here</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
