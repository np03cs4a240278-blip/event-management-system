// admin/Bookings.js — Admin view of all bookings
// Uses lucide-react icons

import { useEffect, useState } from "react";
import {
  BookMarked,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  DollarSign,
  Search,
  Trash2,
  Edit3,
  AlertCircle,
  MapPin,
  CalendarDays,
} from "lucide-react";
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

// ── Single booking row ────────────────────────────────────────────────────
function BookingRow({ booking, onDelete, onConfirm }) {
  const [review, setReview]   = useState(booking.admin_note || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const status                = booking.status || STATUS.PENDING;

  useEffect(() => { setReview(booking.admin_note || ""); }, [booking.admin_note]);

  const handleConfirm = async () => {
    setSaving(true);
    try { await onConfirm(booking.id, review); setEditing(false); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove booking by ${booking.user?.name} for "${booking.event?.title}"?`)) return;
    await onDelete(booking.id);
  };

  const statusConfig = {
    [STATUS.PENDING]:   { bg: "#fef3c7", color: "#92400e", Icon: Clock },
    [STATUS.CONFIRMED]: { bg: "#d1fae5", color: "#065f46", Icon: CheckCircle },
    [STATUS.CANCELLED]: { bg: "#fee2e2", color: "#b91c1c", Icon: XCircle },
  }[status] || { bg: "#fef3c7", color: "#92400e", Icon: Clock };

  const { Icon: StatusIcon } = statusConfig;

  return (
    <article className="admin-booking-row">
      <div className="admin-booking-row__info">
        {/* User */}
        <div>
          <p className="eyebrow">User</p>
          <strong>{booking.user?.name}</strong>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-text-muted)" }}>{booking.user?.email}</p>
        </div>
        {/* Event */}
        <div>
          <p className="eyebrow">Event</p>
          <strong>{booking.event?.title}</strong>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            <MapPin size={11} /> {booking.event?.location}
            <span style={{ margin: "0 2px" }}>·</span>
            <CalendarDays size={11} /> {formatDate(booking.event?.date)}
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
        {/* Status */}
        <div>
          <p className="eyebrow">Status</p>
          <span style={{
            background: statusConfig.bg, color: statusConfig.color,
            padding: "4px 12px", borderRadius: 999, fontSize: "0.8rem", fontWeight: 700,
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <StatusIcon size={12} />
            {STATUS_LABEL[status] || STATUS_LABEL[STATUS.PENDING]}
          </span>
        </div>
      </div>

      {/* Admin review / confirm */}
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
              <button className="button" disabled={saving} onClick={handleConfirm} type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <CheckCircle size={14} />
                {saving ? "Saving..." : status === STATUS.CONFIRMED ? "Save Note" : "Confirm & Save"}
              </button>
              <button className="button button-secondary" onClick={() => setEditing(false)} type="button">
                Cancel
              </button>
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
                <button className="button" onClick={() => setEditing(true)} type="button"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <CheckCircle size={14} />
                  Confirm
                </button>
              ) : (
                <button className="button button-secondary" onClick={() => setEditing(true)} type="button"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Edit3 size={14} />
                  Edit Note
                </button>
              )}
              <button className="button button-danger" onClick={handleDelete} type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// ── Main Bookings page ────────────────────────────────────────────────────
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
      const response = await API.post(`/bookings/${id}/confirm`, { status: STATUS.CONFIRMED, admin_note: note });
      setBookings((prev) => prev.map((b) => (b.id === id ? response.data.booking : b)));
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

  const confirmed    = bookings.filter((b) => b.status === STATUS.CONFIRMED).length;
  const pending      = bookings.filter((b) => !b.status || b.status === STATUS.PENDING).length;
  const totalRevenue = bookings.reduce((s, b) => s + (Number(b.total_price) || Number(b.event?.price) || 0), 0);

  return (
    <AppShell subtitle="Review every booking, confirm reservations, and add admin notes." title="All Bookings">

      {error    ? (
        <p className="message message-error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={15} />{error}
        </p>
      ) : null}
      {feedback ? (
        <p className="message message-success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle size={15} />{feedback}
        </p>
      ) : null}

      {/* Stats */}
      <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        {[
          { label: "Total Bookings", value: bookings.length,                                    Icon: BookMarked,  color: "#7c3aed" },
          { label: "Confirmed",      value: confirmed,                                           Icon: CheckCircle, color: "#027a48" },
          { label: "Pending",        value: pending,                                             Icon: Clock,       color: "#b45309" },
          { label: "Unique Users",   value: new Set(bookings.map((b) => b.user?.email)).size,   Icon: Users,       color: "#0f766e" },
          { label: "Total Revenue",  value: `Rs. ${totalRevenue.toLocaleString()}`,             Icon: DollarSign,  color: "#be185d" },
        ].map(({ label, value, Icon, color }) => (
          <article className="stat-card" key={label} style={{ borderTop: `4px solid ${color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="stat-card__label">{label}</span>
              <Icon size={18} color={color} style={{ opacity: 0.7 }} />
            </div>
            <strong style={{ color }}>{value}</strong>
          </article>
        ))}
      </section>

      {/* Bookings list */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Booking records</p>
            <h2 style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <BookMarked size={18} color="#818CF8" />
              All Bookings
            </h2>
          </div>
          <span className="pill">{filtered.length} shown</span>
        </div>

        {/* Search */}
        <label className="field" style={{ maxWidth: 380, marginBottom: "1rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Search size={13} />
            Search by user, email or event
          </span>
          <input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to filter..."
            type="text"
            value={search}
          />
        </label>

        {loading ? (
          <p style={{ color: "var(--color-text-muted)", padding: "1rem 0" }}>Loading bookings...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings found</h3>
            <p>{search ? "Try a different search term." : "Bookings will appear here once users reserve events."}</p>
          </div>
        ) : (
          <div className="admin-bookings-list">
            {filtered.map((b) => (
              <BookingRow booking={b} key={b.id} onConfirm={handleConfirm} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default Bookings;
