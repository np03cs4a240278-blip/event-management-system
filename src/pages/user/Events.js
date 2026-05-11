import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../../components/EventCard";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import Navbar from "../Navbar";
import "../theme.css";
import "../DashboardShared.css";

async function fetchEventData(search, location) {
  const params = {};
  if (search.trim()) params.search = search.trim();
  if (location.trim()) params.location = location.trim();

  const [eventsResponse, bookingsResponse] = await Promise.all([
    API.get("/events", { params }),
    API.get("/my-bookings"),
  ]);

  return {
    events: eventsResponse.data.events ?? [],
    bookedIds: new Set((bookingsResponse.data.bookings ?? []).map((b) => b.event.id)),
  };
}

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookedEventIds, setBookedEventIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

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
    fetchEventData("", "").then(({ events: loaded, bookedIds }) => {
      if (isActive) { setEvents(loaded); setBookedEventIds(bookedIds); setLoading(false); }
    }).catch((err) => {
      if (isActive) { setFeedback({ type: "error", text: getErrorMessage(err, "Could not load events.") }); setLoading(false); }
    });
    return () => { isActive = false; };
  }, []);

  const handleSearch = async (e) => { e.preventDefault(); await loadEvents(search, location); };
  const handleClear = async () => { setSearch(""); setLocation(""); await loadEvents("", ""); };

  const handleBookEvent = async (event) => {
    setFeedback({ type: "", text: "" });
    navigate("/book-venue", { state: { eventId: event.id } });
  };

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">Browse Events</h1>
        <p className="dash-hero-sub">Search by title or location, then reserve your seat in one click.</p>
      </div>

      <div className="dash-content">
        <section className="panel">
          <form className="filters" onSubmit={handleSearch}>
            <label className="field"><span>Search title</span><input onChange={(e) => setSearch(e.target.value)} placeholder="Try Tech Summit" type="text" value={search} /></label>
            <label className="field"><span>Location</span><input onChange={(e) => setLocation(e.target.value)} placeholder="Try Kathmandu" type="text" value={location} /></label>
            <div className="filters__actions">
              <button className="button" type="submit">Search</button>
              <button className="button button-secondary" onClick={handleClear} type="button">Clear</button>
            </div>
          </form>
        </section>

        {feedback.text ? (
          <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>{feedback.text}</p>
        ) : null}

        {loading ? (
          <section className="panel"><p>Loading events...</p></section>
        ) : events.length === 0 ? (
          <section className="empty-state"><h3>No events found</h3><p>Try a different search or clear the filters.</p></section>
        ) : (
          <section className="event-grid">
            {events.map((event) => (
              <EventCard alreadyBooked={bookedEventIds.has(event.id)} event={event} isBooking={false} key={event.id} onBook={handleBookEvent} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default Events;
