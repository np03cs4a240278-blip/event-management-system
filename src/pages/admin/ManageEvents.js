import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  location: "",
  price: "",
  image: "",
};

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadEvents = async () => {
    setLoading(true);

    try {
      const response = await API.get("/events");
      setEvents(response.data.events ?? []);
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
    loadEvents();
  }, []);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const validateForm = () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date.trim() ||
      !form.location.trim() ||
      form.price === ""
    ) {
      return "All fields except image are required.";
    }

    if (form.date < new Date().toISOString().slice(0, 10)) {
      return "Event date cannot be in the past.";
    }

    if (Number.isNaN(Number(form.price))) {
      return "Price must be a valid number.";
    }

    if (Number(form.price) < 0) {
      return "Price cannot be negative.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validateForm();

    if (validationMessage) {
      setFeedback({ type: "error", text: validationMessage });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", text: "" });

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date.trim(),
      location: form.location.trim(),
      image: form.image.trim(),
      price: Number(form.price),
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
    } catch (requestError) {
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Could not save the event."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      price: String(event.price),
      image: event.image || "",
    });
    setFeedback({ type: "", text: "" });
  };

  const handleDelete = async (eventId) => {
    const shouldDelete = window.confirm(
      "Delete this event? Any bookings linked to it will also be removed."
    );

    if (!shouldDelete) {
      return;
    }

    setFeedback({ type: "", text: "" });

    try {
      await API.delete(`/events/${eventId}`);
      setFeedback({ type: "success", text: "Event deleted successfully." });

      if (editingId === eventId) {
        resetForm();
      }

      await loadEvents();
    } catch (requestError) {
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Could not delete the event."),
      });
    }
  };

  return (
    <AppShell
      subtitle="Create new listings, revise existing details, or remove outdated events."
      title="Manage Events"
    >
      {feedback.text ? (
        <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>
          {feedback.text}
        </p>
      ) : null}

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? "Editing event" : "Create event"}</p>
            <h2>{editingId ? "Update event details" : "Publish a new event"}</h2>
          </div>

          {editingId ? (
            <button className="button button-secondary" onClick={resetForm} type="button">
              Cancel edit
            </button>
          ) : null}
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field field-span-2">
            <span>Title</span>
            <input onChange={handleChange("title")} required type="text" value={form.title} />
          </label>

          <label className="field field-span-2">
            <span>Description</span>
            <textarea
              onChange={handleChange("description")}
              required
              rows="4"
              value={form.description}
            />
          </label>

          <label className="field">
            <span>Date</span>
            <input onChange={handleChange("date")} required type="date" value={form.date} />
          </label>

          <label className="field">
            <span>Location</span>
            <input onChange={handleChange("location")} required type="text" value={form.location} />
          </label>

          <label className="field">
            <span>Price</span>
            <input
              min="0"
              onChange={handleChange("price")}
              required
              step="0.01"
              type="number"
              value={form.price}
            />
          </label>

          <label className="field">
            <span>Image URL</span>
            <input
              onChange={handleChange("image")}
              placeholder="https://example.com/event.jpg"
              type="url"
              value={form.image}
            />
          </label>

          <div className="form-actions field-span-2">
            <button className="button" disabled={submitting} type="submit">
              {submitting ? "Saving..." : editingId ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Published catalog</p>
            <h2>Current events</h2>
          </div>
          <span className="pill">{events.length} total</span>
        </div>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <h3>No events published yet</h3>
            <p>Create your first event using the form above.</p>
          </div>
        ) : (
          <div className="admin-event-list">
            {events.map((event) => (
              <article className="admin-event-row" key={event.id}>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="booking-card__meta">
                    <span>{formatDate(event.date)}</span>
                    <span>{event.location}</span>
                    <span>{formatPrice(event.price)}</span>
                  </div>
                </div>

                <div className="row-actions">
                  <button className="button button-secondary" onClick={() => handleEdit(event)} type="button">
                    Edit
                  </button>

                  <button className="button button-danger" onClick={() => handleDelete(event.id)} type="button">
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
