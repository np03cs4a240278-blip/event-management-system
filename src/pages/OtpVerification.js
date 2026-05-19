// OtpVerification.js — Demo OTP page (mock, no real backend call)
// Uses lucide-react icons

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  Clock,
} from "lucide-react";
import OtpInput from "../components/OtpInput";
import ToastContainer from "../components/ToastContainer";
import useToast from "../hooks/useToast";
import "../components/OtpVerification.css";
import "./theme.css";

// ── Constants ──────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds
const MOCK_OTP = "123456";  // Demo OTP

// ── Helpers ────────────────────────────────────────────────────────────────
function generateMockOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

// ── Component ──────────────────────────────────────────────────────────────
function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, showToast } = useToast();

  const {
    email = "",
    context = "registration",
    redirectTo = "/login",
    userName = "",
  } = location.state || {};

  const [digits, setDigits]       = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending]     = useState(false);
  const [verified, setVerified]   = useState(false);
  const [errorMsg, setErrorMsg]   = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [hasError, setHasError]   = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);
  const activeOtpRef = useRef(MOCK_OTP);

  // ── Timer ──────────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startCountdown();
    const t = setTimeout(() => {
      showToast(`OTP sent successfully to ${email || "your email"}`, "info", 4000);
    }, 600);
    return () => { clearTimeout(t); clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resend ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || sending) return;
    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");
    setDigits(Array(OTP_LENGTH).fill(""));
    setHasError(false);
    await new Promise((res) => setTimeout(res, 1200));
    activeOtpRef.current = generateMockOtp();
    setSending(false);
    startCountdown();
    showToast(`OTP resent to ${email || "your email"}`, "success");
    setSuccessMsg("A new OTP has been sent to your email.");
  };

  // ── Verify ─────────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setHasError(false);
    const enteredOtp = digits.join("");
    if (enteredOtp.length < OTP_LENGTH) {
      setErrorMsg(`Please enter all ${OTP_LENGTH} digits of your OTP.`);
      setHasError(true);
      return;
    }
    setVerifying(true);
    await new Promise((res) => setTimeout(res, 1500));
    const isValid = enteredOtp === MOCK_OTP || enteredOtp === activeOtpRef.current;
    if (!isValid) {
      setVerifying(false);
      setHasError(true);
      setErrorMsg("Invalid OTP. Please check and try again.");
      showToast("Invalid OTP entered.", "error");
      return;
    }
    setVerifying(false);
    setVerified(true);
    clearInterval(timerRef.current);
    showToast("OTP verified successfully!", "success", 4000);
    setTimeout(() => {
      navigate(redirectTo, {
        replace: true,
        state: context === "forgot-password" ? { otpVerified: true, email } : undefined,
      });
    }, 2200);
  };

  const contextLabel = context === "forgot-password" ? "Password Reset" : "Registration";

  // ── Success screen ─────────────────────────────────────────────────────
  if (verified) {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <div className="otp-page">
          <div className="otp-header theme-header">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}
              onClick={() => navigate("/")}>
              <Sparkles size={22} color="#1E1B4B" />
              <span style={{ fontSize: 16, fontWeight: 800, color: "#1E1B4B" }}>EventPro</span>
            </div>
          </div>
          <div className="otp-wrapper">
            <div className="otp-card">
              <div className="otp-success-state">
                <div className="otp-success-state__icon">
                  <CheckCircle size={56} color="#065F46" />
                </div>
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

  // ── Main OTP form ──────────────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} />
      <div className="otp-page">
        {/* Header */}
        <div className="otp-header theme-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}
            onClick={() => navigate("/")}>
            <Sparkles size={22} color="#1E1B4B" />
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1E1B4B" }}>EventPro</span>
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
              {context === "forgot-password" ? <KeyRound size={12} /> : <ShieldCheck size={12} />}
              <span>{contextLabel}</span>
            </div>

            <h1 className="otp-title">Enter Verification Code</h1>
            <p className="otp-subtitle">
              Enter the OTP sent to your email
              {email ? <> <span className="otp-email-highlight">{email}</span></> : null}
              {userName ? `, ${userName}` : ""}
            </p>

            {/* OTP form */}
            <form onSubmit={handleVerify} noValidate>
              <OtpInput
                value={digits}
                onChange={(next) => { setDigits(next); setHasError(false); setErrorMsg(""); }}
                disabled={verifying || sending}
                hasError={hasError}
              />

              <p className="otp-expiry" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Clock size={12} />
                OTP expires in 10 minutes · Demo code:{" "}
                <strong style={{ color: "#818CF8" }}>123456</strong>
              </p>

              {errorMsg && (
                <div className="otp-message otp-message--error" role="alert">
                  <AlertTriangle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && !errorMsg && (
                <div className="otp-message otp-message--info" role="status">
                  <Info size={15} />
                  <span>{successMsg}</span>
                </div>
              )}

              <button type="submit" className="otp-verify-btn" disabled={verifying || sending} aria-busy={verifying}>
                {verifying ? (
                  <><span className="otp-spinner" aria-hidden="true" /> Verifying...</>
                ) : (
                  <><ShieldCheck size={16} /> Verify OTP</>
                )}
              </button>
            </form>

            <div className="otp-divider">Didn&apos;t receive it?</div>

            {/* Resend */}
            <div className="otp-resend">
              <p className="otp-resend__text">
                {canResend ? "You can now request a new OTP." : "Resend available in:"}
              </p>
              {!canResend && (
                <div className="otp-countdown" aria-live="polite">
                  <Clock size={13} />
                  <span className="otp-countdown__timer">{formatCountdown(countdown)}</span>
                </div>
              )}
              <button
                type="button"
                className="otp-resend__btn"
                onClick={handleResend}
                disabled={!canResend || sending}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8 }}
              >
                {sending ? (
                  <><span className="otp-spinner" style={{ width: 13, height: 13, borderWidth: 2 }} aria-hidden="true" /> Sending...</>
                ) : (
                  <><RefreshCw size={13} /> Resend OTP</>
                )}
              </button>
            </div>

            {/* Back */}
            <div className="otp-back">
              <button type="button" className="otp-back__btn" onClick={() => navigate(-1)}
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <ArrowLeft size={14} />
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OtpVerification;
