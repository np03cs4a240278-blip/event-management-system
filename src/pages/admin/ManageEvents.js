<<<<<<< HEAD
=======
<<<<<<< HEAD
import { useState } from "react"

function ManageEvents(){

const [events,setEvents] = useState([])
const [name,setName] = useState("")

const addEvent = () => {

const newEvent={
id:Date.now(),
name
}

setEvents([...events,newEvent])
setName("")

}

const deleteEvent = (id)=>{
setEvents(events.filter(e=>e.id!==id))
}

return(

<div style={{padding:"30px"}}>

<h2>Manage Events</h2>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Event name"
/>

<button onClick={addEvent}>Add</button>

<ul>

{events.map(event=>(
<li key={event.id}>

{event.name}

<button onClick={()=>deleteEvent(event.id)}>
Delete
</button>

</li>
))}

</ul>

</div>

)

}

export default ManageEvents
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import API from "../../services/api";
import { getErrorMessage } from "../../utils/apiError";
import { formatDate, formatPrice } from "../../utils/formatters";

<<<<<<< HEAD
const emptyForm = { title: "", description: "", date: "", location: "", price: "", image: "" };
=======
const emptyForm = {
  title: "",
  description: "",
  date: "",
  location: "",
  price: "",
  image: "",
};
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const loadEvents = async () => {
    setLoading(true);
<<<<<<< HEAD
=======

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    try {
      const response = await API.get("/events");
      setEvents(response.data.events ?? []);
    } catch (requestError) {
<<<<<<< HEAD
      setFeedback({ type: "error", text: getErrorMessage(requestError, "Could not load events.") });
=======
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Could not load events."),
      });
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  useEffect(() => { loadEvents(); }, []);

  const handleChange = (field) => (event) => setForm((c) => ({ ...c, [field]: event.target.value }));
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", text: "" });
    const payload = { ...form, title: form.title.trim(), description: form.description.trim(), location: form.location.trim(), image: form.image.trim(), price: Number(form.price) };
=======
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

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    try {
      if (editingId) {
        await API.put(`/events/${editingId}`, payload);
        setFeedback({ type: "success", text: "Event updated successfully." });
      } else {
        await API.post("/events", payload);
        setFeedback({ type: "success", text: "Event created successfully." });
      }
<<<<<<< HEAD
      resetForm();
      await loadEvents();
    } catch (requestError) {
      setFeedback({ type: "error", text: getErrorMessage(requestError, "Could not save the event.") });
=======

      resetForm();
      await loadEvents();
    } catch (requestError) {
      setFeedback({
        type: "error",
        text: getErrorMessage(requestError, "Could not save the event."),
      });
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
<<<<<<< HEAD
    setForm({ title: event.title, description: event.description, date: event.date, location: event.location, price: String(event.price), image: event.image || "" });
=======
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      price: String(event.price),
      image: event.image || "",
    });
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    setFeedback({ type: "", text: "" });
  };

  const handleDelete = async (eventId) => {
<<<<<<< HEAD
    if (!window.confirm("Delete this event? Any bookings linked to it will also be removed.")) return;
    setFeedback({ type: "", text: "" });
    try {
      await API.delete(`/events/${eventId}`);
      setFeedback({ type: "success", text: "Event deleted successfully." });
      if (editingId === eventId) resetForm();
      await loadEvents();
    } catch (requestError) {
      setFeedback({ type: "error", text: getErrorMessage(requestError, "Could not delete the event.") });
=======
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
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
    }
  };

  return (
<<<<<<< HEAD
    <AppShell subtitle="Create new listings, revise existing details, or remove outdated events." title="Manage Events">
      {feedback.text ? (
        <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>{feedback.text}</p>
=======
    <AppShell
      subtitle="Create new listings, revise existing details, or remove outdated events."
      title="Manage Events"
    >
      {feedback.text ? (
        <p className={`message ${feedback.type === "error" ? "message-error" : "message-success"}`}>
          {feedback.text}
        </p>
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
      ) : null}

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingId ? "Editing event" : "Create event"}</p>
            <h2>{editingId ? "Update event details" : "Publish a new event"}</h2>
          </div>
<<<<<<< HEAD
          {editingId ? <button className="button button-secondary" onClick={resetForm} type="button">Cancel edit</button> : null}
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field field-span-2"><span>Title</span><input onChange={handleChange("title")} required type="text" value={form.title} /></label>
          <label className="field field-span-2"><span>Description</span><textarea onChange={handleChange("description")} required rows="4" value={form.description} /></label>
          <label className="field"><span>Date</span><input onChange={handleChange("date")} required type="date" value={form.date} /></label>
          <label className="field"><span>Location</span><input onChange={handleChange("location")} required type="text" value={form.location} /></label>
          <label className="field"><span>Price</span><input min="0" onChange={handleChange("price")} required step="0.01" type="number" value={form.price} /></label>
          <label className="field"><span>Image URL</span><input onChange={handleChange("image")} placeholder="https://example.com/event.jpg" type="url" value={form.image} /></label>
          <div className="form-actions field-span-2">
            <button className="button" disabled={submitting} type="submit">{submitting ? "Saving..." : editingId ? "Update Event" : "Create Event"}</button>
=======

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
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
<<<<<<< HEAD
          <div><p className="eyebrow">Published catalog</p><h2>Current events</h2></div>
          <span className="pill">{events.length} total</span>
        </div>
        {loading ? <p>Loading events...</p> : events.length === 0 ? (
          <div className="empty-state"><h3>No events published yet</h3><p>Create your first event using the form above.</p></div>
=======
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
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
<<<<<<< HEAD
                <div className="row-actions">
                  <button className="button button-secondary" onClick={() => handleEdit(event)} type="button">Edit</button>
                  <button className="button button-danger" onClick={() => handleDelete(event.id)} type="button">Delete</button>
=======

                <div className="row-actions">
                  <button className="button button-secondary" onClick={() => handleEdit(event)} type="button">
                    Edit
                  </button>

                  <button className="button button-danger" onClick={() => handleDelete(event.id)} type="button">
                    Delete
                  </button>
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
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
<<<<<<< HEAD
=======
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
