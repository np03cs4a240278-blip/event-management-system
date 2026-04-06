import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const shouldCancel = window.confirm("Do you want to cancel this booking?");

    if (!shouldCancel) {
      return;
    }

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

  return (
    <AppShell subtitle="Review every event you have reserved so far." title="My Bookings">
      {error ? <p className="message message-error">{error}</p> : null}
      {successMessage ? <p className="message message-success">{successMessage}</p> : null}

      {loading ? (
        <section className="panel">
          <p>Loading bookings...</p>
        </section>
      ) : bookings.length === 0 ? (
        <section className="empty-state">
          <h3>No bookings yet</h3>
          <p>Head to the Events page and book your first event.</p>
        </section>
      ) : (
        <section className="card-grid">
          {bookings.map((booking) => (
            <article className="panel booking-card" key={booking.id}>
              <p className="eyebrow">Booked on {formatDate(booking.created_at?.slice(0, 10))}</p>
              <h3>{booking.event.title}</h3>
              <p>{booking.event.description}</p>
              <div className="booking-card__meta">
                <span>{formatDate(booking.event.date)}</span>
                <span>{booking.event.location}</span>
                <span>{formatPrice(booking.event.price)}</span>
              </div>
              <div className="form-actions">
                <button
                  className="button button-danger"
                  disabled={cancelBookingId === booking.id}
                  onClick={() => handleCancelBooking(booking.id)}
                  type="button"
                >
                  {cancelBookingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}

export default Bookings;
