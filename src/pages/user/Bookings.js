// user/Bookings.js — User's booking list with cancel functionality
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";
import Navbar from "../Navbar";
import "../theme.css";
import "../DashboardShared.css";

function StatusPill({ status }) {
  const s = (status || "pending").toLowerCase();
  const styles = { pending: { background: "#FEF3C7", color: "#92400E" }, confirmed: { background: "#D1FAE5", color: "#065F46" }, cancelled: { background: "#FEE2E2", color: "#B91C1C" } };
  const icons  = { pending: "⏳", confirmed: "✅", cancelled: "❌" };
  return (
    <span style={{ ...(styles[s] || styles.pending), display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
      {icons[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cancelBookingId, setCancelBookingId] = useState(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await API.get("/my-bookings");
      setBookings(response.data.bookings ?? []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not load your bookings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelBookingId(bookingId);
    setError(""); setSuccessMessage("");
    try {
      await API.delete(`/bookings/${bookingId}`);
      setSuccessMessage("Booking cancelled successfully.");
      await loadBookings();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not cancel your booking."));
    } finally {
      setCancelBookingId(null);
    }
  };

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending   = bookings.filter((b) => !b.status || b.status === "pending").length;

  return (
    <div className="dash-page">
      <Navbar />
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">My Bookings</h1>
        <p className="dash-hero-sub">Review every event you have reserved so far.</p>
      </div>
      <div className="dash-content">
        {error          && <div className="message message-error">⚠️ {error}</div>}
        {successMessage && <div className="message message-success">✅ {successMessage}</div>}

        {!loading && bookings.length > 0 && (
          <div className="dash-stats-row" style={{ marginBottom: 24 }}>
            <div className="theme-stat-card"><div className="stat-label">Total Bookings</div><div className="stat-number">{bookings.length}</div></div>
            <div className="theme-stat-card"><div className="stat-label">Confirmed</div><div className="stat-number" style={{ color: "#065F46" }}>{confirmed}</div></div>
            <div className="theme-stat-card"><div className="stat-label">Pending</div><div className="stat-number" style={{ color: "#92400E" }}>{pending}</div></div>
          </div>
        )}

        {loading ? (
          <div className="theme-card dash-empty"><p>Loading your bookings...</p></div>
        ) : bookings.length === 0 ? (
          <div className="theme-card dash-empty">
            <span className="dash-empty-icon">🎟️</span>
            <p>You have no bookings yet.</p>
            <button className="theme-btn" onClick={() => navigate("/events")}>Browse Events</button>
          </div>
        ) : (
          <div className="dash-bookings-grid">
            {bookings.map((booking) => (
              <div className="dash-booking-card theme-card" key={booking.id}>
                {booking.event?.image && (
                  <img src={booking.event.image} alt={booking.event.title}
                    style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 10, marginBottom: 8 }}
                    onError={(e) => { e.target.style.display = "none"; }} />
                )}
                <div className="dash-booking-venue">{booking.event?.title}</div>
                <div className="dash-booking-row"><span className="dash-booking-label">📅 Event Date</span><span>{formatDate(booking.event?.date)}</span></div>
                <div className="dash-booking-row"><span className="dash-booking-label">📍 Location</span><span>{booking.event?.location}</span></div>
                <div className="dash-booking-row"><span className="dash-booking-label">👥 Guests</span><span>{booking.guest_count || 1}</span></div>
                <div className="dash-booking-row"><span className="dash-booking-label">📋 Status</span><StatusPill status={booking.status} /></div>
                <div className="dash-booking-row"><span className="dash-booking-label">🗓 Booked On</span><span>{formatDate(booking.created_at?.slice(0, 10))}</span></div>
                {booking.admin_note && (
                  <div style={{ background: "#EEF2FF", borderLeft: "3px solid #818CF8", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#4B5563", marginTop: 4 }}>
                    <strong style={{ color: "#6D28D9", display: "block", marginBottom: 2 }}>Admin Note</strong>
                    {booking.admin_note}
                  </div>
                )}
                <div className="dash-booking-total">{formatPrice(booking.total_price || booking.event?.price)}</div>
                {booking.status !== "cancelled" && (
                  <button
                    className="theme-btn"
                    style={{ background: "linear-gradient(135deg, #FCA5A5, #F87171)", color: "#7F1D1D", marginTop: 8, width: "100%" }}
                    disabled={cancelBookingId === booking.id}
                    onClick={() => handleCancelBooking(booking.id)}
                    type="button"
                  >
                    {cancelBookingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookings;
