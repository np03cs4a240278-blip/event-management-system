// StatusBadge.js — Color-coded booking status labels
// Statuses: confirmed, cancelled, completed, pending

import "../styles/statusbadge.css";

/**
 * Derives the display status from a booking object.
 * - If the event date is in the past and status is not cancelled → "completed"
 * - Otherwise use the stored status (default "confirmed")
 */
export function deriveStatus(booking) {
  if (!booking) return "pending";

  // Use event date to determine if the event has passed
  const eventDateStr = booking.event_date || booking.event?.date;
  if (eventDateStr && booking.status !== "cancelled") {
    const eventDate = new Date(`${eventDateStr}T23:59:59`);
    if (eventDate < new Date()) return "completed";
  }

  return booking.status || "confirmed";
}

const STATUS_CONFIG = {
  confirmed:  { label: "Confirmed",  className: "badge--confirmed"  },
  cancelled:  { label: "Cancelled",  className: "badge--cancelled"  },
  completed:  { label: "Completed",  className: "badge--completed"  },
  pending:    { label: "Pending",    className: "badge--pending"    },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
