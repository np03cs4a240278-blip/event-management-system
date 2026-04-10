import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import { formatDate, formatPrice } from "../utils/formatters";

function getWorkspaceRoute(user) {
  if (!user) {
    return "/login";
  }

  if (user.must_change_password) {
    return "/profile";
  }

  return user.role === "admin" ? "/admin/dashboard" : "/events";
}

function LandingPage() {
  const { user, loading } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadEvents = async () => {
      try {
        const response = await API.get("/events");

        if (isActive) {
          setEvents((response.data.events ?? []).slice(0, 3));
        }
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError, "Could not load featured events."));
        }
      }
    };

    loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-topbar">
        <Link className="landing-brand" to="/">
          <span className="landing-brand__badge">EMS</span>
          <span>
            <strong>Event Management</strong>
            <small>Plan. Promote. Fill every seat.</small>
          </span>
        </Link>

        <nav className="landing-nav">
          <a href="#featured-events">Events</a>
          <a href="#how-it-works">How it works</a>
          <a href="#admin-tools">Admin tools</a>
          <Link className="button button-secondary landing-nav__button" to="/login">
            Log in
          </Link>
          <Link className="button landing-nav__button" to="/signup">
            Get started
          </Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <p className="eyebrow">Live event operations</p>
            <h1>Launch polished event pages and manage bookings from one place.</h1>
            <p className="landing-hero__text">
              Give attendees a clear path from discovery to booking while your team keeps events,
              schedules, and registrations under control.
            </p>

            <div className="landing-actions">
              <Link className="button landing-cta" to={loading ? "/login" : getWorkspaceRoute(user)}>
                {user ? "Open workspace" : "Start exploring"}
              </Link>
              <Link className="button button-secondary landing-cta" to="/signup">
                Create account
              </Link>
            </div>

            <div className="landing-proof">
              <div className="landing-proof__item">
                <strong>One dashboard</strong>
                <span>Track events, users, and bookings together.</span>
              </div>
              <div className="landing-proof__item">
                <strong>Built-in roles</strong>
                <span>Separate attendee and admin experiences cleanly.</span>
              </div>
              <div className="landing-proof__item">
                <strong>Quick launch</strong>
                <span>Works with your React frontend and PHP API already in place.</span>
              </div>
            </div>
          </div>

          <div className="landing-hero__visual">
            <article className="landing-showcase landing-showcase--primary">
              <p className="eyebrow">Booking snapshot</p>
              <h2>Make discovery feel immediate</h2>
              <p>
                Highlight upcoming events, surface locations and pricing, and drive people straight
                into your booking flow.
              </p>

              <div className="landing-showcase__stats">
                <div>
                  <span>Featured events</span>
                  <strong>{events.length || 3}</strong>
                </div>
                <div>
                  <span>User roles</span>
                  <strong>2</strong>
                </div>
                <div>
                  <span>Booking flow</span>
                  <strong>Fast</strong>
                </div>
              </div>
            </article>

            <article className="landing-showcase landing-showcase--secondary">
              <p className="landing-mini-label">Admin preview</p>
              <ul className="landing-checklist">
                <li>Create and update events</li>
                <li>Review attendee bookings</li>
                <li>Keep sessions and roles organized</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="landing-strip" id="how-it-works">
          <article className="landing-strip__card">
            <span>01</span>
            <h3>Publish upcoming events</h3>
            <p>Show dates, venues, pricing, and details in one consistent format.</p>
          </article>

          <article className="landing-strip__card">
            <span>02</span>
            <h3>Let users book in minutes</h3>
            <p>Authenticated users can browse listings and reserve spots without friction.</p>
          </article>

          <article className="landing-strip__card" id="admin-tools">
            <span>03</span>
            <h3>Manage everything centrally</h3>
            <p>Admins can handle events and bookings from a dedicated workspace.</p>
          </article>
        </section>

        <section className="landing-section" id="featured-events">
          <div className="landing-section__heading">
            <div>
              <p className="eyebrow">Featured now</p>
              <h2>Upcoming events your visitors can see right away</h2>
            </div>
            <Link className="button button-secondary" to={user ? "/events" : "/login"}>
              {user ? "See all events" : "Login to book"}
            </Link>
          </div>

          {error ? <p className="message message-error">{error}</p> : null}

          <div className="landing-event-grid">
            {events.map((event) => (
              <article className="landing-event-card" key={event.id}>
                <img alt={event.title} className="landing-event-card__image" src={event.image} />
                <div className="landing-event-card__content">
                  <div className="landing-event-card__meta">
                    <span>{formatDate(event.date)}</span>
                    <span>{formatPrice(event.price)}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="landing-event-card__footer">
                    <span>{event.location}</span>
                    <Link to={user ? "/events" : "/login"}>{user ? "Book now" : "View access"}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-banner">
          <div>
            <p className="eyebrow">Ready to launch</p>
            <h2>Turn your current app into a full public-facing event experience.</h2>
          </div>

          <div className="landing-actions">
            <Link className="button landing-cta" to="/signup">
              Create account
            </Link>
            <Link className="button button-secondary landing-cta" to="/login">
              Admin login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
