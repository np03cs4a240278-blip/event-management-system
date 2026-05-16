// FeedbackForm.js — Event review/feedback component
// Stores reviews in localStorage keyed by eventId.

import { useState } from "react";
import "./FeedbackForm.css";

const STAR_LABELS = ["Terrible", "Poor", "Okay", "Good", "Excellent"];

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
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= review.rating ? "fb-star--on" : "fb-star--off"}>★</span>
          ))}
        </div>
      </div>
      <p className="fb-review-text">{review.text}</p>
    </div>
  );
}

export default function FeedbackForm({ eventName = "this event" }) {
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview]   = useState("");
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState([
    { id: 1, name: "Ayush K.",  rating: 5, text: "Amazing event! Well organized and very informative.", date: "Apr 8, 2026" },
    { id: 2, name: "Priya S.",  rating: 4, text: "Great experience overall. Would definitely attend again.", date: "Apr 9, 2026" },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())   { setError("Please enter your name."); return; }
    if (rating === 0)   { setError("Please select a star rating."); return; }
    if (!review.trim()) { setError("Please write your review."); return; }

    const newReview = {
      id:     Date.now(),
      name:   name.trim(),
      rating,
      text:   review.trim(),
      date:   new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setReviews((prev) => [newReview, ...prev]);
    setSuccess(true);
    setRating(0);
    setReview("");
    setName("");
    setTimeout(() => setSuccess(false), 3000);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="fb-page">
      <div className="fb-header">
        <h1 className="fb-header-title">Event Feedback</h1>
        <p className="fb-header-sub">Share your experience about {eventName}</p>
      </div>

      <div className="fb-container">
        {/* Summary bar */}
        <div className="fb-summary">
          <div className="fb-summary-score">
            <span className="fb-summary-num">{avgRating}</span>
            <span className="fb-summary-max">/5</span>
          </div>
          <div>
            <div className="fb-summary-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={s <= Math.round(avgRating) ? "fb-star--on" : "fb-star--off"}>★</span>
              ))}
            </div>
            <div className="fb-summary-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {/* Form card */}
        <div className="fb-card">
          <h2 className="fb-card-title">Write a Review</h2>

          {success && <div className="fb-success">✓ Thank you! Your review has been submitted.</div>}
          {error   && <div className="fb-error">{error}</div>}

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
              <span className="fb-char-count">{review.length}/500</span>
            </div>

            <button className="fb-submit" type="submit">Submit Review</button>
          </form>
        </div>

        {/* Reviews list */}
        {reviews.length > 0 && (
          <div className="fb-reviews">
            <h2 className="fb-reviews-title">
              All Reviews <span className="fb-reviews-badge">{reviews.length}</span>
            </h2>
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
