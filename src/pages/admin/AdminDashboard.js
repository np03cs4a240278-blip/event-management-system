// admin/AdminDashboard.js — Admin overview dashboard
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/AppShell";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value || value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.ceil(value / 24);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <article className="stat-card" style={{ borderTop: `4px solid ${accent || "var(--accent)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="stat-card__label">{label}</span>
        {icon && <span style={{ fontSize: "1.4rem", opacity: 0.7 }}>{icon}</span>}
      </div>
      <strong>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </strong>
      {sub ? <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4, display: "block" }}>{sub}</span> : null}
    </article>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
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
  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_price) || Number(b.event?.price) || 0), 0);
  const uniqueUsers  = new Set(bookings.map((b) => b.user?.email)).size;
  const confirmed    = bookings.filter((b) => b.status === "confirmed").length;
  const pending      = bookings.filter((b) => !b.status || b.status === "pending").length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <AppShell subtitle="Full overview of your platform — events, bookings, revenue and activity." title="Admin Dashboard">
      {error   ? <p className="message message-error">{error}</p>   : null}
      {loading ? <p className="message">Loading dashboard data...</p> : null}

      <section className="hero-card" style={{
        background: "linear-gradient(135deg, rgba(251,207,232,0.5) 0%, rgba(199,210,254,0.5) 50%, rgba(165,180,252,0.5) 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <p className="eyebrow">{greeting}, Admin</p>
          <h2>{user?.name} 🛡️</h2>
          <p>Platform has <strong>{events.length}</strong> event{events.length !== 1 ? "s" : ""} and <strong>{bookings.length}</strong> total booking{bookings.length !== 1 ? "s" : ""}.</p>
        </div>
        <span style={{ fontSize: "3rem", lineHeight: 1 }}>📊</span>
      </section>

      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <StatCard label="Total Events"   value={events.length}        sub={`${activeEvents.length} active`}  accent="#2563eb" icon="🎪" />
        <StatCard label="Active Events"  value={activeEvents.length}  sub="upcoming"                         accent="#0f766e" icon="✅" />
        <StatCard label="Past Events"    value={pastEvents.length}    sub="completed"                        accent="#b45309" icon="📅" />
        <StatCard label="Total Bookings" value={bookings.length}      sub={`${uniqueUsers} unique users`}    accent="#7c3aed" icon="🎫" />
        <StatCard label="Confirmed"      value={confirmed}            sub={`${pending} pending`}             accent="#027a48" icon="✔️" />
        <StatCard label="Total Revenue"  value={`Rs. ${totalRevenue.toLocaleString()}`} sub="from all bookings" accent="#be185d" icon="💰" />
      </section>

      <section className="card-grid">
        <article className="panel">
          <p className="eyebrow">Catalog</p>
          <h3>Manage Events</h3>
          <p>Add, edit, or remove event listings.</p>
          <Link className="button-link" to="/admin/events">Open Event Manager →</Link>
        </article>
        <article className="panel">
          <p className="eyebrow">Operations</p>
          <h3>All Bookings</h3>
          <p>Review every booking, confirm or remove entries.</p>
          <Link className="button-link" to="/admin/bookings">View Bookings →</Link>
        </article>
        <article className="panel">
          <p className="eyebrow">Users</p>
          <h3>Manage Users</h3>
          <p>View all registered accounts and their roles.</p>
          <Link className="button-link" to="/admin/users">View Users →</Link>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">Venue status</p><h2>Events Overview</h2></div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="pill">{events.length} total</span>
            <Link className="button button-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }} to="/admin/events">Manage →</Link>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="empty-state"><p>No events yet. <Link to="/admin/events">Add one</Link>.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Event</th><th>Location</th><th>Date</th><th>Price</th><th>Status</th></tr></thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td><strong>{ev.title}</strong></td>
                    <td>{ev.location}</td>
                    <td>{formatDate(ev.date)}</td>
                    <td>{formatPrice(ev.price)}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700, background: ev.date >= today ? "#dbeafe" : "#f3f4f6", color: ev.date >= today ? "#1d4ed8" : "#6b7280" }}>
                        {ev.date >= today ? "🟢 Active" : "⚫ Past"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
              <thead><tr><th>User</th><th>Event</th><th>Location</th><th>Price</th><th>Status</th><th>Booked On</th></tr></thead>
              <tbody>
                {recentBk.map((b) => {
                  const status = (b.status || "pending").toLowerCase();
                  const statusStyle = { pending: { background: "#fef3c7", color: "#92400e" }, confirmed: { background: "#d1fae5", color: "#065f46" }, cancelled: { background: "#fee2e2", color: "#b91c1c" } }[status] || { background: "#f3f4f6", color: "#6b7280" };
                  return (
                    <tr key={b.id}>
                      <td><strong>{b.user?.name}</strong><br /><small style={{ color: "var(--muted)" }}>{b.user?.email}</small></td>
                      <td>{b.event?.title}</td>
                      <td>{b.event?.location}</td>
                      <td>{formatPrice(b.total_price || b.event?.price)}</td>
                      <td><span style={{ ...statusStyle, padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700, display: "inline-block" }}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                      <td>{formatDate(b.created_at?.slice(0, 10))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default AdminDashboard;
