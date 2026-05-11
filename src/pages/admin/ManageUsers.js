import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/formatters";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeAction, setActiveAction] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadUsers = async () => {
      try {
        const response = await API.get("/users");
        if (isActive) setUsers(response.data.users ?? []);
      } catch (requestError) {
        if (isActive) setError(getErrorMessage(requestError, "Could not load users."));
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadUsers();
    return () => { isActive = false; };
  }, []);

  const adminCount = users.filter((user) => user.role === "admin").length;
  const activeCount = users.filter((user) => user.account_status !== "deactivated").length;
  const deactivatedCount = users.filter((user) => user.account_status === "deactivated").length;

  const updateUserInState = (updatedUser) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const removeUserFromState = (deletedUserId) => {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== deletedUserId));
  };

  const handleStatusToggle = async (user) => {
    const nextStatus = user.account_status === "deactivated" ? "active" : "deactivated";

    setActiveUserId(user.id);
    setActiveAction("status");
    setError("");
    setSuccess("");

    try {
      const response = await API.put(`/users/${user.id}/status`, { status: nextStatus });
      updateUserInState(response.data.user);
      setSuccess(response.data.message || "User status updated successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not update account status."));
    } finally {
      setActiveUserId(null);
      setActiveAction("");
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name}'s account? This will also remove their bookings.`
    );

    if (!confirmed) {
      return;
    }

    setActiveUserId(user.id);
    setActiveAction("delete");
    setError("");
    setSuccess("");

    try {
      const response = await API.delete(`/users/${user.id}`);
      removeUserFromState(user.id);
      setSuccess(response.data.message || "User deleted successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not delete this user."));
    } finally {
      setActiveUserId(null);
      setActiveAction("");
    }
  };

  return (
    <AppShell
      subtitle="Review user accounts, deactivate access when needed, and remove regular users from one place."
      title="Manage Users"
    >
      {error ? <p className="message message-error">{error}</p> : null}
      {success ? <p className="message message-success">{success}</p> : null}

      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <article className="stat-card">
          <span className="stat-card__label">Total Users</span>
          <strong>{users.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Active Accounts</span>
          <strong>{activeCount}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Deactivated Accounts</span>
          <strong>{deactivatedCount}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Admins</span>
          <strong>{adminCount}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">Registered accounts</p><h2>All Users</h2></div>
          <span className="pill">{users.length} total</span>
        </div>

        {loading ? <p>Loading users...</p> : users.length === 0 ? (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>Registered accounts will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Password Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="table-cell-stack">
                        <strong>{user.name}</strong>
                        <span className="table-helper">User ID: {user.id}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-badge--${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="table-cell-stack">
                        <span className={`status-badge status-badge--${user.account_status || "active"}`}>
                          {user.account_status === "deactivated" ? "Deactivated" : "Active"}
                        </span>
                        {user.deactivated_at ? (
                          <span className="table-helper">
                            Since {formatDate(user.deactivated_at.slice(0, 10))}
                          </span>
                        ) : (
                          <span className="table-helper">Login allowed</span>
                        )}
                      </div>
                    </td>
                    <td>{user.must_change_password ? "Temporary password" : "Active"}</td>
                    <td>{formatDate(user.created_at?.slice(0, 10))}</td>
                    <td>
                      {user.role === "admin" ? (
                        <span className="table-helper">Admin account protected</span>
                      ) : (
                        <div className="table-action-buttons">
                          <button
                            className="button button-secondary button-small"
                            disabled={activeUserId !== null}
                            onClick={() => handleStatusToggle(user)}
                            type="button"
                          >
                            {activeUserId === user.id && activeAction === "status"
                              ? "Saving..."
                              : user.account_status === "deactivated"
                                ? "Reactivate"
                                : "Deactivate"}
                          </button>
                          <button
                            className="button button-danger button-small"
                            disabled={activeUserId !== null}
                            onClick={() => handleDelete(user)}
                            type="button"
                          >
                            {activeUserId === user.id && activeAction === "delete" ? "Working..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default ManageUsers;
