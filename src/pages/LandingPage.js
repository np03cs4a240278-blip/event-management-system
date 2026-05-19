import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Calendar, Ticket, Users, BarChart } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/apiError";
import { formatDate, formatPrice } from "../utils/formatters";

function getWorkspaceRoute(user) {
  if (!user) return "/login";
  return user.role === "admin" ? "/admin/dashboard" : "/user-dashboard";
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
      {/* ==================== HEADER ==================== */}
      <header className="landing-topbar">
        <Link className="landing-brand" to="/">
          <span className="landing-brand__badge">EMS</span>
          <div>
            <strong>Event Management System</strong>
            <small>Plan • Promote • Fill Every Seat</small>
          </div>
        </Link>

        <nav className="landing-nav">
          <a href="#featured-events">Events</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#features">Features</a>
          <Link className="button button-secondary" to="/login">
            Log in
          </Link>
          <Link className="button button-primary" to="/signup">
            Get Started Free
          </Link>
        </nav>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="landing-hero">
        <div className="landing-hero__content">
          <div className="landing-hero__copy">
            <p className="eyebrow">Modern Event Operations</p>
            <h1>
              Beautiful event pages.<br />
              Powerful management.<br />
              <span className="highlight">All in one place.</span>
            </h1>
            <p className="landing-hero__text">
              Create stunning public event pages, manage bookings, and give your attendees 
              a seamless experience — while keeping full control from your admin workspace.
            </p>

            <div className="landing-actions">
              <Link 
                className="button button-primary landing-cta" 
                to={loading ? "/login" : getWorkspaceRoute(user)}
              >
                {user ? "Open My Workspace" : "Start Exploring"}
              </Link>
              <Link className="button button-secondary landing-cta" to="/signup">
                Create Free Account
              </Link>
            </div>

            <div className="landing-proof">
              <div className="landing-proof__item">
                <strong>One Dashboard</strong>
                <span>Events, bookings &amp; users in perfect sync</span>
              </div>
              <div className="landing-proof__item">
                <strong>Role-Based Access</strong>
                <span>Clean separation between attendees and admins</span>
              </div>
              <div className="landing-proof__item">
                <strong>Ready to Launch</strong>
                <span>Works with your existing React + PHP stack</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="landing-hero__visual">
            <div className="landing-showcase landing-showcase--primary">
              <p className="eyebrow">Live Preview</p>
              <h2>Discovery that converts</h2>
              <p>Beautiful event cards with dates, pricing, and instant booking flow.</p>

              <div className="landing-showcase__stats">
                <div>
                  <span>Featured Events</span>
                  <strong>{events.length || 3}</strong>
                </div>
                <div>
                  <span>Roles</span>
                  <strong>2</strong>
                </div>
                <div>
                  <span>Booking Speed</span>
                  <strong>Lightning Fast</strong>
                </div>
              </div>
            </div>

            <div className="landing-showcase landing-showcase--secondary">
              <p className="landing-mini-label">Admin Control</p>
              <ul className="landing-checklist">
                <li>✦ Create &amp; edit events instantly</li>
                <li>✦ Manage all bookings in real-time</li>
                <li>✦ Organize sessions and attendee roles</li>
                <li>✦ Export reports with one click</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="landing-strip" id="how-it-works">
        <h2 className="section-title">Three steps to a successful event</h2>
        <div className="landing-strip__cards">
          <article className="landing-strip__card">
            <div className="step-number">01</div>
            <h3>Publish Beautiful Events</h3>
            <p>Show dates, venues, pricing, and rich descriptions in a clean, professional layout.</p>
          </article>

          <article className="landing-strip__card">
            <div className="step-number">02</div>
            <h3>Frictionless Booking</h3>
            <p>Attendees can browse and reserve seats in under a minute with secure authentication.</p>
          </article>

          <article className="landing-strip__card">
            <div className="step-number">03</div>
            <h3>Centralized Management</h3>
            <p>Admins control everything from one powerful dashboard.</p>
          </article>
        </div>
      </section>

      {/* ==================== NEW: FEATURES SECTION ==================== */}
      <section className="landing-section" id="features">
        <div className="landing-section__heading">
          <div>
            <p className="eyebrow">Powerful Features</p>
            <h2>Everything you need to run great events</h2>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Calendar size={32} /></div>
            <h3>Event Scheduling</h3>
            <p>Multiple sessions, recurring events, and flexible timing options.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Ticket size={32} /></div>
            <h3>Smart Ticketing</h3>
            <p>Early bird pricing, promo codes, and capacity management.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Users size={32} /></div>
            <h3>Attendee Management</h3>
            <p>Track registrations, send reminders, and manage waitlists.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><BarChart size={32} /></div>
            <h3>Analytics Dashboard</h3>
            <p>Real-time insights on ticket sales and attendee engagement.</p>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED EVENTS ==================== */}
      <section className="landing-section" id="featured-events">
        <div className="landing-section__heading">
          <div>
            <p className="eyebrow">Happening Soon</p>
            <h2>Featured Events</h2>
          </div>
          <Link 
            className="button button-secondary" 
            to={user ? "/events" : "/login"}
          >
            {user ? "Browse All Events" : "Login to Book"}
          </Link>
        </div>

        {error && <p className="message message-error">{error}</p>}

        <div className="landing-event-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <article className="landing-event-card" key={event.id}>
                <img 
                  alt={event.title} 
                  className="landing-event-card__image" 
                  src={event.image || "/placeholder-event.jpg"} 
                />
                <div className="landing-event-card__content">
                  <div className="landing-event-card__meta">
                    <span>{formatDate(event.date)}</span>
                    <span className="price">{formatPrice(event.price)}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p className="description">{event.description}</p>
                  <div className="landing-event-card__footer">
                    <span className="location">{event.location}</span>
                    <Link 
                      to={user ? `/events/${event.id}` : "/login"} 
                      className="book-link"
                    >
                      {user ? "Book Now →" : "View Details"}
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="no-events">No featured events available at the moment.</p>
          )}
        </div>
      </section>

      {/* ==================== NEW: TESTIMONIAL / SOCIAL PROOF SECTION ==================== */}
      <section className="landing-testimonial">
        <div className="testimonial-container">
          <p className="quote">
            “EMS transformed how we run our workshops. 
            The booking experience is smooth, and managing everything from one dashboard saves us hours every week.”
          </p>
          <div className="testimonial-author">
            <strong>Sarah K.</strong>
            <span>Event Coordinator, TechMeet Nepal</span>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="landing-banner">
        <div className="banner-content">
          <p className="eyebrow">Ready to get started?</p>
          <h2>Turn your idea into a professional event experience today.</h2>

          <div className="landing-actions">
            <Link className="button button-primary landing-cta" to="/signup">
              Create Your Account
            </Link>
            <Link className="button button-secondary landing-cta" to="/login">
              Admin Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
