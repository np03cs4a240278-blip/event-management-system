// StatusBadge.js — Color-coded booking status labels with icons
// Statuses: confirmed, cancelled, completed, pending

import { CheckCircle, XCircle, Clock, Star } from "lucide-react";
import "../styles/statusbadge.css";

/**
 * Derives the display status from a booking object.
 * - If the event date is in the past and status is not cancelled → "completed"
 * - Otherwise use the stored status (default "confirmed")
 */
export function deriveStatus(booking) {
  if (!booking) return "pending";

  const eventDateStr = booking.event_date || booking.event?.date;
  if (eventDateStr && booking.status !== "cancelled") {
    const eventDate = new Date(`${eventDateStr}T23:59:59`);
    if (eventDate < new Date()) return "completed";
  }

  return booking.status || "confirmed";
}

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", className: "badge--confirmed", Icon: CheckCircle },
  cancelled: { label: "Cancelled", className: "badge--cancelled", Icon: XCircle },
  completed: { label: "Completed", className: "badge--completed", Icon: Star },
  pending:   { label: "Pending",   className: "badge--pending",   Icon: Clock },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const { Icon } = config;

  return (
    <span className={`status-badge ${config.className}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

export default StatusBadge;
