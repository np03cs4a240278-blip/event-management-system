import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OtpInput from "../components/OtpInput";
import ToastContainer from "../components/ToastContainer";
import useToast from "../hooks/useToast";
import myLogo from "../assets/mylogo.png";
import "../components/OtpVerification.css";
import "./theme.css";

// ── Constants ──────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds
const MOCK_OTP = "123456";   // Demo OTP — no real email is sent

// ── Helpers ────────────────────────────────────────────────────────────────
function generateMockOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0
    ? `${m}:${s.toString().padStart(2, "0")}`
    : `${s}s`;
}

// ── Component ──────────────────────────────────────────────────────────────
function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showToast } = useToast();

  // State passed from Register or Login (forgot-password flow)
  const {
    email = "",
    context = "registration", // "registration" | "forgot-password"
    redirectTo = "/login",
    userName = "",
  } = location.state || {};

  // OTP digits array
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));

  // UI states
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [hasError, setHasError] = useState(false);

  // Countdown timer
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // The "active" OTP for this session (mock)
  const activeOtpRef = useRef(MOCK_OTP);

  // ── Timer logic ──────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Start timer on mount and simulate initial OTP send
  useEffect(() => {
    startCountdown();
    // Show initial "OTP sent" toast after a brief delay
    const t = setTimeout(() => {
      showToast(
        `OTP sent successfully to ${email || "your email"}`,
        "info",
        4000
      );
    }, 600);

    return () => {
      clearTimeout(t);
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || sending) return;

    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");
    setDigits(Array(OTP_LENGTH).fill(""));
    setHasError(false);

    // Simulate network delay
    await new Promise((res) => setTimeout(res, 1200));

    // Generate a new mock OTP
    activeOtpRef.current = generateMockOtp();

    setSending(false);
    startCountdown();
    showToast(`OTP resent to ${email || "your email"}`, "success");
    setSuccessMsg("A new OTP has been sent to your email.");
  };

  // ── Verify OTP ───────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setHasError(false);

    const enteredOtp = digits.join("");

    // Validation: empty
    if (enteredOtp.length < OTP_LENGTH) {
      setErrorMsg(`Please enter all ${OTP_LENGTH} digits of your OTP.`);
      setHasError(true);
      return;
    }

    setVerifying(true);

    // Simulate verification delay
    await new Promise((res) => setTimeout(res, 1500));

    // Mock check: accept MOCK_OTP ("123456") OR the dynamically generated one
    const isValid =
      enteredOtp === MOCK_OTP || enteredOtp === activeOtpRef.current;

    if (!isValid) {
      setVerifying(false);
      setHasError(true);
      setErrorMsg("Invalid OTP. Please check and try again.");
      showToast("Invalid OTP entered.", "error");
      return;
    }

    // ── Success ──
    setVerifying(false);
    setVerified(true);
    clearInterval(timerRef.current);
    showToast("OTP verified successfully! 🎉", "success", 4000);

    // Redirect after a short celebration delay
    setTimeout(() => {
      navigate(redirectTo, {
        replace: true,
        state:
          context === "forgot-password"
            ? { otpVerified: true, email }
            : undefined,
      });
    }, 2200);
  };

  // ── Context label ────────────────────────────────────────────────────────
  const contextLabel =
    context === "forgot-password" ? "Password Reset" : "Registration";
  const contextIcon = context === "forgot-password" ? "🔑" : "📝";

  // ── Verified success screen ───────────────────────────────────────────────
  if (verified) {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <div className="otp-page">
          <div className="otp-header theme-header">
            <img
              src={myLogo}
              alt="Event Management System"
              className="otp-header__logo"
              onClick={() => navigate("/")}
            />
            <p className="otp-header__tagline">OTP Verification</p>
          </div>

          <div className="otp-wrapper">
            <div className="otp-card">
              <div className="otp-success-state">
                <div className="otp-success-state__icon">✅</div>
                <h3>Verified Successfully!</h3>
                <p>
                  {context === "forgot-password"
                    ? "Your identity has been confirmed. Redirecting you to reset your password..."
                    : "Your account has been verified. Redirecting you to login..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main OTP form ─────────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} />

      <div className="otp-page">
        {/* Header */}
        <div className="otp-header theme-header">
          <img
            src={myLogo}
            alt="Event Management System"
            className="otp-header__logo"
            onClick={() => navigate("/")}
          />
          <p className="otp-header__tagline">Secure OTP Verification</p>
        </div>

        {/* Card */}
        <div className="otp-wrapper">
          <div className="otp-card">

            {/* Shield icon */}
            <div className="otp-icon" aria-hidden="true">🔐</div>

            {/* Context badge */}
            <div className="otp-context-badge">
              <span>{contextIcon}</span>
              <span>{contextLabel}</span>
            </div>

            {/* Title */}
            <h1 className="otp-title">Enter Verification Code</h1>
            <p className="otp-subtitle">
              Enter the OTP sent to your email
              {email ? (
                <>
                  {" "}
                  <span className="otp-email-highlight">{email}</span>
                </>
              ) : null}
              {userName ? `, ${userName}` : ""}
            </p>

            {/* OTP form */}
            <form onSubmit={handleVerify} noValidate>
              <OtpInput
                value={digits}
                onChange={(next) => {
                  setDigits(next);
                  setHasError(false);
                  setErrorMsg("");
                }}
                disabled={verifying || sending}
                hasError={hasError}
              />

              {/* Expiry hint */}
              <p className="otp-expiry">
                OTP expires in 10 minutes &bull; Demo code:{" "}
                <strong style={{ color: "#818CF8" }}>123456</strong>
              </p>

              {/* Validation messages */}
              {errorMsg && (
                <div className="otp-message otp-message--error" role="alert">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && !errorMsg && (
                <div className="otp-message otp-message--info" role="status">
                  <span>💜</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Verify button */}
              <button
                type="submit"
                className="otp-verify-btn"
                disabled={verifying || sending}
                aria-busy={verifying}
              >
                {verifying ? (
                  <>
                    <span className="otp-spinner" aria-hidden="true" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="otp-divider">Didn&apos;t receive it?</div>

            {/* Resend section */}
            <div className="otp-resend">
              <p className="otp-resend__text">
                {canResend
                  ? "You can now request a new OTP."
                  : "Resend available in:"}
              </p>

              {!canResend && (
                <div className="otp-countdown" aria-live="polite">
                  <span>⏱</span>
                  <span className="otp-countdown__timer">
                    {formatCountdown(countdown)}
                  </span>
                </div>
              )}

              <button
                type="button"
                className="otp-resend__btn"
                onClick={handleResend}
                disabled={!canResend || sending}
                style={{ marginTop: canResend ? 8 : 6, display: "block", margin: "8px auto 0" }}
              >
                {sending ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span
                      className="otp-spinner"
                      style={{ width: 13, height: 13, borderWidth: 2 }}
                      aria-hidden="true"
                    />
                    Sending...
                  </span>
                ) : (
                  "Resend OTP"
                )}
              </button>
            </div>

            {/* Back link */}
            <div className="otp-back">
              <button
                type="button"
                className="otp-back__btn"
                onClick={() => navigate(-1)}
              >
                ← Go back
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default OtpVerification;
