// EventFilters.js — Advanced filtering panel for the Events page
// Filters: search, category, event type, venue, date, price range
// All filters work together and update results instantly.

import { useMemo } from "react";
import "../styles/eventfilters.css";

// Derive unique filter options from the events list
function unique(arr) {
  return [...new Set(arr.filter(Boolean))].sort();
}

/**
 * Props:
 *  - events: array of all events (used to build filter options)
 *  - filters: { search, category, eventType, venue, date, priceMin, priceMax }
 *  - onChange: (key, value) => void
 *  - onClear: () => void
 */
function EventFilters({ events = [], filters, onChange, onClear }) {
  // Build dynamic option lists from the current event data
  const categories  = useMemo(() => unique(events.map((e) => e.category)), [events]);
  const eventTypes  = useMemo(() => unique(events.map((e) => e.type || e.event_type)), [events]);
  const venues      = useMemo(() => unique(events.map((e) => e.venue || e.location)), [events]);

  // Check if any filter is active so we can show/hide the Clear button
  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.eventType ||
    filters.venue ||
    filters.date ||
    filters.priceMin ||
    filters.priceMax;

  return (
    <section className="event-filters" aria-label="Event filters">
      <div className="event-filters__header">
        <h3 className="event-filters__title">🔍 Filter Events</h3>
        {hasActiveFilters && (
          <button
            className="event-filters__clear-btn"
            onClick={onClear}
            type="button"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      <div className="event-filters__grid">
        {/* Search bar */}
        <div className="event-filters__field event-filters__field--wide">
          <label className="event-filters__label" htmlFor="ef-search">
            Search Events
          </label>
          <input
            className="event-filters__input"
            id="ef-search"
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="Search by event name..."
            type="text"
            value={filters.search}
          />
        </div>

        {/* Category */}
        <div className="event-filters__field">
          <label className="event-filters__label" htmlFor="ef-category">
            Category
          </label>
          <select
            className="event-filters__select"
            id="ef-category"
            onChange={(e) => onChange("category", e.target.value)}
            value={filters.category}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div className="event-filters__field">
          <label className="event-filters__label" htmlFor="ef-type">
            Event Type
          </label>
          <select
            className="event-filters__select"
            id="ef-type"
            onChange={(e) => onChange("eventType", e.target.value)}
            value={filters.eventType}
          >
            <option value="">All Types</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Venue / Location */}
        <div className="event-filters__field">
          <label className="event-filters__label" htmlFor="ef-venue">
            Venue / Location
          </label>
          <select
            className="event-filters__select"
            id="ef-venue"
            onChange={(e) => onChange("venue", e.target.value)}
            value={filters.venue}
          >
            <option value="">All Venues</option>
            {venues.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="event-filters__field">
          <label className="event-filters__label" htmlFor="ef-date">
            Date
          </label>
          <input
            className="event-filters__input"
            id="ef-date"
            onChange={(e) => onChange("date", e.target.value)}
            type="date"
            value={filters.date}
          />
        </div>

        {/* Price Range */}
        <div className="event-filters__field event-filters__field--price">
          <label className="event-filters__label">Price Range (Rs.)</label>
          <div className="event-filters__price-row">
            <input
              className="event-filters__input"
              min="0"
              onChange={(e) => onChange("priceMin", e.target.value)}
              placeholder="Min"
              type="number"
              value={filters.priceMin}
            />
            <span className="event-filters__price-sep">–</span>
            <input
              className="event-filters__input"
              min="0"
              onChange={(e) => onChange("priceMax", e.target.value)}
              placeholder="Max"
              type="number"
              value={filters.priceMax}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventFilters;
