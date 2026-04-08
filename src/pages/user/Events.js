<<<<<<< HEAD
import { useState } from "react"
import EventCard from "../../components/EventCard"

function Events(){

const [events] = useState([
{
id:1,
name:"Wedding Event",
date:"12 June",
location:"New York"
},
{
id:2,
name:"Birthday Party",
date:"18 July",
location:"Los Angeles"
},
{
id:3,
name:"Corporate Event",
date:"25 August",
location:"Chicago"
}
])

const bookEvent = (event)=>{
alert("Booked: " + event.name)
}

return(

<div style={{padding:"30px"}}>

<h2>Available Events</h2>

<div style={{display:"flex",gap:"20px"}}>

{events.map(event=>(
<EventCard
key={event.id}
event={event}
bookEvent={bookEvent}
/>
))}

</div>

</div>

)

}

export default Events
=======
import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import EventCard from "../../components/EventCard";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";

function buildFilters(search, location) {
  const params = {};

  if (search.trim()) {
    params.search = search.trim();
  }

  if (location.trim()) {
    params.location = location.trim();
  }

  return params;
}

async function fetchEventData(search, location) {
  const [eventsResponse, bookingsResponse] = await Promise.all([
    API.get("/events", {
      params: buildFilters(search, location),
    }),
    API.get("/my-bookings"),
  ]);

  return {
    events: eventsResponse.data.events ?? [],
    bookedIds: new Set((bookingsResponse.data.bookings ?? []).map((booking) => booking.event.id)),
  };
}

function Events() {
  const [events, setEvents] = useState([]);
  const [bookedEventIds, setBookedEventIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadEvents = async (nextSearch = search, nextLocation = location) => {
    setLoading(true);
    setFeedback({ type: "", text: "" });

    try {
      const { events: loadedEvents, bookedIds } = await fetchEventData(nextSearch, nextLocation);
      setEvents(loadedEvents);
      setBookedEventIds(bookedIds);
    } catch (requestError) {
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Could not load events."),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadInitialEvents = async () => {
      setLoading(true);
      setFeedback({ type: "", text: "" });

      try {
        const { events: loadedEvents, bookedIds } = await fetchEventData("", "");

        if (isActive) {
          setEvents(loadedEvents);
          setBookedEventIds(bookedIds);
        }
      } catch (requestError) {
        if (isActive) {
          setFeedback({
            type: "error",
            text: getErrorMessage(requestError, "Could not load events."),
          });
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadInitialEvents();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadEvents(search, location);
  };

  const handleClear = async () => {
    setSearch("");
    setLocation("");
    await loadEvents("", "");
  };

  const handleBookEvent = async (event) => {
    setBookingId(event.id);
    setFeedback({ type: "", text: "" });

    try {
      await API.post("/bookings", { event_id: event.id });
      setBookedEventIds((currentIds) => new Set([...currentIds, event.id]));
      setFeedback({
        type: "success",
        text: `Your booking for "${event.title}" is confirmed.`,
      });
    } catch (requestError) {
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Booking failed."),
      });
    } finally {
      setBookingId(null);
    }
  };

  return (
    <AppShell
      subtitle="Search by title or location, then reserve your seat in one click."
      title="Browse Events"
    >
      <section className="panel">
        <form className="filters" onSubmit={handleSearch}>
          <label className="field">
            <span>Search title</span>
            <input
              onChange={(inputEvent) => setSearch(inputEvent.target.value)}
              placeholder="Try Tech Summit"
              type="text"
              value={search}
            />
          </label>

          <label className="field">
            <span>Location</span>
            <input
              onChange={(inputEvent) => setLocation(inputEvent.target.value)}
              placeholder="Try Kathmandu"
              type="text"
              value={location}
            />
          </label>

          <div className="filters__actions">
            <button className="button" type="submit">
              Search
            </button>

            <button className="button button-secondary" onClick={handleClear} type="button">
              Clear
            </button>
          </div>
        </form>
      </section>

      {feedback.text ? (
        <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? (
        <section className="panel">
          <p>Loading events...</p>
        </section>
      ) : events.length === 0 ? (
        <section className="empty-state">
          <h3>No events found</h3>
          <p>Try a different search or clear the filters to see every event.</p>
        </section>
      ) : (
        <section className="event-grid">
          {events.map((event) => (
            <EventCard
              alreadyBooked={bookedEventIds.has(event.id)}
              event={event}
              isBooking={bookingId === event.id}
              key={event.id}
              onBook={handleBookEvent}
            />
          ))}
        </section>
      )}
    </AppShell>
  );
}

export default Events;
>>>>>>> Backend
