// Profile.js — User/Admin profile page with password change
// Uses lucide-react icons

import { useState } from "react";
import {
  UserCircle,
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import Navbar from "./Navbar";
import "./theme.css";
import "./DashboardShared.css";

function Profile() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback({ type: "error", text: "All password fields are required." });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", text: "New password and confirm password must match." });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "", text: "" });
    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback({ type: "success", text: response.message || "Password changed successfully." });
    } catch (requestError) {
      setFeedback({ type: "error", text: getErrorMessage(requestError, "Could not change password.") });
    } finally {
      setSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  // Password input with show/hide toggle
  function PasswordField({ label, value, onChange, show, onToggle, placeholder, autoComplete }) {
    return (
      <div className="form-group">
        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Lock size={14} />
          {label}
        </label>
        <div style={{ position: "relative" }}>
          <input
            autoComplete={autoComplete}
            className="theme-input"
            onChange={onChange}
            placeholder={placeholder}
            required
            type={show ? "text" : "password"}
            value={value}
            style={{ paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={onToggle}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 0 }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <Navbar />

      {/* Hero */}
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">
          <UserCircle size={22} />
          My Profile
        </h1>
        <p className="dash-hero-sub">
          {isAdmin
            ? "Manage your admin account details and update your password."
            : "View your account details and update your password."}
        </p>
      </div>

      <div className="dash-content">
        {feedback.text ? (
          <div className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {feedback.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {feedback.text}
          </div>
        ) : null}

        {/* Profile info card */}
        <div className="theme-card" style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
            background: isAdmin
              ? "linear-gradient(135deg, #f97316, #ef4444)"
              : "linear-gradient(135deg, #A5B4FC, #818CF8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem", fontWeight: 800, color: "#fff",
            boxShadow: "0 4px 16px rgba(165,180,252,0.3)",
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1E1B4B" }}>{user?.name}</h2>
              <span className={`theme-badge ${user?.role}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {isAdmin ? <ShieldCheck size={12} /> : <UserCircle size={12} />}
                {user?.role === "admin" ? "Admin" : "User"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</p>
                <p style={{ margin: 0, fontSize: 14, color: "#1E1B4B", display: "flex", alignItems: "center", gap: 4 }}>
                  <Mail size={13} color="#818CF8" />
                  {user?.email}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Account Type</p>
                <p style={{ margin: 0, fontSize: 14, color: "#1E1B4B", textTransform: "capitalize", display: "flex", alignItems: "center", gap: 4 }}>
                  {isAdmin ? <ShieldCheck size={13} color="#818CF8" /> : <UserCircle size={13} color="#818CF8" />}
                  {user?.role}
                </p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password Status</p>
                <p style={{ margin: 0, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle size={13} color="#065F46" />
                  <span style={{ color: "#065F46", fontWeight: 700 }}>Up to date</span>
                </p>
              </div>
              {isAdmin ? (
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Access Level</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E1B4B", display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={13} color="#818CF8" />
                    Full admin access
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Admin capabilities */}
        {isAdmin ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="theme-card">
              <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#1E1B4B", display: "flex", alignItems: "center", gap: 6 }}>
                <Settings size={16} color="#818CF8" />
                Admin Capabilities
              </h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#6B7280", lineHeight: 2, fontSize: 14 }}>
                <li>Create, edit and delete events</li>
                <li>View all user bookings</li>
                <li>Confirm or remove bookings</li>
                <li>Write admin notes on bookings</li>
                <li>Access full platform dashboard</li>
              </ul>
            </div>
            <div className="theme-card">
              <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#1E1B4B", display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={16} color="#818CF8" />
                Security Tips
              </h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#6B7280", lineHeight: 2, fontSize: 14 }}>
                <li>Use a strong password</li>
                <li>Never share your admin credentials</li>
                <li>Change your password regularly</li>
                <li>Log out when done on shared devices</li>
              </ul>
            </div>
          </div>
        ) : null}

        {/* Change password */}
        <div className="theme-card">
          <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#1E1B4B", display: "flex", alignItems: "center", gap: 6 }}>
            <KeyRound size={18} color="#818CF8" />
            Change Password
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6B7280" }}>
            Enter your current password, then set a new one. Minimum 6 characters.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <PasswordField
              label="Current password *"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
            <PasswordField
              label="New password *"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm new password *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
            />

            <button
              className="theme-btn login-submit-btn"
              disabled={submitting}
              style={{ maxWidth: 240, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              type="submit"
            >
              <KeyRound size={15} />
              {submitting ? "Saving..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
