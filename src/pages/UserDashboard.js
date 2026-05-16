// UserDashboard.js — Dashboard for logged-in regular users
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { getErrorMessage } from "../utils/apiError";
import "./theme.css";
import "./DashboardShared.css";

function StatusPill({ status }) {
  const s = (status || "pending").toLowerCase();
  const styles = { pending: { background: "#FEF3C7", color: "#92400E" }, confirmed: { background: "#D1FAE5", color: "#065F46" }, cancelled: { background: "#FEE2E2", color: "#B91C1C" } };
  const icons  = { pending: "⏳", confirmed: "✅", cancelled: "❌" };
  const style  = styles[s] || styles.pending;
  return (
    <span style={{ ...style, display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
      {icons[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsRes, bookingsRes] = await Promise.all([
          API.get("/events"),
          API.get("/my-bookings"),
        ]);
        setEvents(eventsRes.data.events ?? []);
        setBookings(bookingsRes.data.bookings ?? []);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load dashboard data."));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="dash-page">
      <Navbar />
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">{greeting}, {user?.name}! 👋</h1>
        <p className="dash-hero-sub">Manage your bookings and explore available events.</p>
      </div>
      <div className="dash-content">
        {error && <div className="message message-error">⚠️ {error}</div>}

        <div className="dash-welcome-card">
          <div className="dash-welcome-text">
            <h2>Welcome back, {user?.name}!</h2>
            <p>You have <strong>{bookings.length}</strong> booking{bookings.length !== 1 ? "s" : ""} and <strong>{events.length}</strong> event{events.length !== 1 ? "s" : ""} available.</p>
          </div>
          <div className="dash-welcome-emoji">🎉</div>
        </div>

        <div className="dash-stats-row">
          <div className="theme-stat-card">
            <div className="stat-label">My Bookings</div>
            <div className="stat-number">{loading ? "—" : <AnimatedNumber value={bookings.length} />}</div>
          </div>
          <div className="theme-stat-card">
            <div className="stat-label">Available Events</div>
            <div className="stat-number">{loading ? "—" : <AnimatedNumber value={events.length} />}</div>
          </div>
          <div className="theme-stat-card">
            <div className="stat-label">Confirmed</div>
            <div className="stat-number">{loading ? "—" : <AnimatedNumber value={bookings.filter((b) => b.status === "confirmed").length} />}</div>
          </div>
        </div>

        <div className="dash-quick-actions">
          <button className="dash-quick-btn" onClick={() => navigate("/events")}><span className="dash-quick-btn__icon">🎫</span>Browse Events</button>
          <button className="dash-quick-btn" onClick={() => navigate("/book-venue")}><span className="dash-quick-btn__icon">📅</span>Book a Venue</button>
          <button className="dash-quick-btn" onClick={() => navigate("/bookings")}><span className="dash-quick-btn__icon">📋</span>My Bookings</button>
          <button className="dash-quick-btn" onClick={() => navigate("/profile")}><span className="dash-quick-btn__icon">👤</span>My Profile</button>
        </div>

        <h2 className="theme-section-title">My Profile</h2>
        <div className="dash-profile-card theme-card">
          <div className="dash-avatar">{avatarLetter}</div>
          <div>
            <h3 className="dash-profile-name">{user?.name}</h3>
            <p className="dash-profile-detail">📧 {user?.email}</p>
            <span className="theme-badge user">User</span>
          </div>
        </div>

        <h2 className="theme-section-title">Available Events</h2>
        {loading ? (
          <div className="theme-card dash-empty"><p>Loading events...</p></div>
        ) : events.length === 0 ? (
          <div className="theme-card dash-empty"><span className="dash-empty-icon">📭</span><p>No events available right now.</p></div>
        ) : (
          <div className="dash-venues-grid">
            {events.map((event) => (
              <div className="dash-venue-card theme-card" key={event.id}>
                {event.image && <img src={event.image} alt={event.title} className="dash-venue-img" onError={(e) => { e.target.style.display = "none"; }} />}
                <div className="dash-venue-name">{event.title}</div>
                <div className="dash-venue-location">📍 {event.location}</div>
                <div className="dash-venue-location">📅 {event.date}</div>
                <div className="dash-venue-price">Rs. {Number(event.price).toLocaleString()}</div>
                <button className="theme-btn dash-book-btn" onClick={() => navigate("/book-venue", { state: { eventId: event.id } })}>Book Now</button>
              </div>
            ))}
          </div>
        )}

        <h2 className="theme-section-title" style={{ marginTop: 32 }}>My Recent Bookings</h2>
        {loading ? (
          <div className="theme-card dash-empty"><p>Loading bookings...</p></div>
        ) : bookings.length === 0 ? (
          <div className="theme-card dash-empty">
            <span className="dash-empty-icon">🎟️</span>
            <p>You have no bookings yet.</p>
            <button className="theme-btn" onClick={() => navigate("/book-venue")}>Book an Event</button>
          </div>
        ) : (
          <div className="dash-bookings-grid">
            {bookings.map((b) => (
              <div className="dash-booking-card theme-card" key={b.id}>
                <div className="dash-booking-venue">{b.event?.title}</div>
                <div className="dash-booking-row"><span className="dash-booking-label">Date</span><span>{b.event?.date}</span></div>
                <div className="dash-booking-row"><span className="dash-booking-label">Location</span><span>{b.event?.location}</span></div>
                <div className="dash-booking-row"><span className="dash-booking-label">Guests</span><span>{b.guest_count || 1}</span></div>
                <div className="dash-booking-row"><span className="dash-booking-label">Status</span><StatusPill status={b.status} /></div>
                <div className="dash-booking-total">Rs. {Number(b.total_price || b.event?.price || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
