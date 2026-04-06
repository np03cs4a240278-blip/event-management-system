import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";

function getHomeRoute(user) {
  if (user?.must_change_password) {
    return "/profile";
  }

  return user?.role === "admin" ? "/admin/dashboard" : "/events";
}

function Login() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate(getHomeRoute(user), {
        replace: true,
      });
    }
  }, [loading, navigate, user]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const authenticatedUser = await login({ email, password });
      navigate(getHomeRoute(authenticatedUser), {
        replace: true,
      });
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
      const response = await API.post("/forgot-password", {
        email,
      });

      const defaultPassword = response.data.default_password || "";
      setPassword(defaultPassword);
      window.alert(`Your default password for your account is "${defaultPassword}"`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Event System</p>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to browse events or manage the platform.</p>

        {loading ? <p className="message">Checking your session...</p> : null}
        {error ? <p className="message message-error">{error}</p> : null}

        <form className="auth-form" onSubmit={handleLogin}>
          <label className="field">
            <span>Email</span>
            <input
              onChange={(inputEvent) => setEmail(inputEvent.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              onChange={(inputEvent) => setPassword(inputEvent.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </label>

          <button
            onClick={handleForgotPassword}
            style={{
              background: "none",
              border: "none",
              color: "#8b5cf6",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
            type="button"
          >
            Forgot password?
          </button>

          <button className="button auth-button" disabled={submitting || loading} type="submit">
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Create one here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
