// UserDashboard.js — Dashboard for logged-in regular users
// Fetches real events and bookings from the PHP backend

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { getErrorMessage } from "../utils/apiError";
import "./theme.css";
import "./DashboardShared.css";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents]     = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError]       = useState("");

  // Load events and bookings from the backend when page opens
  useEffect(() => {
    const loadData = async () => {
      try {
        // GET /api/events — all available events
        // GET /api/my-bookings — this user's bookings
        const [eventsRes, bookingsRes] = await Promise.all([
          API.get("/events"),
          API.get("/my-bookings"),
        ]);
        setEvents(eventsRes.data.events ?? []);
        setBookings(bookingsRes.data.bookings ?? []);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load dashboard data."));
      }
    };
    loadData();
  }, []);

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="dash-page">
      <Navbar />

      {/* Hero banner */}
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">Welcome back, {user?.name}!</h1>
        <p className="dash-hero-sub">Manage your bookings and explore available events.</p>
      </div>

      <div className="dash-content">

        {error && <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "10px 14px", borderRadius: 8, marginBottom: 20 }}>{error}</div>}

        {/* Stats */}
        <div className="dash-stats-row">
          <div className="theme-stat-card">
            <div className="stat-label">My Bookings</div>
            <div className="stat-number">{bookings.length}</div>
          </div>
          <div className="theme-stat-card">
            <div className="stat-label">Available Events</div>
            <div className="stat-number">{events.length}</div>
          </div>
        </div>

        {/* Profile */}
        <h2 className="theme-section-title">My Profile</h2>
        <div className="dash-profile-card theme-card">
          <div className="dash-avatar">{avatarLetter}</div>
          <div className="dash-profile-info">
            <h3 className="dash-profile-name">{user?.name}</h3>
            <p className="dash-profile-detail">{user?.email}</p>
            <span className="theme-badge user">User</span>
          </div>
        </div>

        {/* Available Events */}
        <h2 className="theme-section-title">Available Events</h2>
        {events.length === 0 ? (
          <div className="theme-card dash-empty"><p>No events available right now.</p></div>
        ) : (
          <div className="dash-venues-grid">
            {events.map((event) => (
              <div className="dash-venue-card theme-card" key={event.id}>
                {event.image && (
                  <img src={event.image} alt={event.title}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                )}
                <div className="dash-venue-name">{event.title}</div>
                <div className="dash-venue-location">{event.location} — {event.date}</div>
                <div className="dash-venue-price">Rs. {Number(event.price).toLocaleString()}</div>
                <button
                  className="theme-btn dash-book-btn"
                  onClick={() => navigate("/book-venue", { state: { eventId: event.id } })}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My Bookings */}
        <h2 className="theme-section-title" style={{ marginTop: 32 }}>My Bookings</h2>
        {bookings.length === 0 ? (
          <div className="theme-card dash-empty">
            <p>You have no bookings yet.</p>
            <button className="theme-btn" onClick={() => navigate("/book-venue")}>Book an Event</button>
          </div>
        ) : (
          <div className="dash-bookings-grid">
            {bookings.map((b) => (
              <div className="dash-booking-card theme-card" key={b.id}>
                <div className="dash-booking-venue">{b.event?.title}</div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label">Date</span>
                  <span>{b.event?.date}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label">Location</span>
                  <span>{b.event?.location}</span>
                </div>
                <div className="dash-booking-total">
                  Rs. {Number(b.event?.price || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
