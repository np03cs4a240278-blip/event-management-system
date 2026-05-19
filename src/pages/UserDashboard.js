// UserDashboard.js — Main user dashboard with stats, recommendations, events, bookings
// Uses lucide-react icons throughout

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  BookMarked,
  CheckCircle,
  Sparkles,
  MapPin,
  Tag,
  Clock,
  Users,
  TrendingUp,
  Star,
  RefreshCw,
  Search,
  Ticket,
  UserCircle,
  LayoutDashboard,
  Package,
} from "lucide-react";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { getErrorMessage } from "../utils/apiError";
import { formatDate, formatPrice } from "../utils/formatters";
import "./theme.css";
import "./DashboardShared.css";

const REFRESH_INTERVAL_MS = 45000;

// ── Status pill with icon ──────────────────────────────────────────────────
function StatusPill({ status }) {
  const s = (status || "pending").toLowerCase();
  const config = {
    pending:   { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
    confirmed: { bg: "#D1FAE5", color: "#065F46", label: "Confirmed" },
    cancelled: { bg: "#FEE2E2", color: "#B91C1C", label: "Cancelled" },
  };
  const c = config[s] || config.pending;
  return (
    <span style={{ background: c.bg, color: c.color, display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
      {c.label}
    </span>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return undefined; }
    let start = 0;
    const step = Math.ceil(value / 20);
    const timer = window.setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); window.clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => window.clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

// ── Confidence badge ──────────────────────────────────────────────────────
function ConfidenceBadge({ confidence }) {
  const tone = {
    high:    { background: "#D1FAE5", color: "#065F46", label: "High match" },
    medium:  { background: "#DBEAFE", color: "#1D4ED8", label: "Good match" },
    low:     { background: "#F3F4F6", color: "#4B5563", label: "Worth a look" },
    explore: { background: "#FCE7F3", color: "#9D174D", label: "Explore" },
  }[confidence] || { background: "#F3F4F6", color: "#4B5563", label: "Suggested" };
  return (
    <span className="dash-confidence-badge" style={{ background: tone.background, color: tone.color }}>
      {tone.label}
    </span>
  );
}

// ── Insight group ─────────────────────────────────────────────────────────
function InsightGroup({ items, title, emptyLabel = "No signals yet." }) {
  return (
    <div>
      <div className="dash-insight-title">{title}</div>
      {items?.length ? (
        <div className="dash-chip-list">
          {items.map((item) => (
            <span className="dash-chip" key={item.name}>
              {item.name}{item.count ? ` (${item.count})` : ""}
            </span>
          ))}
        </div>
      ) : (
        <p className="dash-insight-empty">{emptyLabel}</p>
      )}
    </div>
  );
}

// ── Recommendation card ───────────────────────────────────────────────────
function RecommendationCard({ event, onBook }) {
  return (
    <article className="dash-recommend-card theme-card">
      {event.image ? (
        <img alt={event.title} className="dash-recommend-card__image"
          onError={(e) => { e.target.style.display = "none"; }} src={event.image} />
      ) : null}

      <div className="dash-recommend-card__top">
        <span className="dash-category-badge">{event.category || "General"}</span>
        <ConfidenceBadge confidence={event.recommendation_confidence} />
      </div>

      <h3 className="dash-recommend-card__title">{event.title}</h3>
      <p className="dash-recommend-card__meta">
        <CalendarDays size={12} style={{ marginRight: 3 }} />
        {formatDate(event.date)}
        <span style={{ margin: "0 4px" }}>·</span>
        <MapPin size={12} style={{ marginRight: 3 }} />
        {event.location}
      </p>
      <p className="dash-recommend-card__price">{formatPrice(event.price)}</p>

      {event.recommendation_reasons?.length ? (
        <div className="dash-chip-list dash-chip-list--reasons">
          {event.recommendation_reasons.map((reason) => (
            <span className="dash-chip dash-chip--reason" key={reason}>{reason}</span>
          ))}
        </div>
      ) : null}

      <div className="dash-recommend-card__footer">
        <div className="dash-recommend-card__stats">
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Star size={11} />
            Score {Number(event.recommendation_score || 0).toFixed(1)}
          </span>
          {event.popularity_count > 0 ? (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Users size={11} />
              {event.popularity_count} booking(s)
            </span>
          ) : null}
        </div>
        <button className="theme-btn dash-book-btn" onClick={() => onBook(event.id)} type="button"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Ticket size={14} />
          Book This Event
        </button>
      </div>
    </article>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    let isActive = true;
    const loadData = async ({ silent = false } = {}) => {
      if (!isActive) return;
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const [eventsRes, bookingsRes, recsRes] = await Promise.all([
          API.get("/events"),
          API.get("/my-bookings"),
          API.get("/recommendations"),
        ]);
        if (!isActive) return;
        setEvents(eventsRes.data.events ?? []);
        setBookings(bookingsRes.data.bookings ?? []);
        setRecommendations(recsRes.data.recommendations ?? []);
        setProfile(recsRes.data.profile ?? null);
        setError("");
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch (requestError) {
        if (isActive) setError(getErrorMessage(requestError, "Could not load dashboard data."));
      } finally {
        if (isActive) { setLoading(false); setRefreshing(false); }
      }
    };
    loadData();
    const intervalId = window.setInterval(() => loadData({ silent: true }), REFRESH_INTERVAL_MS);
    const handleFocus = () => loadData({ silent: true });
    window.addEventListener("focus", handleFocus);
    return () => { isActive = false; window.clearInterval(intervalId); window.removeEventListener("focus", handleFocus); };
  }, []);

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const handleBookEvent = (eventId) => navigate("/book-venue", { state: { eventId } });

  return (
    <div className="dash-page">
      <Navbar />

      {/* Hero */}
      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">
          <LayoutDashboard size={22} />
          {greeting}, {user?.name}!
        </h1>
        <p className="dash-hero-sub">Manage your bookings, discover new events, and review AI-powered suggestions.</p>
      </div>

      <div className="dash-content">
        {error ? <div className="message message-error"><span>{error}</span></div> : null}

        {/* Welcome card */}
        <div className="dash-welcome-card">
          <div className="dash-welcome-text">
            <h2>Welcome back, {user?.name}!</h2>
            <p>
              You have <strong>{bookings.length}</strong> booking{bookings.length !== 1 ? "s" : ""} and{" "}
              <strong>{events.length}</strong> event{events.length !== 1 ? "s" : ""} available right now.
            </p>
          </div>
          <div className="dash-welcome-emoji">
            <Sparkles size={40} />
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats-row">
          {[
            { label: "My Bookings",      value: bookings.length,                                                                Icon: BookMarked,  color: "#818CF8" },
            { label: "Available Events", value: events.length,                                                                  Icon: CalendarDays, color: "#0f766e" },
            { label: "Confirmed",        value: bookings.filter((b) => b.status === "confirmed").length,                        Icon: CheckCircle, color: "#065F46" },
            { label: "Recommended",      value: recommendations.length,                                                         Icon: TrendingUp,  color: "#9D174D" },
          ].map(({ label, value, Icon, color }) => (
            <div className="theme-stat-card" key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div className="stat-label">{label}</div>
                <Icon size={18} color={color} />
              </div>
              <div className="stat-number">{loading ? "—" : <AnimatedNumber value={value} />}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="dash-quick-actions">
          {[
            { label: "Browse Events",  Icon: Search,       path: "/events" },
            { label: "Book a Venue",   Icon: Ticket,       path: "/book-venue" },
            { label: "My Bookings",    Icon: BookMarked,   path: "/bookings" },
            { label: "My Profile",     Icon: UserCircle,   path: "/profile" },
          ].map(({ label, Icon, path }) => (
            <button key={path} className="dash-quick-btn" onClick={() => navigate(path)} type="button">
              <Icon size={17} className="dash-quick-btn__icon" />
              {label}
            </button>
          ))}
        </div>

        {/* Recommendations */}
        <div className="dash-section-header">
          <div>
            <h2 className="theme-section-title">
              <TrendingUp size={18} />
              Recommended for You
            </h2>
            <p className="dash-section-subtitle">
              {profile?.profile_summary || "Suggestions are refreshed from your activity and current event catalog."}
            </p>
          </div>
          <button
            className="dash-refresh-btn"
            disabled={loading || refreshing}
            onClick={() => window.dispatchEvent(new Event("focus"))}
            type="button"
          >
            <RefreshCw size={14} />
            {refreshing ? "Refreshing..." : lastUpdated ? `Refresh · ${lastUpdated}` : "Refresh"}
          </button>
        </div>

        <div className="dash-recommend-layout">
          {/* Insights sidebar */}
          <aside className="dash-insights-card theme-card">
            <h3 className="dash-insights-card__title">
              <Star size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Recommendation Profile
            </h3>
            <p className="dash-insights-card__text">
              {profile?.booking_count
                ? `We found ${profile.booking_count} booking signal${profile.booking_count !== 1 ? "s" : ""} to personalize your next picks.`
                : "You have not booked anything yet, so we are starting with trending events."}
            </p>
            <InsightGroup items={profile?.top_categories} title="Top categories" emptyLabel="Book a few events to unlock category preferences." />
            <InsightGroup items={profile?.top_locations} title="Top locations" emptyLabel="Location patterns will appear after your first bookings." />
            <div>
              <div className="dash-insight-title">Favorite keywords</div>
              {profile?.favorite_keywords?.length ? (
                <div className="dash-chip-list">
                  {profile.favorite_keywords.map((kw) => <span className="dash-chip" key={kw}>{kw}</span>)}
                </div>
              ) : (
                <p className="dash-insight-empty">Keyword affinity appears once you build a booking history.</p>
              )}
            </div>
            <div className="dash-budget-box">
              <span className="dash-budget-box__label">Typical budget</span>
              <strong>{profile?.average_budget ? formatPrice(profile.average_budget) : "Flexible"}</strong>
            </div>
          </aside>

          {/* Recommendation cards */}
          <section>
            {loading ? (
              <div className="theme-card dash-empty"><p>Loading personalized recommendations...</p></div>
            ) : recommendations.length === 0 ? (
              <div className="theme-card dash-empty">
                <div className="dash-empty-icon"><TrendingUp size={48} /></div>
                <p>Once you book events, your dashboard will start recommending similar categories, locations, and price ranges.</p>
                <button className="theme-btn" onClick={() => navigate("/events")} type="button"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Search size={15} />
                  Explore Events
                </button>
              </div>
            ) : (
              <div className="dash-recommend-grid">
                {recommendations.map((event) => (
                  <RecommendationCard event={event} key={event.id} onBook={handleBookEvent} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Profile card */}
        <h2 className="theme-section-title">
          <UserCircle size={18} />
          My Profile
        </h2>
        <div className="dash-profile-card theme-card">
          <div className="dash-avatar">{avatarLetter}</div>
          <div>
            <h3 className="dash-profile-name">{user?.name}</h3>
            <p className="dash-profile-detail" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Tag size={12} />
              {user?.email}
            </p>
            <span className="theme-badge user">User</span>
          </div>
        </div>

        {/* Available events */}
        <h2 className="theme-section-title">
          <CalendarDays size={18} />
          Available Events
        </h2>
        {loading ? (
          <div className="theme-card dash-empty"><p>Loading events...</p></div>
        ) : events.length === 0 ? (
          <div className="theme-card dash-empty">
            <div className="dash-empty-icon"><CalendarDays size={48} /></div>
            <p>No events available right now.</p>
          </div>
        ) : (
          <div className="dash-venues-grid">
            {events.map((event) => (
              <div className="dash-venue-card theme-card" key={event.id}>
                {event.image ? (
                  <img alt={event.title} className="dash-venue-img"
                    onError={(e) => { e.target.style.display = "none"; }} src={event.image} />
                ) : null}
                <div className="dash-venue-header">
                  <div className="dash-venue-name">{event.title}</div>
                  <span className="dash-category-badge">{event.category || "General"}</span>
                </div>
                <div className="dash-venue-location">
                  <MapPin size={12} />
                  {event.location}
                </div>
                <div className="dash-venue-location">
                  <CalendarDays size={12} />
                  {formatDate(event.date)}
                </div>
                <div className="dash-venue-price">{formatPrice(event.price)}</div>
                <button className="theme-btn dash-book-btn" onClick={() => handleBookEvent(event.id)} type="button"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Ticket size={14} />
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Recent bookings */}
        <h2 className="theme-section-title" style={{ marginTop: 28 }}>
          <BookMarked size={18} />
          My Recent Bookings
        </h2>
        {loading ? (
          <div className="theme-card dash-empty"><p>Loading bookings...</p></div>
        ) : bookings.length === 0 ? (
          <div className="theme-card dash-empty">
            <div className="dash-empty-icon"><Ticket size={48} /></div>
            <p>Book an event to start building your recommendation profile.</p>
            <button className="theme-btn" onClick={() => navigate("/book-venue")} type="button"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Ticket size={15} />
              Book an Event
            </button>
          </div>
        ) : (
          <div className="dash-bookings-grid">
            {bookings.map((booking) => (
              <div className="dash-booking-card theme-card" key={booking.id}>
                <div className="dash-booking-venue">{booking.event?.title}</div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><Package size={12} /> Category</span>
                  <span>{booking.event?.category || booking.event_type || "General"}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><CalendarDays size={12} /> Date</span>
                  <span>{formatDate(booking.event?.date)}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><MapPin size={12} /> Location</span>
                  <span>{booking.event?.location}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><Users size={12} /> Guests</span>
                  <span>{booking.guest_count || 1}</span>
                </div>
                <div className="dash-booking-row">
                  <span className="dash-booking-label"><Clock size={12} /> Status</span>
                  <StatusPill status={booking.status} />
                </div>
                <div className="dash-booking-total">{formatPrice(booking.total_price || booking.event?.price || 0)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
