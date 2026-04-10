<<<<<<< HEAD
=======
<<<<<<< HEAD
function Bookings(){

return(

<div style={{padding:"30px"}}>

<h2>Your Bookings</h2>

<p>No bookings yet.</p>

</div>

)

}

export default Bookings
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
<<<<<<< HEAD
=======

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    try {
      const response = await API.get("/my-bookings");
      setBookings(response.data.bookings ?? []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not load your bookings."));
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  useEffect(() => { loadBookings(); }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Do you want to cancel this booking?")) return;
    setCancelBookingId(bookingId);
    setError("");
    setSuccessMessage("");
=======
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

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
<<<<<<< HEAD
      {loading ? (
        <section className="panel"><p>Loading bookings...</p></section>
      ) : bookings.length === 0 ? (
        <section className="empty-state"><h3>No bookings yet</h3><p>Head to the Events page and book your first event.</p></section>
=======

      {loading ? (
        <section className="panel">
          <p>Loading bookings...</p>
        </section>
      ) : bookings.length === 0 ? (
        <section className="empty-state">
          <h3>No bookings yet</h3>
          <p>Head to the Events page and book your first event.</p>
        </section>
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
<<<<<<< HEAD
                <button className="button button-danger" disabled={cancelBookingId === booking.id} onClick={() => handleCancelBooking(booking.id)} type="button">
=======
                <button
                  className="button button-danger"
                  disabled={cancelBookingId === booking.id}
                  onClick={() => handleCancelBooking(booking.id)}
                  type="button"
                >
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
<<<<<<< HEAD
=======
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
