import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import myLogo from "../assets/mylogo.png";
import "./theme.css";
import "./Login.css";

const OTP_STORAGE_KEY = "ems.pending_verification";

function getHomeRoute(user) {
  if (user?.must_change_password) return "/profile";
  return user?.role === "admin" ? "/admin/dashboard" : "/user-dashboard";
}

function readStoredVerification() {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.sessionStorage.getItem(OTP_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

function writeStoredVerification(value) {
  if (typeof window === "undefined") return;

  if (!value?.email) {
    window.sessionStorage.removeItem(OTP_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(value));
}

function clearStoredVerification() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(OTP_STORAGE_KEY);
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
  if (data?.delivery_mode === "email" && data?.delivery_path) {
    return `OTP was sent to your email. Local demo backup is also saved to ${data.delivery_path}`;
  }

  if (data?.delivery_mode === "log" && data?.delivery_path) {
    return `Local demo mode: OTP was saved to ${data.delivery_path}`;
  }

  if (data?.delivery_mode === "existing") {
    return "A valid OTP is already active. Use that code or resend after the timer ends.";
  }

  if (data?.delivery_mode === "email") {
    return "A 6-digit OTP has been sent to your email address.";
  }

  return "";
}

function resolveTimestamp(explicitTimestamp, secondsFromNow) {
  const seconds = Number(secondsFromNow);

  if (Number.isFinite(seconds) && seconds > 0) {
    return new Date(Date.now() + (seconds * 1000)).toISOString();
  }

  return explicitTimestamp || "";
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, verifyOtp, resendOtp } = useAuth();
  const storedVerification = useMemo(() => readStoredVerification(), []);
  const locationState = location.state ?? {};
  const searchParams = new URLSearchParams(location.search);
  const initialEmail = searchParams.get("email") || locationState.email || storedVerification?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(locationState.message || "");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiresAt, setExpiresAt] = useState(
    resolveTimestamp(locationState.expires_at || storedVerification?.expires_at || "", locationState.expires_in_seconds)
  );
  const [resendAvailableAt, setResendAvailableAt] = useState(
    resolveTimestamp(
      locationState.resend_available_at || storedVerification?.resend_available_at || "",
      locationState.resend_in_seconds
    )
  );
  const [deliveryMode, setDeliveryMode] = useState(locationState.delivery_mode || storedVerification?.delivery_mode || "");
  const [deliveryPath, setDeliveryPath] = useState(locationState.delivery_path || storedVerification?.delivery_path || "");
  const [deliveryHint, setDeliveryHint] = useState(buildDeliveryHint(locationState) || buildDeliveryHint(storedVerification));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!loading && user) {
      clearStoredVerification();
      navigate(getHomeRoute(user), { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    writeStoredVerification({
      email,
      expires_at: expiresAt,
      resend_available_at: resendAvailableAt,
      delivery_mode: deliveryMode,
      delivery_path: deliveryPath,
    });
  }, [email, expiresAt, resendAvailableAt, deliveryMode, deliveryPath]);

  const expirySeconds = expiresAt ? getSecondsUntil(expiresAt, now) : 0;
  const resendSeconds = resendAvailableAt ? getSecondsUntil(resendAvailableAt, now) : 0;

  const handleVerify = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await verifyOtp({ email, otp });
      clearStoredVerification();
      setSuccess(response.message || "OTP verified successfully.");
      setTimeout(() => navigate(getHomeRoute(response.user), { replace: true }), 900);
    } catch (requestError) {
      const responseData = requestError?.response?.data;

      if (responseData?.otp_expired) {
        setExpiresAt("");
      }

      setError(getErrorMessage(requestError, "OTP verification failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await resendOtp({ email, purpose: "email_verification" });
      setExpiresAt(resolveTimestamp(response.expires_at, response.expires_in_seconds));
      setResendAvailableAt(resolveTimestamp(response.resend_available_at, response.resend_in_seconds));
      setDeliveryMode(response.delivery_mode || "");
      setDeliveryPath(response.delivery_path || "");
      setDeliveryHint(buildDeliveryHint(response));
      setOtp("");
      setSuccess(response.message || "A new OTP has been sent.");
      writeStoredVerification(response);
    } catch (requestError) {
      const responseData = requestError?.response?.data;

      if (responseData?.resend_available_at) {
        setResendAvailableAt(responseData.resend_available_at);
      }

      setError(getErrorMessage(requestError, "Could not resend OTP."));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header theme-header">
        <p className="site-tagline">Verify your email to continue</p>
      </div>

      <div className="login-wrapper">
        <div className="login-card theme-card" style={{ maxWidth: 480 }}>
          <img
            src={myLogo}
            alt="Event Management System"
            className="auth-card-logo"
            onClick={() => navigate("/")}
          />

          <h2 className="login-title">OTP Verification</h2>
          <p className="login-sub">Enter the 6-digit code sent to your email address.</p>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          {deliveryHint ? <div className="login-hint otp-hint">{deliveryHint}</div> : null}

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="theme-input"
                placeholder="you@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">OTP Code *</label>
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

            <div className="otp-meta">
              <span>OTP expires in: {expirySeconds > 0 ? formatCountdown(expirySeconds) : "Expired"}</span>
              <span>Resend in: {resendSeconds > 0 ? formatCountdown(resendSeconds) : "Available now"}</span>
            </div>

            <button type="submit" className="theme-btn login-submit-btn" disabled={submitting || loading}>
              {submitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="otp-actions">
            <button
              type="button"
              className="otp-link-button"
              disabled={resending || resendSeconds > 0 || !email.trim()}
              onClick={handleResend}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
            <Link to="/login" className="theme-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
