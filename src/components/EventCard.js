// EventCard.js — Displays a single event with booking action
// Uses lucide-react icons for a modern, consistent look

import { Calendar, MapPin, Tag, CheckCircle, Ticket } from "lucide-react";
import { formatDate, formatPrice } from "../utils/formatters";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";

function EventCard({ event, onBook, isBooking, alreadyBooked }) {
  const imageSource = event.image?.trim() ? event.image : FALLBACK_IMAGE;

  return (
    <article className="event-card">
      {/* Event image */}
      <img
        alt={event.title}
        className="event-card__image"
        src={imageSource}
        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
      />

      <div className="event-card__content">
        {/* Date & price meta */}
        <div className="event-card__meta">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Calendar size={13} />
            {formatDate(event.date)}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Tag size={13} />
            {formatPrice(event.price)}
          </span>
        </div>

        <h3>{event.title}</h3>
        <p>{event.description}</p>

        {/* Location */}
        <p className="event-card__location" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={13} />
          {event.location}
        </p>

        {/* Book button */}
        <button
          className="button event-card__button"
          disabled={alreadyBooked || isBooking}
          onClick={() => onBook(event)}
          type="button"
          style={
            alreadyBooked
              ? { background: "linear-gradient(135deg, #D1FAE5, #A7F3D0)", color: "#065F46" }
              : {}
          }
        >
          {alreadyBooked ? (
            <>
              <CheckCircle size={15} />
              Booked
            </>
          ) : isBooking ? (
            "Booking..."
          ) : (
            <>
              <Ticket size={15} />
              Book Event
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default EventCard;
