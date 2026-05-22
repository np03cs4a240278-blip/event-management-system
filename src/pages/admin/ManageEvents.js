import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Tag,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

const empty = {
  title: "", category: "General", description: "", date: "", location: "",
  price: "", capacity: "", image: "",
};

const categoryOptions = [
  "General",
  "Technology",
  "Business",
  "Design",
  "Music",
  "Food",
  "Wedding",
  "Career",
  "Charity",
  "Education",
  "Sports",
  "Community",
];

function ManageEvents() {
  const [events, setEvents]       = useState([]);
  const [form, setForm]           = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback]   = useState({ type: "", text: "" });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get("/events");
      setEvents(res.data.events ?? []);
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Could not load events.") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const resetForm = () => { setForm(empty); setEditingId(null); setShowForm(false); };

  const validate = () => {
    if (!form.title.trim())       return "Title is required.";
    if (!form.category.trim())    return "Category is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.date)               return "Date is required.";
    if (!form.location.trim())    return "Location is required.";
    if (form.price === "")        return "Price is required.";
    if (Number(form.price) < 0)   return "Price cannot be negative.";
    if (form.capacity !== "" && Number(form.capacity) < 1) return "Capacity must be at least 1.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFeedback({ type: "error", text: err }); return; }

    setSubmitting(true);
    setFeedback({ type: "", text: "" });

    const payload = {
      title:       form.title.trim(),
      category:    form.category.trim(),
      description: form.description.trim(),
      date:        form.date,
      location:    form.location.trim(),
      price:       Math.max(0, Number(form.price)),
      image:       form.image.trim(),
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
      await loadEvents();
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Could not save event.") });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title, category: ev.category || "General", description: ev.description, date: ev.date,
      location: ev.location, price: String(ev.price),
      capacity: ev.capacity ? String(ev.capacity) : "",
      image: ev.image || "",
    });
    setShowForm(true);
    setFeedback({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event? All bookings linked to it will also be removed.")) return;
    setFeedback({ type: "", text: "" });
    try {
      await API.delete(`/events/${id}`);
      setFeedback({ type: "success", text: "Event deleted." });
      if (editingId === id) resetForm();
      await loadEvents();
    } catch (err) {
      setFeedback({ type: "error", text: getErrorMessage(err, "Could not delete event.") });
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell subtitle="Publish new events, update details, or remove outdated listings." title="Manage Events">

      {feedback.text ? (
        <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {feedback.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          {feedback.text}
        </p>
      ) : null}

      {/* ── Add / Edit form toggle ── */}
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? "Editing event" : "New event"}</p>
            <h2>{editingId ? "Update event details" : "Add a new event"}</h2>
          </div>
          <div className="row-actions">
            {!showForm && !editingId ? (
              <button className="button" onClick={() => setShowForm(true)} type="button"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Plus size={15} />
                Add Event
              </button>
            ) : null}
            {(showForm || editingId) ? (
              <button className="button button-secondary" onClick={resetForm} type="button">Cancel</button>
            ) : null}
          </div>
        </div>

        {(showForm || editingId) ? (
          <form className="form-grid" onSubmit={handleSubmit} noValidate>

            {/* Row 1 */}
            <label className="field field-span-2">
              <span>Event Title *</span>
              <input onChange={set("title")} placeholder="e.g. Tech Summit 2026" required type="text" value={form.title} />
            </label>

            {/* Row 2 */}
            <label className="field">
              <span>Category *</span>
              <select onChange={set("category")} required value={form.category}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Location *</span>
              <input onChange={set("location")} placeholder="e.g. Kathmandu" required type="text" value={form.location} />
            </label>

            {/* Row 3 */}
            <label className="field field-span-2">
              <span>Description *</span>
              <textarea onChange={set("description")} placeholder="Describe the event in detail..." required rows={4} value={form.description} />
            </label>

            {/* Row 4 */}
            <label className="field">
              <span>Event Date *</span>
              <input min={today} onChange={set("date")} required type="date" value={form.date} />
            </label>

            <label className="field">
              <span>Ticket Price (Rs.) *</span>
              <input
                min="0"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || Number(v) >= 0) set("price")(e);
                }}
                onBlur={(e) => {
                  if (Number(e.target.value) < 0) setForm((f) => ({ ...f, price: "0" }));
                }}
                placeholder="0 for free"
                required
                step="0.01"
                type="number"
                value={form.price}
              />
            </label>

            <label className="field">
              <span>Max Capacity (optional)</span>
              <input
                min="1"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || Number(v) >= 1) set("capacity")(e);
                }}
                placeholder="e.g. 500"
                step="1"
                type="number"
                value={form.capacity}
              />
            </label>

            {/* Row 5 */}
            <label className="field field-span-2">
              <span>Event Photo URL</span>
              <input
                onChange={set("image")}
                placeholder="https://images.unsplash.com/..."
                type="url"
                value={form.image}
              />
              {form.image ? (
                <img
                  alt="preview"
                  src={form.image}
                  style={{ marginTop: 8, height: 120, width: "100%", objectFit: "cover", borderRadius: 10 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : null}
            </label>

            <div className="form-actions field-span-2">
              <button className="button" disabled={submitting} type="submit"
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                {submitting ? "Saving..." : editingId
                  ? <><Edit3 size={14} /> Update Event</>
                  : <><Plus size={14} /> Publish Event</>}
              </button>
              <button className="button button-secondary" onClick={resetForm} type="button">Cancel</button>
            </div>

          </form>
        ) : null}
      </section>

      {/* ── Events list ── */}
      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">Published catalog</p><h2>All Events</h2></div>
          <span className="pill">{events.length} total</span>
        </div>

        {loading ? <p>Loading events...</p> : events.length === 0 ? (
          <div className="empty-state">
            <h3>No events yet</h3>
            <p>Click "Add Event" above to publish your first event.</p>
          </div>
        ) : (
          <div className="admin-event-list">
            {events.map((ev) => (
              <article className="admin-event-row" key={ev.id}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  {ev.image ? (
                    <img
                      alt={ev.title}
                      src={ev.image}
                      style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />
                  ) : null}
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{ev.title}</h3>
                    <p style={{ margin: "0 0 6px", color: "var(--muted)", fontSize: "0.88rem" }}>{ev.description}</p>
                    <div className="booking-card__meta">
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <CalendarDays size={12} />{formatDate(ev.date)}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Tag size={12} />{ev.category || "General"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={12} />{ev.location}
                      </span>
                      <span>{formatPrice(ev.price)}</span>
                      <span className={`role-badge ${ev.date >= today ? "role-badge--user" : "role-badge--admin"}`}>
                        {ev.date >= today ? "Active" : "Past"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="row-actions">
                  <button className="button button-secondary" onClick={() => handleEdit(ev)} type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Edit3 size={13} />
                    Edit
                  </button>
                  <button className="button button-danger" onClick={() => handleDelete(ev.id)} type="button"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    </AppShell>
  );
}

export default ManageEvents;
