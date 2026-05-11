// EventCard.js — Displays a single event with booking and review actions
// Shows: image, date, price, title, description, location, rating, actions

import { useEffect, useState } from "react";
import { formatDate, formatPrice } from "../utils/formatters";
import "../styles/eventcard.css";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80";

/** Read the stored average rating for an event from localStorage */
function getStoredAvg(eventId) {
  try {
    const raw = localStorage.getItem(`ems.reviews.${eventId}`);
    if (!raw) return null;
    const reviews = JSON.parse(raw);
    if (!reviews.length) return null;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avg: avg.toFixed(1), count: reviews.length };
  } catch {
    return null;
  }
}

function MiniStars({ rating }) {
  return (
    <span className="event-card__stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{ color: s <= Math.round(rating) ? "#FBBF24" : "#D1D5DB", fontSize: 13 }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * Props:
 *  - event: object
 *  - onBook: (event) => void
 *  - isBooking: boolean
 *  - alreadyBooked: boolean
 *  - onToggleReviews: (eventId) => void  (optional)
 *  - reviewsOpen: boolean                (optional)
 */
function EventCard({ event, onBook, isBooking, alreadyBooked, onToggleReviews, reviewsOpen }) {
  const imageSource = event.image?.trim() ? event.image : FALLBACK_IMAGE;
  const [ratingInfo, setRatingInfo] = useState(() => getStoredAvg(event.id));

  // Refresh rating when the review panel closes (new review may have been added)
  useEffect(() => {
    if (!reviewsOpen) {
      setRatingInfo(getStoredAvg(event.id));
    }
  }, [reviewsOpen, event.id]);

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

        {/* Rating summary */}
        {ratingInfo ? (
          <div className="event-card__rating">
            <MiniStars rating={parseFloat(ratingInfo.avg)} />
            <span className="event-card__rating-num">{ratingInfo.avg}</span>
            <span className="event-card__rating-count">({ratingInfo.count})</span>
          </div>
        ) : (
          <div className="event-card__rating event-card__rating--none">No reviews yet</div>
        )}

        <div className="event-card__actions">
          <button
            className="button event-card__button"
            disabled={alreadyBooked || isBooking}
            onClick={() => onBook(event)}
            type="button"
          >
            {alreadyBooked ? "Booked" : isBooking ? "Booking..." : "Book Event"}
          </button>

          {onToggleReviews && (
            <button
              className={`event-card__review-btn ${reviewsOpen ? "event-card__review-btn--active" : ""}`}
              onClick={() => onToggleReviews(event.id)}
              type="button"
            >
              {reviewsOpen ? "Hide Reviews" : "★ Reviews"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default EventCard;
