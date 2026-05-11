// admin/Bookings.js — Admin view of all bookings
// Allows confirming, adding notes, and deleting bookings.

import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

const STATUS = { PENDING: "pending", CONFIRMED: "confirmed", CANCELLED: "cancelled" };
const STATUS_LABEL = {
  [STATUS.PENDING]:   "Pending",
  [STATUS.CONFIRMED]: "Confirmed",
  [STATUS.CANCELLED]: "Cancelled",
};

function BookingRow({ booking, onDelete, onConfirm }) {
  const [review, setReview]   = useState(booking.admin_note || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const status                = booking.status || STATUS.PENDING;

  useEffect(() => {
    setReview(booking.admin_note || "");
  }, [booking.admin_note]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm(booking.id, review);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove booking by ${booking.user?.name} for "${booking.event?.title}"?`)) return;
    await onDelete(booking.id);
  };

  const statusColor = {
    [STATUS.PENDING]:   { background: "#fef3c7", color: "#92400e" },
    [STATUS.CONFIRMED]: { background: "#d1fae5", color: "#065f46" },
    [STATUS.CANCELLED]: { background: "#fee2e2", color: "#b91c1c" },
  }[status] || { background: "#fef3c7", color: "#92400e" };

  return (
    <article className="admin-booking-row">
      <div className="admin-booking-row__info">
        {/* User */}
        <div>
          <p className="eyebrow">User</p>
          <strong>{booking.user?.name}</strong>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)" }}>{booking.user?.email}</p>
        </div>
        {/* Event */}
        <div>
          <p className="eyebrow">Event</p>
          <strong>{booking.event?.title}</strong>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)" }}>
            {booking.event?.location} · {formatDate(booking.event?.date)}
          </p>
        </div>
        {/* Price */}
        <div>
          <p className="eyebrow">Price</p>
          <strong>{formatPrice(booking.total_price || booking.event?.price)}</strong>
        </div>
        {/* Booked on */}
        <div>
          <p className="eyebrow">Booked On</p>
          <strong>{formatDate(booking.created_at?.slice(0, 10))}</strong>
        </div>
        {/* Status badge */}
        <div>
          <p className="eyebrow">Status</p>
          <span style={{ ...statusColor, padding: "3px 12px", borderRadius: 999, fontSize: "0.82rem", fontWeight: 700 }}>
            {STATUS_LABEL[status] || STATUS_LABEL[STATUS.PENDING]}
          </span>
        </div>
      </div>

      {/* Admin review box */}
      <div className="admin-booking-row__review">
        {editing ? (
          <>
            <textarea
              className="admin-review-input"
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write an admin note or review for this booking..."
              rows={3}
              value={review}
            />
            <div className="row-actions" style={{ marginTop: 8 }}>
              <button className="button" disabled={saving} onClick={handleConfirm} type="button">
                {saving ? "Saving..." : status === STATUS.CONFIRMED ? "Save Note" : "Confirm & Save"}
              </button>
              <button className="button button-secondary" onClick={() => setEditing(false)} type="button">Cancel</button>
            </div>
          </>
        ) : (
          <>
            {review ? (
              <p className="admin-review-note">
                <span className="eyebrow" style={{ display: "block", marginBottom: 2 }}>Admin Note</span>
                {review}
              </p>
            ) : null}
            <div className="row-actions">
              {status !== STATUS.CONFIRMED ? (
                <button className="button" onClick={() => setEditing(true)} type="button">
                  ✓ Confirm
                </button>
              ) : (
                <button className="button button-secondary" onClick={() => setEditing(true)} type="button">
                  Edit Note
                </button>
              )}
              <button className="button button-danger" onClick={handleDelete} type="button">Delete</button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [feedback, setFeedback] = useState("");

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get("/all-bookings");
      setBookings(res.data.bookings ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load bookings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setFeedback("Booking removed successfully.");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete booking."));
    }
  };

  const handleConfirm = async (id, note) => {
    try {
      const response = await API.post(`/bookings/${id}/confirm`, {
        status: STATUS.CONFIRMED,
        admin_note: note,
      });
      setBookings((prev) =>
        prev.map((booking) => (booking.id === id ? response.data.booking : booking))
      );
      setFeedback(response.data.message || `Booking #${id} confirmed.`);
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update booking."));
    }
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.event?.title?.toLowerCase().includes(q) ||
      b.event?.location?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell subtitle="Review every booking, confirm reservations, and add admin notes." title="All Bookings">

      {error    ? <p className="message message-error">{error}</p>     : null}
      {feedback ? <p className="message message-success">{feedback}</p> : null}

      {/* Stats bar */}
      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <article className="stat-card">
          <span className="stat-card__label">Total Bookings</span>
          <strong>{bookings.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Unique Users</span>
          <strong>{new Set(bookings.map((b) => b.user?.email)).size}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Total Revenue</span>
          <strong>Rs. {bookings.reduce((s, b) => s + (Number(b.total_price) || Number(b.event?.price) || 0), 0).toLocaleString()}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">Booking records</p><h2>All Bookings</h2></div>
          <span className="pill">{filtered.length} shown</span>
        </div>

        {/* Search */}
        <label className="field" style={{ maxWidth: 360, marginBottom: "1rem" }}>
          <span>Search by user, email or event</span>
          <input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to filter..."
            type="text"
            value={search}
          />
        </label>

        {loading ? <p>Loading bookings...</p> : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings found</h3>
            <p>{search ? "Try a different search term." : "Bookings will appear here once users reserve events."}</p>
          </div>
        ) : (
          <div className="admin-bookings-list">
            {filtered.map((b) => (
              <BookingRow
                booking={b}
                key={b.id}
                onConfirm={handleConfirm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

    </AppShell>
  );
}

export default Bookings;
