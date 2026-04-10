import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";

function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, bookings: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadStats = async () => {
      try {
        const [eventsResponse, bookingsResponse] = await Promise.all([
          API.get("/events"),
          API.get("/all-bookings"),
        ]);

        if (isActive) {
          setStats({
            events: eventsResponse.data.events?.length ?? 0,
            bookings: bookingsResponse.data.bookings?.length ?? 0,
          });
        }
      } catch (requestError) {
        if (isActive) {
          setError(getErrorMessage(requestError, "Could not load admin dashboard stats."));
        }
      }
    };

    loadStats();
    return () => { isActive = false; };
  }, []);

  return (
    <AppShell subtitle="Manage your catalog, review booking activity, and keep the MVP healthy." title="Admin Dashboard">
      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">Published events</span>
          <strong>{stats.events}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">Total bookings</span>
          <strong>{stats.bookings}</strong>
        </article>
      </section>

      {error ? <p className="message message-error">{error}</p> : null}

      <section className="card-grid">
        <article className="panel">
          <p className="eyebrow">Catalog</p>
          <h3>Manage events</h3>
          <p>Create, update, and remove event listings from one admin screen.</p>
          <Link className="button-link" to="/admin/events">Open event manager</Link>
        </article>
        <article className="panel">
          <p className="eyebrow">Operations</p>
          <h3>Review bookings</h3>
          <p>See which users booked which events and when they reserved them.</p>
          <Link className="button-link" to="/admin/bookings">View all bookings</Link>
        </article>
      </section>
    </AppShell>
  );
}

export default AdminDashboard;
