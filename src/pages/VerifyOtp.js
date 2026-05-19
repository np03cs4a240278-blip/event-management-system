// VerifyOtp.js — Real OTP verification (registration + password reset)
// Uses lucide-react icons

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
} from "lucide-react";
import OtpInput from "../components/OtpInput";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import AppLogo from "../components/AppLogo";
import "../components/OtpVerification.css";
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

function buildDeliveryHint(data) {
  if (data?.delivery_mode === "email") return "A 6-digit OTP has been sent to your email address.";
  if (data?.delivery_mode === "log" && data?.delivery_path) {
    const reason = data?.delivery_error ? ` Email delivery error: ${data.delivery_error}` : "";
    return `OTP could not be delivered by email. It was saved to ${data.delivery_path}.${reason}`;
  }
  if (data?.delivery_mode === "existing") return "A valid OTP is already active. Use that code or resend after the timer ends.";
  return "";
}

function resolveTimestamp(explicitTimestamp, secondsFromNow) {
  const seconds = Number(secondsFromNow);
  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(Date.now() + seconds * 1000).toISOString();
  }
  return explicitTimestamp || "";
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, verifyOtp, resendOtp, resetPasswordWithOtp } = useAuth();
  const locationState = location.state ?? {};
  const searchParams = new URLSearchParams(location.search);
  const otpContext = locationState.context || "";
  const initialEmail = searchParams.get("email") || locationState.email || "";

  const [email] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(locationState.message || "");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [expiresAt, setExpiresAt] = useState(
    resolveTimestamp(locationState.expires_at || "", locationState.expires_in_seconds),
  );
  const [resendAvailableAt, setResendAvailableAt] = useState(
    resolveTimestamp(locationState.resend_available_at || "", locationState.resend_in_seconds),
  );
  const [deliveryHint, setDeliveryHint] = useState(buildDeliveryHint(locationState));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!loading && user) navigate(getHomeRoute(user), { replace: true });
  }, [loading, navigate, user]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const expirySeconds = expiresAt ? getSecondsUntil(expiresAt, now) : 0;
  const resendSeconds = resendAvailableAt ? getSecondsUntil(resendAvailableAt, now) : 0;

  const contextLabel = otpContext === "forgot-password" ? "PASSWORD RESET" : "OTP VERIFICATION";

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError("Please enter the full 6-digit code."); setSubmitting(false); return; }
    try {
      const response = await verifyOtp({
        email,
        otp,
        purpose: otpContext === "forgot-password" ? "password_reset" : "email_verification",
      });
      if (otpContext === "forgot-password") {
        setOtpVerified(true);
        setSuccess(response.message || "OTP verified successfully. You may now reset your password.");
      } else {
        setSuccess(response.message || "OTP verified successfully.");
        setTimeout(() => navigate(getHomeRoute(response.user), { replace: true }), 900);
      }
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      if (responseData?.otp_expired) setExpiresAt("");
      setError(getErrorMessage(requestError, "OTP verification failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setResetting(true);
    setError("");
    setSuccess("");
    if (!otpVerified) { setError("Verify the OTP first before resetting your password."); setResetting(false); return; }
    if (newPassword !== confirmPassword) { setError("New password and confirm password must match."); setResetting(false); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); setResetting(false); return; }
    try {
      const response = await resetPasswordWithOtp({ email, otp: otpDigits.join(""), new_password: newPassword, confirm_password: confirmPassword });
      setSuccess(response.message || "Password reset successful.");
      setOtpDigits(Array(6).fill(""));
      setNewPassword("");
      setConfirmPassword("");
      setExpiresAt("");
      setResendAvailableAt("");
      setDeliveryHint("");
      setOtpVerified(false);
      window.setTimeout(() => {
        navigate("/login", { replace: true, state: { message: response.message || "Password reset successful. Please login with your new password." } });
      }, 900);
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      if (responseData?.otp_expired) setExpiresAt("");
      setError(getErrorMessage(requestError, "Could not reset password."));
    } finally {
      setResetting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    try {
      const response = await resendOtp({ email, purpose: otpContext === "forgot-password" ? "password_reset" : "email_verification" });
      setExpiresAt(resolveTimestamp(response.expires_at, response.expires_in_seconds));
      setResendAvailableAt(resolveTimestamp(response.resend_available_at, response.resend_in_seconds));
      setDeliveryHint(buildDeliveryHint(response));
      setOtpDigits(Array(6).fill(""));
      setSuccess(response.message || (otpContext === "forgot-password" ? "A new password reset OTP has been sent." : "A new OTP has been sent."));
      setOtpVerified(false);
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      if (responseData?.resend_available_at) setResendAvailableAt(responseData.resend_available_at);
      setError(getErrorMessage(requestError, "Could not resend OTP."));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-page">
      {/* Header */}
      <div className="otp-header theme-header">
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 6, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <AppLogo size="md" />
        </div>
        <p className="otp-header__tagline">Secure OTP Verification</p>
      </div>

      <div className="otp-wrapper">
        <div className="otp-card">
          {/* Shield icon */}
          <div className="otp-icon" aria-hidden="true">
            <ShieldCheck size={32} color="#1E1B4B" />
          </div>

          {/* Context badge */}
          <div className="otp-context-badge">
            {otpContext === "forgot-password" ? <KeyRound size={12} /> : <ShieldCheck size={12} />}
            <span>{contextLabel}</span>
          </div>

          <h1 className="otp-title">Enter Verification Code</h1>
          <p className="otp-subtitle">
            Enter the OTP sent to your email
            {email ? <> <span className="otp-email-highlight">{email}</span></> : null}
          </p>

          {/* Messages */}
          {error && (
            <div className="otp-message otp-message--error" role="alert">
              <AlertTriangle size={15} />
              <span>{error}</span>
            </div>
          )}
          {success && !error && (
            <div className="otp-message otp-message--success" role="status">
              <CheckCircle size={15} />
              <span>{success}</span>
            </div>
          )}
          {deliveryHint ? (
            <div className="otp-message otp-message--info" role="status">
              <Info size={15} />
              <span>{deliveryHint}</span>
            </div>
          ) : null}

          {/* OTP form */}
          <form
            onSubmit={otpContext === "forgot-password" && otpVerified ? handleResetPassword : handleVerifyOtp}
            noValidate
          >
            <OtpInput
              value={otpDigits}
              onChange={(next) => { setOtpDigits(next); setError(""); setSuccess(""); }}
              disabled={submitting || loading || resending || resetting || (otpContext === "forgot-password" && otpVerified)}
              hasError={Boolean(error)}
            />

            <p className="otp-expiry" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Clock size={12} />
              {expirySeconds > 0 ? `OTP expires in ${formatCountdown(expirySeconds)}` : "OTP expired."}
            </p>

            {/* Password reset fields */}
            {otpContext === "forgot-password" && otpVerified ? (
              <>
                <div className="form-group" style={{ marginTop: 16 }}>
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
                    Confirm Password *
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
              </>
            ) : null}

            <button
              type="submit"
              className="otp-verify-btn"
              disabled={submitting || loading || resetting}
              aria-busy={submitting || resetting}
            >
              {submitting || resetting ? (
                <><span className="otp-spinner" aria-hidden="true" />
                  {otpContext === "forgot-password" && otpVerified ? "Resetting Password..." : "Verifying..."}</>
              ) : otpContext === "forgot-password" && otpVerified ? (
                <><KeyRound size={16} /> Reset Password</>
              ) : (
                <><ShieldCheck size={16} /> Verify OTP</>
              )}
            </button>
          </form>

          <div className="otp-divider">Didn&apos;t receive it?</div>

          {/* Resend section */}
          <div className="otp-resend">
            <p className="otp-resend__text">
              {resendSeconds > 0 ? "Resend available in:" : "You can request a new OTP now."}
            </p>
            {resendSeconds > 0 && (
              <div className="otp-countdown" aria-live="polite">
                <Clock size={13} />
                <span className="otp-countdown__timer">{formatCountdown(resendSeconds)}</span>
              </div>
            )}
            <button
              type="button"
              className="otp-resend__btn"
              onClick={handleResend}
              disabled={resending || resendSeconds > 0 || !email.trim()}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <RefreshCw size={13} />
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          {/* Back button */}
          <div className="otp-back">
            <button
              type="button"
              className="otp-back__btn"
              onClick={() => navigate(-1)}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <ArrowLeft size={14} />
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
