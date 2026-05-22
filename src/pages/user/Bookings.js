// user/Bookings.js — User's booking list with cancel functionality
// Uses lucide-react icons

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock,
  BookMarked,
  Ticket,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Tag,
} from "lucide-react";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";
import Navbar from "../Navbar";
import "../theme.css";
import "../DashboardShared.css";

// Status pill with icon
function StatusPill({ status }) {
  const s = (status || "pending").toLowerCase();
  const config = {
    pending:   { bg: "#FEF3C7", color: "#92400E", label: "Pending",   Icon: Clock },
    confirmed: { bg: "#D1FAE5", color: "#065F46", label: "Confirmed", Icon: CheckCircle },
    cancelled: { bg: "#FEE2E2", color: "#B91C1C", label: "Cancelled", Icon: XCircle },
  };
  const c = config[s] || config.pending;
  const { Icon } = c;
  return (
    <span style={{ background: c.bg, color: c.color, display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
      <Icon size={11} />
      {c.label}
    </span>
  );
}

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");
  const [successMessage, setSuccessMessage]   = useState("");
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
    setError("");
    setSuccessMessage("");
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

      {/* Hero */}
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">
          <BookMarked size={22} />
          My Bookings
        </h1>
        <p className="dash-hero-sub">Review every event you have reserved so far.</p>
      </div>

      <div className="dash-content">
        {error && (
          <div className="message message-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={15} />
            {error}
          </div>
        )}
        {successMessage && (
          <div className="message message-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={15} />
            {successMessage}
          </div>
        )}

        {/* Stats */}
        {!loading && bookings.length > 0 && (
          <div className="dash-stats-row" style={{ marginBottom: 24 }}>
            {[
              { label: "Total Bookings", value: bookings.length, Icon: Ticket,       color: "#818CF8" },
              { label: "Confirmed",      value: confirmed,       Icon: CheckCircle,  color: "#065F46" },
              { label: "Pending",        value: pending,         Icon: Clock,        color: "#92400E" },
            ].map(({ label, value, Icon, color }) => (
              <div className="theme-stat-card" key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div className="stat-label">{label}</div>
                  <Icon size={18} color={color} />
                </div>
                <div className="stat-number" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Booking cards */}
        {loading ? (
          <div className="theme-card dash-empty"><p>Loading your bookings...</p></div>
        ) : bookings.length === 0 ? (
          <div className="theme-card dash-empty">
            <div className="dash-empty-icon"><Ticket size={48} /></div>
            <p>You have no bookings yet.</p>
            <button className="theme-btn" onClick={() => navigate("/events")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Search size={15} />
              Browse Events
            </button>
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

                <div className="dash-booking-row">
                  <span className="dash-booking-label"><CalendarDays size={12} /> Event Date</span>
                  <span>{formatDate(booking.event?.date)}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><MapPin size={12} /> Location</span>
                  <span>{booking.event?.location}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><Users size={12} /> Guests</span>
                  <span>{booking.guest_count || 1}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><Tag size={12} /> Status</span>
                  <StatusPill status={booking.status} />
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><Clock size={12} /> Booked On</span>
                  <span>{formatDate(booking.created_at?.slice(0, 10))}</span>
                </div>

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
                    style={{ background: "linear-gradient(135deg, #FCA5A5, #F87171)", color: "#7F1D1D", marginTop: 8, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                    disabled={cancelBookingId === booking.id}
                    onClick={() => handleCancelBooking(booking.id)}
                    type="button"
                  >
                    <XCircle size={14} />
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
