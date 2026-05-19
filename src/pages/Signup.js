// Signup.js — Alternative sign up page
// Uses lucide-react icons

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircle, Mail, Lock, UserPlus, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";

function Signup() {
  const navigate = useNavigate();
  const { user, loading, register } = useAuth();
  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [feedback, setFeedback]             = useState({ type: "", text: "" });

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/user-dashboard", { replace: true });
    }
  }, [loading, navigate, user]);

  const handleSignup = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "", text: "" });
    try {
      await register({ name, email, password });
      setFeedback({ type: "success", text: "Account created successfully. Please login to continue." });
      setTimeout(() => navigate("/", { replace: true }), 1500);
    } catch (requestError) {
      setFeedback({ type: "error", text: getErrorMessage(requestError, "Signup failed.") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Sparkles size={22} color="#818CF8" />
          <p className="eyebrow" style={{ margin: 0 }}>Create your account</p>
        </div>

        <h1>Join EventPro</h1>
        <p className="auth-subtitle">Register as a user to explore events and manage your bookings.</p>

        {feedback.text ? (
          <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {feedback.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {feedback.text}
          </p>
        ) : null}

        <form className="auth-form" onSubmit={handleSignup}>
          <label className="field">
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <UserCircle size={14} /> Full name
            </span>
            <input
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              type="text"
              value={name}
            />
          </label>

          <label className="field">
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={14} /> Email
            </span>
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Lock size={14} /> Password
            </span>
            <input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              type="password"
              value={password}
            />
          </label>

          <label className="field">
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Lock size={14} /> Confirm password
            </span>
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <button
            className="button auth-button"
            disabled={submitting || loading}
            type="submit"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <UserPlus size={16} />
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
