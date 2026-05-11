import { formatDate, formatPrice } from "../utils/formatters";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";

function EventCard({ event, onBook, isBooking, alreadyBooked }) {
  const imageSource = event.image?.trim() ? event.image : FALLBACK_IMAGE;

  return (
    <article className="event-card">
      <img alt={event.title} className="event-card__image" src={imageSource} />

      <div className="event-card__content">
        <div className="event-card__meta">
          <span>{formatDate(event.date)}</span>
          <span>{formatPrice(event.price)}</span>
        </div>

        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <p className="event-card__location">{event.location}</p>

        <button
          className="button event-card__button"
          disabled={alreadyBooked || isBooking}
          onClick={() => onBook(event)}
          type="button"
        >
          {alreadyBooked ? "Booked" : isBooking ? "Booking..." : "Book Event"}
        </button>
      </div>
    </article>
  );
}

export default EventCard;
