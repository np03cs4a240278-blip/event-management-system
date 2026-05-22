// admin/ManageUsers.js — Manage user accounts
// Uses lucide-react icons

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/formatters";

function ManageUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
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

  const adminCount       = users.filter((u) => u.role === "admin").length;
  const activeCount      = users.filter((u) => u.account_status !== "deactivated").length;
  const deactivatedCount = users.filter((u) => u.account_status === "deactivated").length;

  const updateUserInState = (updatedUser) => {
    setUsers((current) => current.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };
  const removeUserFromState = (deletedUserId) => {
    setUsers((current) => current.filter((u) => u.id !== deletedUserId));
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
    const confirmed = window.confirm(`Delete ${user.name}'s account? This will also remove their bookings.`);
    if (!confirmed) return;
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
      {error   ? (
        <p className="message message-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={15} />{error}
        </p>
      ) : null}
      {success ? (
        <p className="message message-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle size={15} />{success}
        </p>
      ) : null}

      {/* Stats */}
      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {[
          { label: "Total Users",          value: users.length,      Icon: Users,      color: "#7c3aed" },
          { label: "Active Accounts",      value: activeCount,       Icon: UserCheck,  color: "#027a48" },
          { label: "Deactivated Accounts", value: deactivatedCount,  Icon: UserX,      color: "#b91c1c" },
          { label: "Admins",               value: adminCount,        Icon: ShieldCheck, color: "#be185d" },
        ].map(({ label, value, Icon, color }) => (
          <article className="stat-card" key={label} style={{ borderTop: `4px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="stat-card__label">{label}</span>
              <Icon size={18} color={color} style={{ opacity: 0.7 }} />
            </div>
            <strong style={{ color }}>{value}</strong>
          </article>
        ))}
      </section>

      {/* Users table */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Registered accounts</p>
            <h2 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={18} color="#818CF8" />
              All Users
            </h2>
          </div>
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
                      <span className={`role-badge role-badge--${user.role}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {user.role === "admin" ? <ShieldCheck size={11} /> : <Users size={11} />}
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="table-cell-stack">
                        <span className={`status-badge status-badge--${user.account_status || "active"}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {user.account_status === "deactivated"
                            ? <><UserX size={11} /> Deactivated</>
                            : <><UserCheck size={11} /> Active</>}
                        </span>
                        {user.deactivated_at ? (
                          <span className="table-helper">Since {formatDate(user.deactivated_at.slice(0, 10))}</span>
                        ) : (
                          <span className="table-helper">Login allowed</span>
                        )}
                      </div>
                    </td>
                    <td>Current password</td>
                    <td>{formatDate(user.created_at?.slice(0, 10))}</td>
                    <td>
                      {user.role === "admin" ? (
                        <span className="table-helper" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <ShieldCheck size={12} />
                          Admin protected
                        </span>
                      ) : (
                        <div className="table-action-buttons">
                          <button
                            className="button button-secondary button-small"
                            disabled={activeUserId !== null}
                            onClick={() => handleStatusToggle(user)}
                            type="button"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            {activeUserId === user.id && activeAction === "status"
                              ? "Saving..."
                              : user.account_status === "deactivated"
                                ? <><ToggleRight size={13} /> Reactivate</>
                                : <><ToggleLeft size={13} /> Deactivate</>}
                          </button>
                          <button
                            className="button button-danger button-small"
                            disabled={activeUserId !== null}
                            onClick={() => handleDelete(user)}
                            type="button"
                            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            {activeUserId === user.id && activeAction === "delete"
                              ? "Working..."
                              : <><Trash2 size={13} /> Delete</>}
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
