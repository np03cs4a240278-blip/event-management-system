// Register.js — Sign up page
<<<<<<< HEAD
=======
// Sends name + email + password to the PHP backend via API.post("/register")
// On success, redirects to login page
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
<<<<<<< HEAD
import myLogo from "../assets/mylogo.png";
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import "./theme.css";
import "./Login.css";

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();

<<<<<<< HEAD
  const [role, setRole]                       = useState("user");
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState("");
  const [success, setSuccess]                 = useState("");
  const [submitting, setSubmitting]           = useState(false);

<<<<<<< HEAD
=======
  // If already logged in, redirect
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" ? "/admin-dashboard" : "/user-dashboard", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

<<<<<<< HEAD
    if (!role)                          { setError("Please select a role."); return; }
    if (password !== confirmPassword)   { setError("Passwords do not match."); return; }
    if (password.length < 6)            { setError("Password must be at least 6 characters."); return; }

    setSubmitting(true);
    try {
      await register({ name, email, password, role });
=======
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
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
<<<<<<< HEAD
        <img src={myLogo} alt="Event Management System"
          style={{ height: 70, width: "auto", margin: "0 auto 8px", display: "block" }} />
=======
        <h1 className="site-name">EVENT MANAGEMENT SYSTEM</h1>
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
        <p className="site-tagline">Create your account to get started</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card" style={{ maxWidth: 480 }}>

          <h2 className="login-title">Sign Up</h2>
          <p className="login-sub">Fill in your details below</p>

          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

<<<<<<< HEAD
          {/* ── ROLE SELECTOR ── */}
          <div className="role-selector">
            <p className="role-selector__label">Register as *</p>
            <div className="role-selector__options">

              <label className={`role-option ${role === "user" ? "role-option--active" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => { setRole("user"); setError(""); }}
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
                  onChange={() => { setRole("admin"); setError(""); }}
                />
                <span className="role-option__icon">🛡️</span>
                <span className="role-option__text">Admin</span>
              </label>

            </div>
          </div>

=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="theme-input" placeholder="Enter your full name"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
<<<<<<< HEAD
              <input type="email" className="theme-input" placeholder="you@gmail.com"
=======
              <input type="email" className="theme-input" placeholder="you@example.com"
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="theme-input" placeholder="Minimum 6 characters"
<<<<<<< HEAD
                autoComplete="new-password"
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className="theme-input" placeholder="Re-enter your password"
<<<<<<< HEAD
                autoComplete="new-password"
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="theme-btn login-submit-btn" disabled={submitting}>
<<<<<<< HEAD
              {submitting ? "Creating account..." : `Sign Up as ${role === "admin" ? "Admin" : "User"}`}
=======
              {submitting ? "Creating account..." : "Sign Up"}
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
