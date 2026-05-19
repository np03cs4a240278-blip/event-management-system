// AdminDashboard.js — Legacy admin panel (tab-based)
// Uses lucide-react icons

import { useState, useEffect } from "react";
import {
  CalendarDays, BookMarked, Plus, Edit3, Trash2,
  CheckCircle, AlertCircle, LayoutDashboard,
} from "lucide-react";
import Navbar from "./Navbar";
import API from "../services/api";
import { getErrorMessage } from "../utils/apiError";
import "./theme.css";
import "./DashboardShared.css";
const emptyForm = { title: "", description: "", date: "", location: "", price: "", image: "" };

export default function AdminDashboard() {
  const [events, setEvents]       = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [feedback, setFeedback]   = useState({ type: "", text: "" });
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        API.get("/events"),
        API.get("/all-bookings"),
      ]);
      setEvents(eventsRes.data.events ?? []);
      setBookings(bookingsRes.data.bookings ?? []);
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Could not load data.") });
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: "", text: "" });
    setSubmitting(true);
    const payload = {
      ...form,
      price: Number(form.price),
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
    };
    try {
      if (editingId) {
        await API.put(`/events/${editingId}`, payload);
        setFeedback({ type: "success", text: "Event updated successfully." });
      } else {
        await API.post("/events", payload);
        setFeedback({ type: "success", text: "Event created successfully." });
      }
      resetForm();
      await loadData();
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Could not save event.") });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title, description: event.description,
      date: event.date, location: event.location,
      price: String(event.price), image: event.image || "",
    });
    setShowForm(true);
    setFeedback({ type: "", text: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event? All bookings for it will also be removed.")) return;
    setFeedback({ type: "", text: "" });
    try {
      await API.delete(`/events/${id}`);
      setFeedback({ type: "success", text: "Event deleted." });
      if (editingId === id) resetForm();
      await loadData();
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Could not delete event.") });
    }
  };

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">
          <LayoutDashboard size={22} />
          Admin Dashboard
        </h1>
        <p className="dash-hero-sub">Manage events and view all bookings.</p>
      </div>

      <div className="dash-content">
        {/* Stats */}
        <div className="dash-stats-row">
          <div className="theme-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div className="stat-label">Total Events</div>
              <CalendarDays size={18} color="#818CF8" />
            </div>
            <div className="stat-number">{events.length}</div>
          </div>
          <div className="theme-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div className="stat-label">Total Bookings</div>
              <BookMarked size={18} color="#818CF8" />
            </div>
            <div className="stat-number">{bookings.length}</div>
          </div>
        </div>

        {/* Feedback */}
        {feedback.text && (
          <div className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {feedback.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {feedback.text}
          </div>
        )}

        {/* Tabs */}
        <div className="dash-tabs">
          {[
            { key: "events",   label: "Events",   Icon: CalendarDays },
            { key: "bookings", label: "Bookings", Icon: BookMarked },
          ].map(({ key, label, Icon }) => (
            <button key={key}
              className={`dash-tab-btn ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── EVENTS TAB ── */}
        {activeTab === "events" && (
          <div className="theme-card">
            <div className="dash-tab-header">
              <h2 className="theme-section-title" style={{ margin: 0 }}>
                <CalendarDays size={18} />
                Manage Events ({events.length})
              </h2>
              <button className="theme-btn"
                onClick={() => { resetForm(); setShowForm(!showForm); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Plus size={15} />
                {showForm ? "Cancel" : "Add Event"}
              </button>
            </div>

            {showForm && (
              <form className="dash-add-form" onSubmit={handleSubmit}>
                <div className="dash-form-row">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="theme-input" value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input className="theme-input" value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea className="theme-input" rows={3} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="dash-form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input type="date" className="theme-input" value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (Rs.) *</label>
                    <input type="number" min="0" className="theme-input" value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL (optional)</label>
                  <input type="url" className="theme-input" placeholder="https://example.com/image.jpg"
                    value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                </div>
                <button type="submit" className="theme-btn" disabled={submitting}
                  style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {submitting ? "Saving..." : editingId
                    ? <><Edit3 size={14} /> Update Event</>
                    : <><Plus size={14} /> Create Event</>}
                </button>
              </form>
            )}

            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr><th>Title</th><th>Location</th><th>Date</th><th>Price</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "#9CA3AF", padding: 24 }}>
                      No events yet. Add one above.
                    </td></tr>
                  ) : events.map((ev) => (
                    <tr key={ev.id}>
                      <td>{ev.title}</td>
                      <td>{ev.location}</td>
                      <td>{ev.date}</td>
                      <td>Rs. {Number(ev.price).toLocaleString()}</td>
                      <td>
                        <button className="dash-table-btn edit" onClick={() => startEdit(ev)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Edit3 size={12} /> Edit
                        </button>
                        <button className="dash-table-btn delete" onClick={() => handleDelete(ev.id)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === "bookings" && (
          <div className="theme-card">
            <h2 className="theme-section-title">
              <BookMarked size={18} />
              All Bookings ({bookings.length})
            </h2>
            {bookings.length === 0 ? (
              <div className="dash-empty"><p>No bookings yet.</p></div>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Event</th><th>Location</th><th>Event Date</th><th>Price</th></tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>{b.user?.name}</td>
                        <td>{b.user?.email}</td>
                        <td>{b.event?.title}</td>
                        <td>{b.event?.location}</td>
                        <td>{b.event?.date}</td>
                        <td>Rs. {Number(b.event?.price || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
