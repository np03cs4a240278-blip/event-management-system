import { useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";

function Profile() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

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
      setFeedback({
        type: "success",
        text: response.message || "Password changed successfully.",
      });
    } catch (requestError) {
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Could not change password."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      subtitle="View your account details and update your password whenever needed."
      title="Profile"
    >
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

      <section className="card-grid">
        <article className="panel">
          <p className="eyebrow">Account details</p>
          <h3>{user?.name}</h3>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
          <p>Status: {user?.must_change_password ? "Temporary password active" : "Password updated"}</p>
        </article>

        <article className="panel">
          <p className="eyebrow">Security</p>
          <h3>Change password</h3>
          <p>
            Enter your current password and then set a new password. If you used forgot password,
            enter the temporary password as your current password.
          </p>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Account security</p>
            <h2>Update your password</h2>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Current password</span>
            <input
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>

          <label className="field">
            <span>New password</span>
            <input
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>

          <label className="field field-span-2">
            <span>Confirm new password</span>
            <input
              onChange={(event) => setConfirmPassword(event.target.value)}
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
    </AppShell>
  );
}

export default Profile;
