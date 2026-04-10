import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";

function Signup() {
  const navigate = useNavigate();
  const { user, loading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/events", { replace: true });
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
        <p className="eyebrow">Create your account</p>
        <h1>Join Event</h1>
        <p className="auth-subtitle">Register as a user to explore events and manage your bookings.</p>

        {feedback.text ? (
          <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>
            {feedback.text}
          </p>
        ) : null}

        <form className="auth-form" onSubmit={handleSignup}>
          <label className="field">
            <span>Full name</span>
            <input
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              type="text"
              value={name}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              type="password"
              value={password}
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <button className="button auth-button" disabled={submitting || loading} type="submit">
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
