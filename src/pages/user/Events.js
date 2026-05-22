// user/Events.js — Browse and search events page
// Uses lucide-react icons

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, CalendarDays, X, AlertTriangle } from "lucide-react";
import EventCard from "../../components/EventCard";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import Navbar from "../Navbar";
import "../theme.css";
import "../DashboardShared.css";

async function fetchEventData(search, location) {
  const params = {};
  if (search.trim())   params.search   = search.trim();
  if (location.trim()) params.location = location.trim();
  const [eventsResponse, bookingsResponse] = await Promise.all([
    API.get("/events", { params }),
    API.get("/my-bookings"),
  ]);
  return {
    events:    eventsResponse.data.events ?? [],
    bookedIds: new Set((bookingsResponse.data.bookings ?? []).map((b) => b.event.id)),
  };
}

// Skeleton loading card
function SkeletonCard() {
  return (
    <div className="theme-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        height: 180,
        background: "linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }} />
      <div style={{ padding: "1.25rem", display: "grid", gap: 10 }}>
        <div style={{ height: 14, background: "#F3F4F6", borderRadius: 6, width: "60%" }} />
        <div style={{ height: 18, background: "#F3F4F6", borderRadius: 6, width: "80%" }} />
        <div style={{ height: 38, background: "#EDE9FE", borderRadius: 999, marginTop: 8 }} />
      </div>
    </div>
  );
}

function Events() {
  const navigate = useNavigate();
  const [events, setEvents]                 = useState([]);
  const [bookedEventIds, setBookedEventIds] = useState(new Set());
  const [search, setSearch]                 = useState("");
  const [location, setLocation]             = useState("");
  const [loading, setLoading]               = useState(true);
  const [feedback, setFeedback]             = useState({ type: "", text: "" });

  const loadEvents = async (s = search, l = location) => {
    setLoading(true);
    setFeedback({ type: "", text: "" });
    try {
      const { events: loaded, bookedIds } = await fetchEventData(s, l);
      setEvents(loaded);
      setBookedEventIds(bookedIds);
    } catch (requestError) {
      setFeedback({ type: "error", text: getErrorMessage(requestError, "Could not load events.") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    fetchEventData("", "")
      .then(({ events: loaded, bookedIds }) => {
        if (isActive) { setEvents(loaded); setBookedEventIds(bookedIds); setLoading(false); }
      })
      .catch((err) => {
        if (isActive) { setFeedback({ type: "error", text: getErrorMessage(err, "Could not load events.") }); setLoading(false); }
      });
    return () => { isActive = false; };
  }, []);

  const handleSearch = async (e) => { e.preventDefault(); await loadEvents(search, location); };
  const handleClear  = async () => { setSearch(""); setLocation(""); await loadEvents("", ""); };
  const handleBookEvent = (event) => { setFeedback({ type: "", text: "" }); navigate("/book-venue", { state: { eventId: event.id } }); };
  const isFiltered = search.trim() || location.trim();

  return (
    <div className="dash-page">
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
      <Navbar />

      {/* Hero */}
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">
          <CalendarDays size={22} />
          Browse Events
        </h1>
        <p className="dash-hero-sub">Search by title or location, then reserve your seat in one click.</p>
      </div>

      <div className="dash-content">
        {/* Search bar */}
        <div className="theme-card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 12, alignItems: "end" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#4B5563", marginBottom: 6 }}>
                <Search size={13} />
                Search title
              </label>
              <input className="theme-input" onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Tech Summit" type="text" value={search} />
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#4B5563", marginBottom: 6 }}>
                <MapPin size={13} />
                Location
              </label>
              <input className="theme-input" onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kathmandu" type="text" value={location} />
            </div>
            <button className="theme-btn" type="submit" style={{ height: 44, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
              <Search size={14} />
              Search
            </button>
            <button className="theme-btn" type="button" onClick={handleClear}
              style={{ height: 44, background: "#F3F4F6", color: "#4B5563", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
              <X size={14} />
              Clear
            </button>
          </form>
          {!loading && (
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 4 }}>
              <CalendarDays size={13} />
              {isFiltered
                ? `Found ${events.length} event${events.length !== 1 ? "s" : ""} matching your search`
                : `${events.length} event${events.length !== 1 ? "s" : ""} available`}
            </p>
          )}
        </div>

        {/* Feedback */}
        {feedback.text && (
          <div className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {feedback.type === "error" ? <AlertTriangle size={15} /> : null}
            {feedback.text}
          </div>
        )}

        {/* Events grid */}
        {loading ? (
          <div className="dash-venues-grid">{[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}</div>
        ) : events.length === 0 ? (
          <div className="theme-card dash-empty">
            <div className="dash-empty-icon"><Search size={48} /></div>
            <p>{isFiltered ? "No events match your search. Try different keywords or clear the filters." : "No events available right now. Check back soon!"}</p>
            {isFiltered && (
              <button className="theme-btn" onClick={handleClear} style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <section className="event-grid">
            {events.map((event) => (
              <EventCard
                alreadyBooked={bookedEventIds.has(event.id)}
                event={event}
                isBooking={false}
                key={event.id}
                onBook={handleBookEvent}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default Events;
