import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

function StatCard({ label, value, sub, accent }) {
  return (
    <article className="stat-card" style={{ borderTop: `4px solid ${accent || "var(--accent)"}` }}>
      <span className="stat-card__label">{label}</span>
      <strong>{value}</strong>
      {sub ? <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>{sub}</span> : null}
    </article>
  );
}

function AdminDashboard() {
  const [events, setEvents]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const [evRes, bkRes] = await Promise.all([
          API.get("/events"),
          API.get("/all-bookings"),
        ]);
        if (!isActive) return;
        setEvents(evRes.data.events ?? []);
        setBookings(bkRes.data.bookings ?? []);
      } catch (err) {
        if (isActive) setError(getErrorMessage(err, "Could not load dashboard data."));
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => { isActive = false; };
  }, []);

  const today        = new Date().toISOString().slice(0, 10);
  const activeEvents = events.filter((e) => e.date >= today);
  const pastEvents   = events.filter((e) => e.date < today);
  const recentBk     = [...bookings].slice(0, 5);

  // Revenue = sum of event prices across all bookings
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) || Number(b.event?.price) || 0), 0);

  // Unique users who booked
  const uniqueUsers = new Set(bookings.map((b) => b.user?.email)).size;

  return (
    <AppShell subtitle="Full overview of your platform — events, bookings, revenue and activity." title="Admin Dashboard">

      {error ? <p className="message message-error">{error}</p> : null}
      {loading ? <p className="message">Loading dashboard...</p> : null}

      {/* ── Stats ── */}
      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <StatCard label="Total Events"   value={events.length}   sub={`${activeEvents.length} active`}  accent="#2563eb" />
        <StatCard label="Active Events"  value={activeEvents.length} sub="upcoming"                     accent="#0f766e" />
        <StatCard label="Past Events"    value={pastEvents.length}   sub="completed"                    accent="#b45309" />
        <StatCard label="Total Bookings" value={bookings.length}  sub={`${uniqueUsers} unique users`}   accent="#7c3aed" />
        <StatCard label="Total Revenue"  value={`Rs. ${totalRevenue.toLocaleString()}`} sub="from bookings" accent="#be185d" />
      </section>

      {/* ── Quick links ── */}
      <section className="card-grid">
        <article className="panel">
          <p className="eyebrow">Catalog</p>
          <h3>Manage Events</h3>
          <p>Add, edit, or remove event listings. Control what users can book.</p>
          <Link className="button-link" to="/admin/events">Open Event Manager →</Link>
        </article>
        <article className="panel">
          <p className="eyebrow">Operations</p>
          <h3>All Bookings</h3>
          <p>Review every booking, confirm or remove entries, and write admin notes.</p>
          <Link className="button-link" to="/admin/bookings">View Bookings →</Link>
        </article>
        <article className="panel">
          <p className="eyebrow">Account</p>
          <h3>Admin Profile</h3>
          <p>Update your admin credentials and account information.</p>
          <Link className="button-link" to="/profile">Go to Profile →</Link>
        </article>
      </section>

      {/* ── Events status table ── */}
      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">Venue status</p><h2>Events Overview</h2></div>
          <span className="pill">{events.length} total</span>
        </div>
        {events.length === 0 ? (
          <div className="empty-state"><p>No events yet. <Link to="/admin/events">Add one</Link>.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td><strong>{ev.title}</strong></td>
                    <td>{ev.location}</td>
                    <td>{formatDate(ev.date)}</td>
                    <td>{formatPrice(ev.price)}</td>
                    <td>
                      <span className={`role-badge ${ev.date >= today ? "role-badge--user" : "role-badge--admin"}`}>
                        {ev.date >= today ? "Active" : "Past"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Recent bookings ── */}
      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">Recent activity</p><h2>Latest Bookings</h2></div>
          <Link className="button button-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }} to="/admin/bookings">View all</Link>
        </div>
        {recentBk.length === 0 ? (
          <div className="empty-state"><p>No bookings yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Event</th><th>Location</th><th>Price</th><th>Booked On</th></tr>
              </thead>
              <tbody>
                {recentBk.map((b) => (
                  <tr key={b.id}>
                    <td>{b.user?.name}<br /><small style={{ color: "var(--muted)" }}>{b.user?.email}</small></td>
                    <td>{b.event?.title}</td>
                    <td>{b.event?.location}</td>
                    <td>{formatPrice(b.total_price || b.event?.price)}</td>
                    <td>{formatDate(b.created_at?.slice(0, 10))}</td>
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

export default AdminDashboard;
