// Bookings.js — User's booking history with cancellation and status tracking
// Features:
//  - Color-coded status badges (Confirmed / Cancelled / Completed)
//  - Past events automatically shown as "Completed"
//  - Cancel button with confirmation modal
//  - Cancelled bookings remain visible in history
//  - Prevents cancellation of past/completed events

import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import ConfirmModal from "../../components/ConfirmModal";
import StatusBadge, { deriveStatus } from "../../components/StatusBadge";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";
import "../../styles/bookings.css";

function Bookings() {
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ID of the booking pending cancellation (drives the modal + loading state)
  const [pendingCancelId, setPendingCancelId] = useState(null);
  // ID currently being cancelled via API (disables the button)
  const [cancellingId, setCancellingId]   = useState(null);

  // Load bookings from backend
  const loadBookings = async () => {
    setLoading(true);
    setError("");
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

  // User clicks "Cancel Booking" → open confirmation modal
  const handleCancelClick = (bookingId) => {
    setPendingCancelId(bookingId);
  };

  // User confirms cancellation in the modal
  const handleConfirmCancel = async () => {
    const bookingId = pendingCancelId;
    setPendingCancelId(null);   // close modal
    setCancellingId(bookingId); // show loading on button
    setError("");
    setSuccessMessage("");

    try {
      await API.delete(`/bookings/${bookingId}`);
      setSuccessMessage("Booking cancelled successfully.");
      // Reload to get updated statuses from backend
      await loadBookings();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not cancel your booking."));
    } finally {
      setCancellingId(null);
    }
  };

  // User dismisses the modal
  const handleCancelModal = () => {
    setPendingCancelId(null);
  };

  // Auto-dismiss success message after 4 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  return (
    <AppShell
      title="My Bookings"
      subtitle="Review every event you have reserved. Past events are marked as Completed."
    >
      {/* Confirmation modal */}
      <ConfirmModal
        isOpen={pendingCancelId !== null}
        title="Cancel Booking?"
        message="This will cancel your booking. The slot will be released and this action cannot be undone."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelModal}
        danger
      />

      {/* Feedback messages */}
      {error && <p className="message message-error">{error}</p>}
      {successMessage && <p className="message message-success">{successMessage}</p>}

      {loading ? (
        <section className="panel"><p>Loading bookings...</p></section>
      ) : bookings.length === 0 ? (
        <section className="empty-state">
          <h3>No bookings yet</h3>
          <p>Head to the Events page and book your first event.</p>
        </section>
      ) : (
        <section className="bookings-grid">
          {bookings.map((booking) => {
            const status = deriveStatus(booking);
            const isPast = status === "completed" || status === "cancelled";
            const isCancelling = cancellingId === booking.id;

            return (
              <article className="booking-card-enhanced" key={booking.id}>
                {/* Card header with status badge */}
                <div className="booking-card-enhanced__header">
                  <p className="booking-card-enhanced__eyebrow">
                    Booked on {formatDate(booking.created_at?.slice(0, 10))}
                  </p>
                  <StatusBadge status={status} />
                </div>

                {/* Event image if available */}
                {booking.event?.image && (
                  <img
                    alt={booking.event.title}
                    className="booking-card-enhanced__image"
                    src={booking.event.image}
                  />
                )}

                {/* Event details */}
                <div className="booking-card-enhanced__body">
                  <h3 className="booking-card-enhanced__title">
                    {booking.event?.title}
                  </h3>
                  {booking.event?.description && (
                    <p className="booking-card-enhanced__desc">
                      {booking.event.description}
                    </p>
                  )}

                  {/* Meta rows */}
                  <div className="booking-card-enhanced__meta">
                    <div className="booking-card-enhanced__meta-row">
                      <span className="booking-card-enhanced__meta-label">📅 Event Date</span>
                      <span>{formatDate(booking.event_date || booking.event?.date)}</span>
                    </div>
                    <div className="booking-card-enhanced__meta-row">
                      <span className="booking-card-enhanced__meta-label">📍 Location</span>
                      <span>{booking.event?.location || "—"}</span>
                    </div>
                    <div className="booking-card-enhanced__meta-row">
                      <span className="booking-card-enhanced__meta-label">👥 Guests</span>
                      <span>{booking.guest_count ?? "—"}</span>
                    </div>
                    {booking.package_name && (
                      <div className="booking-card-enhanced__meta-row">
                        <span className="booking-card-enhanced__meta-label">📦 Package</span>
                        <span>{booking.package_name}</span>
                      </div>
                    )}
                    <div className="booking-card-enhanced__meta-row booking-card-enhanced__meta-row--total">
                      <span className="booking-card-enhanced__meta-label">💰 Total</span>
                      <span className="booking-card-enhanced__price">
                        {formatPrice(booking.total_price || booking.event?.price)}
                      </span>
                    </div>
                  </div>

                  {/* Admin note if present */}
                  {booking.admin_note && (
                    <p className="booking-card-enhanced__note">
                      📝 {booking.admin_note}
                    </p>
                  )}
                </div>

                {/* Cancel button — hidden for past/cancelled events */}
                {!isPast && (
                  <div className="booking-card-enhanced__footer">
                    <button
                      className="button button-danger booking-card-enhanced__cancel-btn"
                      disabled={isCancelling}
                      onClick={() => handleCancelClick(booking.id)}
                      type="button"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  </div>
                )}

                {/* Cancelled overlay label */}
                {status === "cancelled" && (
                  <div className="booking-card-enhanced__cancelled-overlay">
                    Cancelled
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </AppShell>
  );
}

export default Bookings;
