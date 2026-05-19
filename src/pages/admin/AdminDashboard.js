// admin/AdminDashboard.js — Admin overview dashboard
// Uses lucide-react icons

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  BookMarked,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import AppShell from "../../components/AppShell";
import { useAuth } from "../../context/AuthContext";
import { useContact } from "../../context/ContactContext";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

// Animated counter
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

// Stat card with icon
function StatCard({ label, value, sub, accent, Icon }) {
  return (
    <article className="stat-card" style={{ borderTop: `4px solid ${accent || "var(--color-primary)"}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="stat-card__label">{label}</span>
        {Icon && <Icon size={20} color={accent} style={{ opacity: 0.7 }} />}
      </div>
      <strong>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </strong>
      {sub ? <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 4, display: "block" }}>{sub}</span> : null}
    </article>
  );
}

function AdminDashboard() {
  const { user }        = useAuth();
  const { unreadCount } = useContact();
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

      {/* Welcome hero */}
      <section className="hero-card" style={{
        background: "linear-gradient(135deg, rgba(251,207,232,0.5) 0%, rgba(199,210,254,0.5) 50%, rgba(165,180,252,0.5) 100%)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
      }}>
        <div>
          <p className="eyebrow">{greeting}, Admin</p>
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={22} color="#818CF8" />
            {user?.name}
          </h2>
          <p>Platform has <strong>{events.length}</strong> event{events.length !== 1 ? "s" : ""} and <strong>{bookings.length}</strong> total booking{bookings.length !== 1 ? "s" : ""}.</p>
        </div>
        <TrendingUp size={48} color="#A5B4FC" style={{ opacity: 0.7 }} />
      </section>

      {/* Stats */}
      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <StatCard label="Total Events"   value={events.length}        sub={`${activeEvents.length} active`}  accent="#2563eb" Icon={CalendarDays} />
        <StatCard label="Active Events"  value={activeEvents.length}  sub="upcoming"                         accent="#0f766e" Icon={CheckCircle} />
        <StatCard label="Past Events"    value={pastEvents.length}    sub="completed"                        accent="#b45309" Icon={Clock} />
        <StatCard label="Total Bookings" value={bookings.length}      sub={`${uniqueUsers} unique users`}    accent="#7c3aed" Icon={BookMarked} />
        <StatCard label="Confirmed"      value={confirmed}            sub={`${pending} pending`}             accent="#027a48" Icon={CheckCircle} />
        <StatCard label="Total Revenue"  value={`Rs. ${totalRevenue.toLocaleString()}`} sub="from all bookings" accent="#be185d" Icon={DollarSign} />
        {/* Unread contact messages card */}
        <article
          className="stat-card"
          style={{ borderTop: "4px solid #9D174D", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
          onClick={() => window.location.href = "/admin/messages"}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(165,180,252,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = ""; }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span className="stat-card__label">Unread Messages</span>
            <span style={{ background: "#FDF2F8", borderRadius: 8, padding: "4px 6px", display: "flex" }}>
              <MessageSquare size={16} color="#9D174D" />
            </span>
          </div>
          <strong style={{ color: "#9D174D" }}>{unreadCount}</strong>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 4, display: "block" }}>
            {unreadCount > 0 ? "needs attention" : "all caught up"}
          </span>
        </article>
      </section>

      {/* Quick links */}
      <section className="card-grid">
        {[
          { eyebrow: "Catalog",    title: "Manage Events",    desc: "Add, edit, or remove event listings.",                    to: "/admin/events",    Icon: CalendarDays },
          { eyebrow: "Operations", title: "All Bookings",     desc: "Review every booking, confirm or remove entries.",        to: "/admin/bookings",  Icon: BookMarked },
          { eyebrow: "Users",      title: "Manage Users",     desc: "View all registered accounts and their roles.",           to: "/admin/users",     Icon: Users },
          { eyebrow: "Inbox",      title: "Contact Messages", desc: `${unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""} waiting.` : "All messages from the contact form."}`, to: "/admin/messages",  Icon: MessageSquare },
        ].map(({ eyebrow, title, desc, to, Icon }) => (
          <article className="panel" key={to}>
            <p className="eyebrow">{eyebrow}</p>
            <h3 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Icon size={18} color="#818CF8" />
              {title}
            </h3>
            <p>{desc}</p>
            <Link className="button-link" to={to} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              Open {title}
              <ArrowRight size={14} />
            </Link>
          </article>
        ))}
      </section>

      {/* Events overview table */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Venue status</p>
            <h2 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LayoutDashboard size={18} color="#818CF8" />
              Events Overview
            </h2>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="pill">{events.length} total</span>
            <Link className="button button-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }} to="/admin/events">
              Manage →
            </Link>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="empty-state"><p>No events yet. <Link to="/admin/events">Add one</Link>.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Event</th><th>Location</th><th>Date</th><th>Price</th><th>Status</th></tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td><strong>{ev.title}</strong></td>
                    <td>{ev.location}</td>
                    <td>{formatDate(ev.date)}</td>
                    <td>{formatPrice(ev.price)}</td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 12px", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700,
                        background: ev.date >= today ? "#dbeafe" : "#f3f4f6",
                        color: ev.date >= today ? "#1d4ed8" : "#6b7280",
                      }}>
                        {ev.date >= today
                          ? <><CheckCircle size={11} /> Active</>
                          : <><Clock size={11} /> Past</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent bookings table */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recent activity</p>
            <h2 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <BookMarked size={18} color="#818CF8" />
              Latest Bookings
            </h2>
          </div>
          <Link className="button button-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }} to="/admin/bookings">
            View all
          </Link>
        </div>
        {recentBk.length === 0 ? (
          <div className="empty-state"><p>No bookings yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Event</th><th>Location</th><th>Price</th><th>Status</th><th>Booked On</th></tr>
              </thead>
              <tbody>
                {recentBk.map((b) => {
                  const status = (b.status || "pending").toLowerCase();
                  const statusStyle = {
                    pending:   { background: "#fef3c7", color: "#92400e" },
                    confirmed: { background: "#d1fae5", color: "#065f46" },
                    cancelled: { background: "#fee2e2", color: "#b91c1c" },
                  }[status] || { background: "#f3f4f6", color: "#6b7280" };
                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.user?.name}</strong>
                        <br />
                        <small style={{ color: "var(--color-text-muted)" }}>{b.user?.email}</small>
                      </td>
                      <td>{b.event?.title}</td>
                      <td>{b.event?.location}</td>
                      <td>{formatPrice(b.total_price || b.event?.price)}</td>
                      <td>
                        <span style={{ ...statusStyle, padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700, display: "inline-block" }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
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
