// Profile.js — User/Admin profile page with password change
// Enhanced: better layout, avatar, status indicators

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import Navbar from "./Navbar";
import "./theme.css";
import "./DashboardShared.css";

function Profile() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting]           = useState(false);
  const [feedback, setFeedback]               = useState({ type: "", text: "" });

  const isAdmin = user?.role === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!user?.must_change_password && !currentPassword) || !newPassword || !confirmPassword) {
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
      const res = await changePassword({
        current_password: currentPassword,
        new_password:     newPassword,
        confirm_password: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback({ type: "success", text: res.message || "Password changed successfully." });
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Could not change password.") });
    } finally {
      setSubmitting(false);
    }
  };

  // Avatar initials (up to 2 letters)
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="dash-page">
      <Navbar />

      {/* Hero banner */}
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">My Profile</h1>
        <p className="dash-hero-sub">
          {isAdmin
            ? "Manage your admin account and credentials."
            : "View your account details and update your password."}
        </p>
      </div>

      <div className="dash-content">

        {/* Temporary password warning */}
        {user?.must_change_password && (
          <div className="message message-error">
            ⚠️ You are using a temporary password. Please change it now before using other pages.
          </div>
        )}

        {/* Feedback message */}
        {feedback.text && (
          <div className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>
            {feedback.type === "error" ? "⚠️" : "✅"} {feedback.text}
          </div>
        )}

        {/* ── Profile card ── */}
        <div className="theme-card" style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
          {/* Avatar circle */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            flexShrink: 0,
            background: isAdmin
              ? "linear-gradient(135deg, #f97316, #ef4444)"
              : "linear-gradient(135deg, #A5B4FC, #818CF8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            fontWeight: 800,
            color: "#fff",
            boxShadow: "0 4px 16px rgba(165,180,252,0.3)",
          }}>
            {initials}
          </div>

          {/* Info grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1E1B4B" }}>{user?.name}</h2>
              <span className={`theme-badge ${user?.role}`}>
                {user?.role === "admin" ? "🛡️ Admin" : "👤 User"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</p>
                <p style={{ margin: 0, fontSize: 14, color: "#1E1B4B" }}>📧 {user?.email}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Account Type</p>
                <p style={{ margin: 0, fontSize: 14, color: "#1E1B4B", textTransform: "capitalize" }}>{user?.role}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password Status</p>
                <p style={{ margin: 0, fontSize: 14 }}>
                  {user?.must_change_password
                    ? <span style={{ color: "#B91C1C", fontWeight: 700 }}>⚠️ Temporary — change required</span>
                    : <span style={{ color: "#065F46", fontWeight: 700 }}>✅ Up to date</span>}
                </p>
              </div>
              {isAdmin && (
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Access Level</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E1B4B" }}>🔑 Full admin access</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Admin permissions cards ── */}
        {isAdmin && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="theme-card">
              <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#1E1B4B" }}>🛡️ Admin Capabilities</h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#6B7280", lineHeight: 2, fontSize: 14 }}>
                <li>Create, edit and delete events</li>
                <li>View all user bookings</li>
                <li>Confirm or remove bookings</li>
                <li>Write admin notes on bookings</li>
                <li>Access full platform dashboard</li>
              </ul>
            </div>
            <div className="theme-card">
              <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#1E1B4B" }}>🔒 Security Tips</h3>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "#6B7280", lineHeight: 2, fontSize: 14 }}>
                <li>Use a strong password (8+ characters)</li>
                <li>Never share your admin credentials</li>
                <li>Change your password regularly</li>
                <li>Log out when done on shared devices</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── Change password form ── */}
        <div className="theme-card">
          <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#1E1B4B" }}>
            🔑 Change Password
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6B7280" }}>
            {user?.must_change_password
              ? "Set a new password now to replace your temporary password. Minimum 6 characters."
              : "Enter your current password then set a new one. Minimum 6 characters."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            {/* Current password */}
            <div className="form-group">
              <label className="form-label">
                {user?.must_change_password ? "Temporary password (optional)" : "Current password *"}
              </label>
              <input
                autoComplete="current-password"
                className="theme-input"
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={user?.must_change_password ? "Already signed in with a temporary password" : "Enter current password"}
                required={!user?.must_change_password}
                type="password"
                value={currentPassword}
              />
            </div>

            {/* New password */}
            <div className="form-group">
              <label className="form-label">New password *</label>
              <input
                autoComplete="new-password"
                className="theme-input"
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                type="password"
                value={newPassword}
              />
            </div>

            {/* Confirm password */}
            <div className="form-group">
              <label className="form-label">Confirm new password *</label>
              <input
                autoComplete="new-password"
                className="theme-input"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                type="password"
                value={confirmPassword}
              />
            </div>

            <button
              className="theme-btn login-submit-btn"
              disabled={submitting}
              type="submit"
              style={{ maxWidth: 240 }}
            >
              {submitting ? "Saving..." : "Change Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Profile;
