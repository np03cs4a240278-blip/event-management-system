<<<<<<< HEAD
import { useState } from "react";
import API from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("login.php", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      window.location = "/events";
    } catch {
      alert("Login failed");
=======
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
>>>>>>> Backend
    }
  };

  return (
<<<<<<< HEAD
    <div style={styles.page}>
      {/* Gradient header */}
      <div style={styles.header}></div>

      {/* Login card */}
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email HERE"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button style={styles.button}>Login</button>
        </form>

        <p style={styles.links}>
          Don't have an account? <a href="/signup">Signup</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#F8F9FD",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "300px",
    background: "linear-gradient(135deg,#FBCFE8,#A5B4FC)",
    borderBottomLeftRadius: "50% 20%",
    borderBottomRightRadius: "50% 20%",
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "320px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 2,
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  inputGroup: {
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    border: "none",
    borderBottom: "2px solid #A5B4FC",
    padding: "8px",
    outline: "none",
  },

  button: {
    width: "100%",
    background: "#A5B4FC",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  links: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default Login;
=======
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
>>>>>>> Backend
