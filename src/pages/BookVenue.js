// BookVenue.js — Book an event
// Uses Ant Design DatePicker for date selection
// Sends POST /api/bookings with { event_id } to the PHP backend

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DatePicker, Select, Button, Card, Typography, Divider, message, Row, Col } from "antd";
import { EnvironmentOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { getErrorMessage } from "../utils/apiError";

const { Text } = Typography;

export default function BookVenue() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [events, setEvents]               = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookedIds, setBookedIds]         = useState(new Set());
  const [selectedDate, setSelectedDate]   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  // Load all events and user's existing bookings
  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsRes, bookingsRes] = await Promise.all([
          API.get("/events"),
          API.get("/my-bookings"),
        ]);
        const loadedEvents = eventsRes.data.events ?? [];
        setEvents(loadedEvents);

        // Track which event IDs the user already booked
        const ids = new Set((bookingsRes.data.bookings ?? []).map((b) => b.event.id));
        setBookedIds(ids);

        // Pre-select event if coming from dashboard "Book Now" button
        if (location.state?.eventId) {
          const pre = loadedEvents.find((e) => e.id === location.state.eventId);
          if (pre) setSelectedEvent(pre);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Could not load events."));
      }
    };
    loadData();
  }, [location.state]);

  // Submit booking — POST /api/bookings
  const handleBook = async () => {
    if (!selectedEvent) { message.warning("Please select an event."); return; }
    if (bookedIds.has(selectedEvent.id)) { message.warning("You already booked this event."); return; }

    setLoading(true);
    setError("");

    try {
      await API.post("/bookings", { event_id: selectedEvent.id });
      message.success(`Booking confirmed for "${selectedEvent.title}"!`);
      navigate("/user-dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Booking failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const alreadyBooked = selectedEvent && bookedIds.has(selectedEvent.id);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FD" }}>
      <Navbar />

      {/* Page header */}
      <div style={{ background: "linear-gradient(135deg, #FBCFE8, #A5B4FC)", padding: "32px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E1B4B", margin: "0 0 6px" }}>Book an Event</h1>
        <p style={{ fontSize: 14, color: "#4B5563", margin: 0 }}>Select an event and confirm your booking</p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "10px 14px", borderRadius: 8, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <Row gutter={[24, 24]}>

          {/* LEFT: Event selector + date */}
          <Col xs={24} lg={14}>
            <Card style={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(165,180,252,0.15)" }}>

              {/* Event selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>
                  Select Event *
                </label>
                <Select
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Choose an event"
                  value={selectedEvent?.id ?? undefined}
                  onChange={(id) => setSelectedEvent(events.find((e) => e.id === id) || null)}
                  showSearch
                  optionFilterProp="children"
                >
                  {events.map((ev) => (
                    <Select.Option key={ev.id} value={ev.id}>
                      {ev.title} — {ev.location} (Rs. {Number(ev.price).toLocaleString()})
                      {bookedIds.has(ev.id) ? " ✓ Booked" : ""}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Ant Design DatePicker — for reference/preference only (actual date is from the event) */}
              {/* See: https://ant.design/components/date-picker */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#4B5563", display: "block", marginBottom: 6 }}>
                  Preferred Date (optional)
                </label>
                <DatePicker
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Select your preferred date"
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  disabledDate={(d) => d && d < dayjs().startOf("day")}
                />
              </div>

              {/* Already booked warning */}
              {alreadyBooked && (
                <div style={{ background: "#FEF3C7", color: "#92400E", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
                  You have already booked this event.
                </div>
              )}

              {/* Book button */}
              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                disabled={!selectedEvent || alreadyBooked}
                icon={<CheckCircleOutlined />}
                onClick={handleBook}
                style={{ background: "#A5B4FC", borderColor: "#A5B4FC", color: "#1E1B4B", fontWeight: 700, height: 46 }}
              >
                {alreadyBooked ? "Already Booked" : "Confirm Booking"}
              </Button>

            </Card>
          </Col>

          {/* RIGHT: Booking summary */}
          <Col xs={24} lg={10}>
            <Card
              style={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(165,180,252,0.15)", position: "sticky", top: 80 }}
              title={<span style={{ color: "#1E1B4B", fontWeight: 700 }}>Booking Summary</span>}
            >
              {selectedEvent ? (
                <>
                  <Text strong style={{ fontSize: 17, color: "#1E1B4B", display: "block" }}>
                    {selectedEvent.title}
                  </Text>
                  <div style={{ margin: "6px 0 10px", color: "#6B7280", fontSize: 13 }}>
                    <EnvironmentOutlined style={{ color: "#A5B4FC" }} /> {selectedEvent.location}
                  </div>
                  <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>{selectedEvent.description}</p>
                  <Divider style={{ margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ color: "#4B5563" }}>Event Date:</Text>
                    <Text>{selectedEvent.date}</Text>
                  </div>
                  {selectedDate && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ color: "#4B5563" }}>Your Preferred Date:</Text>
                      <Text>{selectedDate.format("YYYY-MM-DD")}</Text>
                    </div>
                  )}
                  <Divider style={{ margin: "12px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text strong style={{ fontSize: 16 }}>Price:</Text>
                    <Text strong style={{ fontSize: 16, color: "#818CF8" }}>
                      Rs. {Number(selectedEvent.price).toLocaleString()}
                    </Text>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 32, color: "#9CA3AF" }}>
                  <CalendarOutlined style={{ fontSize: 40, marginBottom: 10 }} />
                  <br />
                  <Text type="secondary">Select an event to see summary</Text>
                </div>
              )}
            </Card>
          </Col>

        </Row>
      </div>
    </div>
  );
}
