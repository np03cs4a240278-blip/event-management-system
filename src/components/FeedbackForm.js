// FeedbackForm.js — Event review/feedback component
// Stores reviews in localStorage keyed by eventId.
// Can be used standalone (/feedback route) or embedded inside the Events page.

import { useEffect, useState } from "react";
import "./FeedbackForm.css";

const STAR_LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

// ── localStorage helpers ──────────────────────────────────────────────────────

function storageKey(eventId) {
  return `ems.reviews.${eventId}`;
}

function loadReviews(eventId) {
  try {
    const raw = localStorage.getItem(storageKey(eventId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReviews(eventId, reviews) {
  localStorage.setItem(storageKey(eventId), JSON.stringify(reviews));
}

function calcAvg(reviews) {
  if (!reviews.length) return null;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

// ── sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating, hovered, onRate, onHover, onLeave }) {
  return (
    <div className="fb-stars" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`fb-star ${star <= (hovered || rating) ? "fb-star--on" : ""}`}
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      {(hovered || rating) > 0 && (
        <span className="fb-star-label">{STAR_LABELS[(hovered || rating) - 1]}</span>
      )}
    </div>
  );
}

function StaticStars({ rating, size = "sm" }) {
  return (
    <span className={`fb-static-stars fb-static-stars--${size}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "fb-star--on" : "fb-star--off"}>★</span>
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="fb-review-card">
      <div className="fb-review-header">
        <div className="fb-review-avatar">{review.name.charAt(0).toUpperCase()}</div>
        <div className="fb-review-meta">
          <div className="fb-review-name">{review.name}</div>
          <div className="fb-review-date">{review.date}</div>
        </div>
        <div className="fb-review-stars">
          <StaticStars rating={review.rating} />
        </div>
      </div>
      <p className="fb-review-text">{review.text}</p>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

/**
 * Props:
 *   eventId   – unique identifier used as the localStorage key (required)
 *   eventName – display name shown in the header (optional)
 *   embedded  – when true, renders without the full-page wrapper / hero header
 */
export default function FeedbackForm({ eventId, eventName = "this event", embedded = false }) {
  const [reviews, setReviews] = useState(() => loadReviews(eventId));
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName]       = useState("");
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview]   = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  // Keep localStorage in sync whenever reviews change
  useEffect(() => {
    saveReviews(eventId, reviews);
  }, [eventId, reviews]);

  // Reload if eventId changes (different event panel opened)
  useEffect(() => {
    setReviews(loadReviews(eventId));
    setShowForm(false);
    resetForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  function resetForm() {
    setName(""); setRating(0); setHovered(0); setReview(""); setError(""); setSuccess(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim())          { setError("Please enter your name."); return; }
    if (rating === 0)          { setError("Please select a star rating."); return; }
    if (!review.trim())        { setError("Please write your review."); return; }
    if (review.length > 500)   { setError("Review must be 500 characters or fewer."); return; }

    const newReview = {
      id:     Date.now(),
      name:   name.trim(),
      rating,
      text:   review.trim(),
      date:   new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setReviews((prev) => [newReview, ...prev]);
    setSuccess(true);
    setShowForm(false);
    resetForm();
    setTimeout(() => setSuccess(false), 4000);
  };

  const avg = calcAvg(reviews);

  const content = (
    <div className={embedded ? "fb-embedded" : "fb-container"}>

      {/* Summary bar */}
      <div className="fb-summary">
        <div className="fb-summary-score">
          <span className="fb-summary-num">{avg ?? "—"}</span>
          <span className="fb-summary-max">/5</span>
        </div>
        <div className="fb-summary-right">
          <StaticStars rating={avg ? parseFloat(avg) : 0} size="md" />
          <div className="fb-summary-count">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          className="fb-write-btn"
          type="button"
          onClick={() => { setShowForm((v) => !v); setError(""); }}
        >
          {showForm ? "✕ Cancel" : "✏ Write a Review"}
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="fb-success">✓ Thank you! Your review has been submitted.</div>
      )}

      {/* Collapsible form */}
      {showForm && (
        <div className="fb-card">
          <h2 className="fb-card-title">Write a Review</h2>
          {error && <div className="fb-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="fb-field">
              <label className="fb-label">Your Name *</label>
              <input
                className="fb-input"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="fb-field">
              <label className="fb-label">Your Rating *</label>
              <StarRating
                rating={rating}
                hovered={hovered}
                onRate={setRating}
                onHover={setHovered}
                onLeave={() => setHovered(0)}
              />
            </div>

            <div className="fb-field">
              <label className="fb-label">Your Review *</label>
              <textarea
                className="fb-input fb-textarea"
                placeholder="Tell us about your experience..."
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <span className={`fb-char-count ${review.length > 480 ? "fb-char-count--warn" : ""}`}>
                {review.length}/500
              </span>
            </div>

            <button className="fb-submit" type="submit">Submit Review</button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="fb-reviews">
          <h2 className="fb-reviews-title">
            All Reviews <span className="fb-reviews-badge">{reviews.length}</span>
          </h2>
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : (
        !showForm && (
          <div className="fb-no-reviews">
            <span className="fb-no-reviews-icon">💬</span>
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )
      )}
    </div>
  );

  // Standalone page mode (used by /feedback route)
  if (!embedded) {
    return (
      <div className="fb-page">
        <div className="fb-header">
          <h1 className="fb-header-title">Event Feedback</h1>
          <p className="fb-header-sub">Share your experience about {eventName}</p>
        </div>
        {content}
      </div>
    );
  }

  return content;
}
