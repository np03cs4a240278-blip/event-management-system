import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate } from "../../utils/formatters";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  const memberCount = users.length - adminCount;

  return (
    <AppShell subtitle="View how many accounts have been created and review the registered users." title="Manage Users">
      {error ? <p className="message message-error">{error}</p> : null}

      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <article className="stat-card">
          <span className="stat-card__label">Total Users</span>
          <strong>{users.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Admins</span>
          <strong>{adminCount}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Regular Users</span>
          <strong>{memberCount}</strong>
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
                  <th>Password Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td style={{ textTransform: "capitalize" }}>{user.role}</td>
                    <td>{user.must_change_password ? "Temporary password" : "Active"}</td>
                    <td>{formatDate(user.created_at?.slice(0, 10))}</td>
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
