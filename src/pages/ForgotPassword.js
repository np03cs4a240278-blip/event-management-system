// ForgotPassword.js — Password reset via email OTP

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  KeyRound,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import AppLogo from "../components/AppLogo";
import "./theme.css";
import "./Login.css";

function getHomeRoute(user) {
  return user?.role === "admin" ? "/admin/dashboard" : "/user-dashboard";
}

function getSecondsUntil(timestamp, currentTime) {
  if (!timestamp) return 0;
  const seconds = Math.floor((new Date(timestamp).getTime() - currentTime) / 1000);
  return seconds > 0 ? seconds : 0;
}

function formatCountdown(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function resolveTimestamp(explicitTimestamp, secondsFromNow) {
  const seconds = Number(secondsFromNow);
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(Date.now() + (seconds * 1000)).toISOString();
  }
  return explicitTimestamp || "";
}

function buildDeliveryHint(data) {
  if (data?.delivery_mode === "log" && data?.delivery_path) {
    const reason = data?.delivery_error ? ` Email delivery error: ${data.delivery_error}` : "";
    return `Password reset OTP could not be delivered by email. It was saved to ${data.delivery_path}.${reason}`;
  }
  if (data?.delivery_mode === "existing") {
    return "A valid password reset OTP is already active. Use that code or resend after the timer ends.";
  }
  if (data?.delivery_mode === "email") {
    return "A 6-digit password reset OTP has been sent to your email address.";
  }
  return "";
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, requestPasswordResetOtp, resetPasswordWithOtp, resendOtp } = useAuth();
  const searchParams = new URLSearchParams(location.search);

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [resendAvailableAt, setResendAvailableAt] = useState("");
  const [now, setNow] = useState(Date.now());
  const [deliveryHint, setDeliveryHint] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate(getHomeRoute(user), { replace: true });
  }, [loading, navigate, user]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const expirySeconds = expiresAt ? getSecondsUntil(expiresAt, now) : 0;
  const resendSeconds = resendAvailableAt ? getSecondsUntil(resendAvailableAt, now) : 0;

  const handleSendOtp = async () => {
    if (!email.trim()) { setError("Enter your email first."); return; }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const response = await requestPasswordResetOtp({ email });
      setOtpRequested(true);
      setOtp("");
      setExpiresAt(resolveTimestamp(response.expires_at, response.expires_in_seconds));
      setResendAvailableAt(resolveTimestamp(response.resend_available_at, response.resend_in_seconds));
      setDeliveryHint(buildDeliveryHint(response));
      setSuccess(response.message || "Password reset OTP has been sent.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not send password reset OTP."));
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) { setError("New password and confirm password must match."); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    setResetting(true);
    setError("");
    setSuccess("");
    try {
      const response = await resetPasswordWithOtp({ email, otp, new_password: newPassword, confirm_password: confirmPassword });
      setOtpRequested(false);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setExpiresAt("");
      setResendAvailableAt("");
      setDeliveryHint("");
      setSuccess(response.message || "Password reset successful.");
      window.setTimeout(() => {
        navigate("/login", { replace: true, state: { message: response.message || "Password reset successful. Please login." } });
      }, 1000);
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      if (responseData?.otp_expired) setExpiresAt("");
      setError(getErrorMessage(requestError, "Could not reset password."));
    } finally {
      setResetting(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    try {
      const response = await resendOtp({ email, purpose: "password_reset" });
      setOtpRequested(true);
      setOtp("");
      setExpiresAt(resolveTimestamp(response.expires_at, response.expires_in_seconds));
      setResendAvailableAt(resolveTimestamp(response.resend_available_at, response.resend_in_seconds));
      setDeliveryHint(buildDeliveryHint(response));
      setSuccess(response.message || "A new password reset OTP has been sent.");
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      if (responseData?.resend_available_at) setResendAvailableAt(responseData.resend_available_at);
      setError(getErrorMessage(requestError, "Could not resend password reset OTP."));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-page">
      {/* Header */}
      <div className="login-header theme-header">
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 8, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <AppLogo size="lg" />
        </div>
        <p className="site-tagline">Reset your password with email OTP</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card" style={{ maxWidth: 500 }}>
          {/* Icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <KeyRound size={28} color="#1E1B4B" />
            </div>
          </div>

          <h2 className="login-title">Forgot Password</h2>
          <p className="login-sub">Enter your email, receive OTP, then set a new password.</p>

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
          {deliveryHint ? (
            <div className="login-hint otp-hint" style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {deliveryHint}
            </div>
          ) : null}

          {/* Email field */}
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
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <button
            type="button"
            className="theme-btn login-submit-btn"
            onClick={handleSendOtp}
            disabled={sending || loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
          >
            <Send size={15} />
            {sending ? "Sending OTP..." : otpRequested ? "Send OTP Again" : "Send Reset OTP"}
          </button>

          {/* OTP + new password form */}
          {otpRequested ? (
            <form onSubmit={handleResetPassword} style={{ marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <KeyRound size={14} />
                  OTP Code *
                </label>
                <input
                  type="text"
                  className="theme-input otp-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Lock size={14} />
                  New Password *
                </label>
                <input
                  type="password"
                  className="theme-input"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Lock size={14} />
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  className="theme-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="otp-meta">
                <span>OTP expires in: {expirySeconds > 0 ? formatCountdown(expirySeconds) : "Expired"}</span>
                <span>Resend in: {resendSeconds > 0 ? formatCountdown(resendSeconds) : "Available now"}</span>
              </div>

              <button
                type="submit"
                className="theme-btn login-submit-btn"
                disabled={resetting || loading}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <KeyRound size={15} />
                {resetting ? "Resetting Password..." : "Verify OTP & Reset Password"}
              </button>
            </form>
          ) : null}

          <div className="otp-actions">
            <button
              type="button"
              className="otp-link-button"
              disabled={resending || resendSeconds > 0 || !email.trim() || !otpRequested}
              onClick={handleResendOtp}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <RefreshCw size={13} />
              {resending ? "Sending..." : "Resend OTP"}
            </button>
            <Link to="/login" className="theme-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
