// Events.js — Browse and filter events, then book them
// Features: search, category, type, venue, date, price range filters
// All filters work client-side for instant results after initial load.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/AppShell";
import EventCard from "../../components/EventCard";
import EventFilters from "../../components/EventFilters";
import FeedbackForm from "../../components/FeedbackForm";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import "../../styles/eventcard.css";

// Default filter state — all empty means "show everything"
const DEFAULT_FILTERS = {
  search:    "",
  category:  "",
  eventType: "",
  venue:     "",
  date:      "",
  priceMin:  "",
  priceMax:  "",
};

// Fetch all events and the user's booked event IDs in parallel
async function fetchEventData() {
  const [eventsResponse, bookingsResponse] = await Promise.all([
    API.get("/events"),
    API.get("/my-bookings"),
  ]);
  return {
    events:    eventsResponse.data.events ?? [],
    bookedIds: new Set(
      (bookingsResponse.data.bookings ?? []).map((b) => b.event.id)
    ),
  };
}

// Apply all active filters to the events array (client-side, instant)
function applyFilters(events, filters) {
  return events.filter((event) => {
    // Search by title (case-insensitive)
    if (
      filters.search &&
      !event.title?.toLowerCase().includes(filters.search.toLowerCase())
    ) return false;

    // Category filter
    if (filters.category && event.category !== filters.category) return false;

    // Event type filter
    if (
      filters.eventType &&
      (event.type || event.event_type) !== filters.eventType
    ) return false;

    // Venue / location filter
    if (
      filters.venue &&
      (event.venue || event.location) !== filters.venue
    ) return false;

    // Date filter — exact date match
    if (filters.date && event.date !== filters.date) return false;

    // Price range
    const price = Number(event.price);
    if (filters.priceMin && price < Number(filters.priceMin)) return false;
    if (filters.priceMax && price > Number(filters.priceMax)) return false;

    return true;
  });
}

function Events() {
  const navigate = useNavigate();

  // All events loaded from backend (unfiltered)
  const [allEvents, setAllEvents]         = useState([]);
  const [bookedEventIds, setBookedEventIds] = useState(new Set());
  const [loading, setLoading]             = useState(true);
  const [feedback, setFeedback]           = useState({ type: "", text: "" });

  // Active filter values
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Which event's review panel is open (null = none)
  const [openReviewId, setOpenReviewId] = useState(null);

  // Load events once on mount
  useEffect(() => {
    let isActive = true;
    fetchEventData()
      .then(({ events, bookedIds }) => {
        if (isActive) {
          setAllEvents(events);
          setBookedEventIds(bookedIds);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isActive) {
          setFeedback({
            type: "error",
            text: getErrorMessage(err, "Could not load events."),
          });
          setLoading(false);
        }
      });
    return () => { isActive = false; };
  }, []);

  // Apply filters whenever events or filter values change
  const filteredEvents = useMemo(
    () => applyFilters(allEvents, filters),
    [allEvents, filters]
  );

  // Update a single filter key
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Navigate to BookVenue with the selected event pre-filled
  const handleBookEvent = (event) => {
    setFeedback({ type: "", text: "" });
    navigate("/book-venue", { state: { eventId: event.id } });
  };

  // Toggle the inline review panel for an event
  const handleToggleReviews = (eventId) => {
    setOpenReviewId((prev) => (prev === eventId ? null : eventId));
  };

  return (
    <AppShell
      title="Browse Events"
      subtitle="Filter by category, type, venue, date, or price — then book in one click."
    >
      {/* Advanced filter panel */}
      <EventFilters
        events={allEvents}
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Results count */}
      {!loading && allEvents.length > 0 && (
        <p className="events-results-count">
          Showing <strong>{filteredEvents.length}</strong> of{" "}
          <strong>{allEvents.length}</strong> events
        </p>
      )}

      {/* Feedback messages */}
      {feedback.text && (
        <p
          className={`message ${
            feedback.type === "error" ? "message-error" : "message-success"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {/* Content */}
      {loading ? (
        <section className="panel">
          <p>Loading events...</p>
        </section>
      ) : filteredEvents.length === 0 ? (
        <section className="empty-state">
          <h3>No events found</h3>
          <p>Try adjusting your filters or clearing them to see all events.</p>
          {Object.values(filters).some(Boolean) && (
            <button
              className="button button-secondary"
              onClick={handleClearFilters}
              type="button"
              style={{ marginTop: 12 }}
            >
              Clear All Filters
            </button>
          )}
        </section>
      ) : (
        <div className="events-list">
          {filteredEvents.map((event) => (
            <div key={event.id} className="events-list__item">
              {/* Event card */}
              <div className="events-list__cards">
                <EventCard
                  event={event}
                  onBook={handleBookEvent}
                  isBooking={false}
                  alreadyBooked={bookedEventIds.has(event.id)}
                  onToggleReviews={handleToggleReviews}
                  reviewsOpen={openReviewId === event.id}
                />
              </div>

              {/* Inline review panel — slides in below the card */}
              {openReviewId === event.id && (
                <div className="events-list__review-panel">
                  <div className="events-list__review-panel-inner">
                    <div className="events-list__review-panel-title">
                      Reviews for <span>{event.title}</span>
                    </div>
                    <FeedbackForm
                      embedded
                      eventId={String(event.id)}
                      eventName={event.title}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default Events;
