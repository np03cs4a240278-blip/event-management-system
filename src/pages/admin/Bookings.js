import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadBookings = async () => {
      try {
        const response = await API.get("/all-bookings");

        if (isActive) {
          setBookings(response.data.bookings ?? []);
        }
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError, "Could not load bookings."));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <AppShell
      subtitle="Review booking activity across every user and event."
      title="All Bookings"
    >
      {error ? <p className="message message-error">{error}</p> : null}

      <section className="panel">
        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Bookings will appear here as soon as users reserve events.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Location</th>
                  <th>Event Date</th>
                  <th>Price</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.user.name}</td>
                    <td>{booking.user.email}</td>
                    <td>{booking.event.title}</td>
                    <td>{booking.event.location}</td>
                    <td>{formatDate(booking.event.date)}</td>
                    <td>{formatPrice(booking.event.price)}</td>
                    <td>{formatDate(booking.created_at?.slice(0, 10))}</td>
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

export default Bookings;
