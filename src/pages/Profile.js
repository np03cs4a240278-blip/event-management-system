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
        new_password: newPassword,
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

  // Avatar initials
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">Profile</h1>
        <p className="dash-hero-sub">{isAdmin ? "Manage your admin account and credentials." : "View your account and update your password."}</p>
      </div>

      <div className="dash-content">
      {user?.must_change_password ? (
        <p className="message message-error">
          You are using a temporary password. Please change it now before using other pages.
        </p>
      ) : null}

      {feedback.text ? (
        <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>
          {feedback.text}
        </p>
      ) : null}

      {/* ── Profile card ── */}
      <section className="panel" style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%", flexShrink: 0,
          background: isAdmin
            ? "linear-gradient(135deg, #f97316, #ef4444)"
            : "linear-gradient(135deg, #2563eb, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.8rem", fontWeight: 800, color: "#fff",
        }}>
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>{user?.name}</h2>
            <span className={`role-badge role-badge--${user?.role}`}>{user?.role}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: 2 }}>Email</p>
              <p style={{ margin: 0 }}>{user?.email}</p>
            </div>
            <div>
              <p className="eyebrow" style={{ marginBottom: 2 }}>Account Type</p>
              <p style={{ margin: 0, textTransform: "capitalize" }}>{user?.role}</p>
            </div>
            <div>
              <p className="eyebrow" style={{ marginBottom: 2 }}>Password Status</p>
              <p style={{ margin: 0 }}>
                {user?.must_change_password
                  ? <span style={{ color: "var(--danger)", fontWeight: 600 }}>Temporary — change required</span>
                  : <span style={{ color: "var(--success)", fontWeight: 600 }}>Up to date</span>}
              </p>
            </div>
            {isAdmin ? (
              <div>
                <p className="eyebrow" style={{ marginBottom: 2 }}>Access Level</p>
                <p style={{ margin: 0, fontWeight: 600 }}>Full admin access</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── Admin permissions card (admin only) ── */}
      {isAdmin ? (
        <section className="card-grid">
          <article className="panel">
            <p className="eyebrow">Permissions</p>
            <h3>Admin Capabilities</h3>
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem", color: "var(--muted)", lineHeight: 2 }}>
              <li>Create, edit and delete events</li>
              <li>View all user bookings</li>
              <li>Confirm or remove bookings</li>
              <li>Write admin notes on bookings</li>
              <li>Access full platform dashboard</li>
            </ul>
          </article>
          <article className="panel">
            <p className="eyebrow">Security tips</p>
            <h3>Keep your account safe</h3>
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem", color: "var(--muted)", lineHeight: 2 }}>
              <li>Use a strong password (8+ characters)</li>
              <li>Never share your admin credentials</li>
              <li>Change your password regularly</li>
              <li>Log out when done on shared devices</li>
            </ul>
          </article>
        </section>
      ) : null}

      {/* ── Change password ── */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Account security</p>
            <h2>Change Password</h2>
          </div>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          {user?.must_change_password
            ? "Set a new password now to replace your temporary password. Minimum 6 characters."
            : "Enter your current password then set a new one. Minimum 6 characters."}
        </p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>{user?.must_change_password ? "Temporary password (optional)" : "Current password"}</span>
            <input
              autoComplete="current-password"
              onChange={(e) => setCurrentPassword(e.target.value)}
              required={!user?.must_change_password}
              placeholder={user?.must_change_password ? "Already signed in with a temporary password" : ""}
              type="password"
              value={currentPassword}
            />
          </label>

          <label className="field">
            <span>New password</span>
            <input
              autoComplete="new-password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>

          <label className="field field-span-2">
            <span>Confirm new password</span>
            <input
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <div className="form-actions field-span-2">
            <button className="button" disabled={submitting} type="submit">
              {submitting ? "Saving..." : "Change Password"}
            </button>
          </div>
        </form>
      </section>
      </div>
    </div>
  );
}

export default Profile;
