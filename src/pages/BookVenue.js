<<<<<<< HEAD
// ============================================================
// BookVenue.js — Book an event venue
// NEW: "Extra Services (Optional)" section added below the form.
//      Services are completely separate from venue/package logic.
//      User can select/deselect any service using simple cards.
//      Selected services are added to the total price.
// Theme: #F8F9FD background, gradient header, #A5B4FC primary
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Form, Select, DatePicker,
  Button, Card, Typography,
  Divider, message, Alert, Row, Col,
} from "antd";
import {
  EnvironmentOutlined, CalendarOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
=======
// BookVenue.js — Book an event
// Uses Ant Design DatePicker for date selection
// Sends POST /api/bookings with { event_id } to the PHP backend

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DatePicker, Select, Button, Card, Typography, Divider, message, Row, Col } from "antd";
import { EnvironmentOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import dayjs from "dayjs";

import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
<<<<<<< HEAD
import { initialVenues, packages, timeSlots } from "../data/venues";

const { Text } = Typography;

// ── EVENT TYPE OPTIONS ──
// Simple list of event types shown in the dropdown
const EVENT_TYPES = [
  "Wedding",
  "Birthday Party",
  "Anniversary",
  "Engagement",
  "Pasni",
  "Baby Shower",
  "Bratabandha",
  "Corporate Event",
  "Conference",
  "Seminar",
  "Reception",
  "Private Party",
  "Proposal Event",
];

// ── GUEST PRICING RULE ──
// Every guest costs Rs. 200
// Total guest cost = numberOfGuests × PRICE_PER_GUEST
const PRICE_PER_GUEST = 200;

// ── EXTRA SERVICES LIST ──
// Each service has: id, name, price (NPR)
// This list is completely separate from venues and packages.
const EXTRA_SERVICES = [
  { id: "decorations",   name: "Decorations",                  price: 15000 },
  { id: "catering",      name: "Catering",                     price: 50000 },
  { id: "dj_music",      name: "DJ & Music",                   price: 20000 },
  { id: "photography",   name: "Photography & Videography",    price: 25000 },
  { id: "makeup",        name: "Makeup & Beauty",              price: 10000 },
  { id: "mc",            name: "Event Host (MC)",              price: 8000  },
  { id: "other",         name: "Other Services (Lighting, Vehicles, etc.)", price: 12000 },
];

=======
import API from "../services/api";
import { getErrorMessage } from "../utils/apiError";

const { Text } = Typography;

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
export default function BookVenue() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

<<<<<<< HEAD
  const [form] = Form.useForm();

  // Venue and package state
  const [venues, setVenues]                   = useState([]);
  const [selectedVenue, setSelectedVenue]     = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [conflict, setConflict]               = useState(false);
  const [loading, setLoading]                 = useState(false);

  // ── EVENT TYPE STATE ──
  // Stores the selected event type from the dropdown
  const [eventType, setEventType] = useState("");

  // ── EVENT DATE RANGE STATE ──
  // Stores start and end dates as plain strings (YYYY-MM-DD)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  // ── EXTRA SERVICES STATE ──
  // selectedServices is an array of service IDs the user has checked.
  // Example: ["decorations", "dj_music"]
  const [selectedServices, setSelectedServices] = useState([]);

  // ── NUMBER OF GUESTS STATE ──
  // Stores how many guests the user enters.
  // Guest cost = numberOfGuests × PRICE_PER_GUEST (Rs. 200 each)
  const [numberOfGuests, setNumberOfGuests] = useState(0);

  // Load venues from localStorage on page load
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ne_venues") || "[]");
    const v = stored.length ? stored : initialVenues;
    setVenues(v);

    // Pre-select venue if user clicked "Book Now" from dashboard
    if (location.state?.venueId) {
      const pre = v.find((x) => x.id === location.state.venueId);
      if (pre) {
        setSelectedVenue(pre);
        form.setFieldValue("venueId", pre.id);
      }
    }
  }, [location.state, form]);

  // Check if the same venue + date + slot is already booked
  const checkConflict = (venueId, date, slot) => {
    if (!venueId || !date || !slot) { setConflict(false); return; }
    const bookings = JSON.parse(localStorage.getItem("ne_bookings") || "[]");
    const dateStr  = date.format("YYYY-MM-DD");
    const clash    = bookings.find(
      (b) => b.venueId === venueId && b.date === dateStr && b.timeSlot === slot
    );
    setConflict(!!clash);
  };

  // Update selected venue/package when form values change
  const onValuesChange = (_, all) => {
    if (all.venueId)  setSelectedVenue(venues.find((x) => x.id === all.venueId) || null);
    if (all.package)  setSelectedPackage(packages.find((x) => x.id === all.package) || null);
    checkConflict(all.venueId, all.date, all.timeSlot);
  };

  // ── TOGGLE EXTRA SERVICE ──
  // If service is already selected → remove it
  // If not selected → add it
  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId) // remove
        : [...prev, serviceId]                  // add
    );
  };

  // ── PRICE CALCULATIONS ──

  // 1. Venue price + package price
  const venueAndPackageTotal = () =>
    (selectedVenue?.price || 0) + (selectedPackage?.price || 0);

  // 2. Guest cost = number of guests × Rs. 200 per guest
  const guestCost = () => numberOfGuests * PRICE_PER_GUEST;

  // 3. Sum of all selected extra services
  const servicesTotal = () =>
    selectedServices.reduce((sum, id) => {
      const service = EXTRA_SERVICES.find((s) => s.id === id);
      return sum + (service?.price || 0);
    }, 0);

  // 4. Grand total = venue + package + guest cost + extra services
  const grandTotal = () =>
    venueAndPackageTotal() + guestCost() + servicesTotal();

  // Submit booking
  const onFinish = (values) => {
    if (conflict) {
      message.error("Slot already booked! Choose another date or time.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const venue = venues.find((v) => v.id === values.venueId);
      const pkg   = packages.find((p) => p.id === values.package);
      const slot  = timeSlots.find((s) => s.id === values.timeSlot);

      // Get full service objects for the selected service IDs
      const chosenServices = EXTRA_SERVICES.filter((s) =>
        selectedServices.includes(s.id)
      );

      const booking = {
        id:            "BK" + Date.now(),
        userId:        user?.id,
        userEmail:     user?.email,
        userName:      user?.name,
        venueId:       values.venueId,
        venueName:     venue?.name,
        location:      venue?.location,
        // Event type selected by user
        eventType:     eventType || "Not specified",
        // Event date range
        startDate:     startDate || values.date.format("YYYY-MM-DD"),
        endDate:       endDate   || values.date.format("YYYY-MM-DD"),
        date:          values.date.format("YYYY-MM-DD"),
        timeSlot:      values.timeSlot,
        timeSlotLabel: slot?.label,
        package:       values.package,
        packageName:   pkg?.name,
        guests:        numberOfGuests,
        guestCost:     guestCost(),       // Rs. 200 × number of guests
        extraServices: chosenServices,
        totalPrice:    grandTotal(),
        bookedAt:      new Date().toISOString(),
      };

      const bookings = JSON.parse(localStorage.getItem("ne_bookings") || "[]");
      bookings.push(booking);
      localStorage.setItem("ne_bookings", JSON.stringify(bookings));
      message.success(`Booking confirmed! ID: ${booking.id}`);
      setLoading(false);
      navigate("/user-dashboard");
    }, 1000);
  };

=======
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

>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FD" }}>
      <Navbar />

<<<<<<< HEAD
      {/* Page header — theme gradient */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Book a Venue</h1>
        <p style={styles.pageSub}>Select your venue, date, package, and extra services</p>
      </div>

      <div style={styles.container}>
        <Row gutter={[24, 24]}>

          {/* ── LEFT COLUMN: Form + Extra Services ── */}
          <Col xs={24} lg={14}>

            {/* ── BOOKING FORM CARD ── */}
            <Card style={styles.card}>

              {/* Conflict warning */}
              {conflict && (
                <Alert
                  message="Slot Already Booked"
                  description="This venue is booked for the selected date and time. Please choose another."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 20, borderRadius: 8 }}
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={onValuesChange}
                size="large"
              >
                {/* ── EVENT TYPE DROPDOWN ── */}
                {/* Simple select with all event type options */}
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Event Type *</label>
                  <select
                    style={selectStyle}
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                  >
                    <option value="">-- Select Event Type --</option>
                    {/* Map over the EVENT_TYPES list to create options */}
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* ── EVENT DATE RANGE ── */}
                {/* Two date inputs side by side: Start Date and End Date */}
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>Event Start Date *</label>
                      <input
                        type="date"
                        style={dateInputStyle}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        // Disable past dates — min is today
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div style={fieldGroup}>
                      <label style={fieldLabel}>Event End Date *</label>
                      <input
                        type="date"
                        style={dateInputStyle}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        // End date cannot be before start date
                        min={startDate || new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </Col>
                </Row>

                {/* Venue selector */}
                <Form.Item
                  name="venueId"
                  label="Select Venue"
                  rules={[{ required: true, message: "Please select a venue" }]}
                >
                  <Select placeholder="Choose a venue" showSearch optionFilterProp="children">
                    {venues.map((v) => (
                      <Select.Option key={v.id} value={v.id}>
                        {v.name} — {v.location} (Rs. {(v.price || 0).toLocaleString()})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Package selector */}
                <Form.Item
                  name="package"
                  label="Event Package"
                  rules={[{ required: true, message: "Please select a package" }]}
                >
                  <Select placeholder="Choose a package">
                    {packages.map((p) => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.name} — Rs. {p.price.toLocaleString()}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    {/* Ant Design DatePicker — Event Date */}
                    <Form.Item
                      name="date"
                      label="Event Date"
                      rules={[{ required: true, message: "Please select a date" }]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Select event date"
                        disabledDate={(d) => d && d < dayjs().startOf("day")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="timeSlot"
                      label="Time Slot"
                      rules={[{ required: true, message: "Please select a time slot" }]}
                    >
                      <Select placeholder="Choose time slot">
                        {timeSlots.map((s) => (
                          <Select.Option key={s.id} value={s.id}>{s.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* ── NUMBER OF GUESTS + GUEST COST ── */}
                {/* Each guest costs Rs. 200. Price updates in real-time. */}
                <div style={fieldGroup}>
                  <label style={fieldLabel}>Number of Guests *</label>
                  <input
                    type="number"
                    style={dateInputStyle}
                    placeholder="e.g. 200"
                    min={1}
                    max={5000}
                    value={numberOfGuests || ""}
                    onChange={(e) => {
                      // Convert input string to a number (0 if empty)
                      const val = parseInt(e.target.value, 10) || 0;
                      setNumberOfGuests(val);
                    }}
                    required
                  />

                  {/* Show guest cost dynamically as user types */}
                  {numberOfGuests > 0 && (
                    <div style={guestCostBox}>
                      <span style={{ color: "#4B5563" }}>
                        {numberOfGuests} guests × Rs. {PRICE_PER_GUEST}
                      </span>
                      <span style={{ fontWeight: 700, color: "#818CF8" }}>
                        Guest Cost: Rs. {guestCost().toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  disabled={conflict}
                  icon={<CheckCircleOutlined />}
                  style={styles.submitBtn}
                >
                  Confirm Booking
                </Button>
              </Form>
            </Card>

            {/* ══════════════════════════════════════════════
                EXTRA SERVICES SECTION
                Completely separate from venue/package logic.
                User can select or skip any service.
                Each selected service adds to the total price.
                ══════════════════════════════════════════════ */}
            <div style={styles.extraSection}>

              {/* Section heading */}
              <h2 style={styles.extraTitle}>Extra Services (Optional)</h2>
              <p style={styles.extraSub}>
                Customize your event by adding extra services. All are optional.
              </p>

              {/* Service cards grid */}
              <div style={styles.servicesGrid}>
                {EXTRA_SERVICES.map((service) => {
                  // Check if this service is currently selected
                  const isSelected = selectedServices.includes(service.id);

                  return (
                    <div
                      key={service.id}
                      // Click anywhere on the card to toggle selection
                      onClick={() => toggleService(service.id)}
                      style={{
                        ...styles.serviceCard,
                        // Highlight card with theme color when selected
                        border: isSelected
                          ? "2px solid #A5B4FC"
                          : "2px solid #E5E7EB",
                        background: isSelected ? "#EEF2FF" : "#FFFFFF",
                      }}
                    >
                      {/* Checkbox indicator — top right corner */}
                      <div style={styles.serviceCheckbox}>
                        {isSelected ? (
                          // Filled circle when selected
                          <div style={styles.checkboxOn}>&#10003;</div>
                        ) : (
                          // Empty circle when not selected
                          <div style={styles.checkboxOff} />
                        )}
                      </div>

                      {/* Service name */}
                      <div style={styles.serviceName}>{service.name}</div>

                      {/* Service price */}
                      <div style={styles.servicePrice}>
                        Rs. {service.price.toLocaleString()}
                      </div>

                      {/* Selected label */}
                      {isSelected && (
                        <div style={styles.selectedLabel}>Added</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show total of selected services */}
              {selectedServices.length > 0 && (
                <div style={styles.servicesSummary}>
                  <span style={{ color: "#4B5563" }}>
                    {selectedServices.length} service(s) selected
                  </span>
                  <span style={{ fontWeight: 700, color: "#818CF8" }}>
                    + Rs. {servicesTotal().toLocaleString()}
                  </span>
                </div>
              )}

            </div>
            {/* ── END EXTRA SERVICES ── */}

          </Col>

          {/* ── RIGHT COLUMN: Booking Summary ── */}
          <Col xs={24} lg={10}>
            <Card
              style={{ ...styles.card, position: "sticky", top: 80 }}
              title={<span style={{ color: "#1E1B4B", fontWeight: 700 }}>Booking Summary</span>}
            >
              {selectedVenue ? (
                <>
                  {/* Venue name and location */}
                  <Text strong style={{ fontSize: 17, color: "#1E1B4B", display: "block" }}>
                    {selectedVenue.name}
                  </Text>
                  <div style={{ margin: "6px 0 10px", color: "#6B7280", fontSize: 13 }}>
                    <EnvironmentOutlined style={{ color: "#A5B4FC" }} /> {selectedVenue.location}
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  {/* Venue price */}
                  <div style={styles.priceRow}>
                    <Text style={{ color: "#4B5563" }}>Venue Price:</Text>
                    <Text>Rs. {(selectedVenue.price || 0).toLocaleString()}</Text>
                  </div>

                  {/* Package price */}
                  {selectedPackage && (
                    <div style={styles.priceRow}>
                      <Text style={{ color: "#4B5563" }}>{selectedPackage.name}:</Text>
                      <Text>Rs. {selectedPackage.price.toLocaleString()}</Text>
                    </div>
                  )}

                  {/* ── GUEST COST IN SUMMARY ── */}
                  {/* Shows only when user has entered guests */}
                  {numberOfGuests > 0 && (
                    <div style={styles.priceRow}>
                      <Text style={{ color: "#4B5563" }}>
                        Guest Cost ({numberOfGuests} × Rs.{PRICE_PER_GUEST}):
                      </Text>
                      <Text>Rs. {guestCost().toLocaleString()}</Text>
                    </div>
                  )}

                  {/* ── SELECTED EXTRA SERVICES IN SUMMARY ── */}
                  {selectedServices.length > 0 && (
                    <>
                      <Divider style={{ margin: "12px 0" }} />
                      <Text style={{ fontSize: 13, color: "#6B7280", display: "block", marginBottom: 6 }}>
                        Extra Services:
                      </Text>
                      {/* List each selected service with its price */}
                      {EXTRA_SERVICES.filter((s) => selectedServices.includes(s.id)).map((s) => (
                        <div key={s.id} style={styles.priceRow}>
                          <Text style={{ color: "#4B5563", fontSize: 13 }}>{s.name}</Text>
                          <Text style={{ fontSize: 13 }}>Rs. {s.price.toLocaleString()}</Text>
                        </div>
                      ))}
                    </>
                  )}

                  <Divider style={{ margin: "12px 0" }} />

                  {/* Grand total — includes venue + package + services */}
                  <div style={styles.priceRow}>
                    <Text strong style={{ fontSize: 16 }}>Grand Total:</Text>
                    <Text strong style={{ fontSize: 16, color: "#818CF8" }}>
                      Rs. {grandTotal().toLocaleString()}
=======
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
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
                    </Text>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: 32, color: "#9CA3AF" }}>
                  <CalendarOutlined style={{ fontSize: 40, marginBottom: 10 }} />
                  <br />
<<<<<<< HEAD
                  <Text type="secondary">Select a venue to see summary</Text>
                </div>
              )}
            </Card>

            {/* Available packages reference */}
            <Card
              style={{ ...styles.card, marginTop: 16 }}
              title={<span style={{ color: "#1E1B4B", fontWeight: 700 }}>Available Packages</span>}
            >
              {packages.map((p) => (
                <div key={p.id} style={styles.priceRow}>
                  <Text style={{ color: "#4B5563" }}>{p.name}</Text>
                  <Text strong style={{ color: "#818CF8" }}>Rs. {p.price.toLocaleString()}</Text>
                </div>
              ))}
            </Card>
=======
                  <Text type="secondary">Select an event to see summary</Text>
                </div>
              )}
            </Card>
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
          </Col>

        </Row>
      </div>
    </div>
  );
}
<<<<<<< HEAD

// ── STYLES ──
const styles = {
  pageHeader: {
    background: "linear-gradient(135deg, #FBCFE8, #A5B4FC)",
    padding: "32px 32px",
  },
  pageTitle: { fontSize: 24, fontWeight: 700, color: "#1E1B4B", margin: "0 0 6px" },
  pageSub:   { fontSize: 14, color: "#4B5563", margin: 0 },
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 16px" },
  card: {
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(165, 180, 252, 0.15)",
    border: "1px solid #E5E7EB",
  },
  submitBtn: {
    background: "#A5B4FC",
    borderColor: "#A5B4FC",
    color: "#1E1B4B",
    height: 46,
    fontWeight: 700,
    fontSize: 15,
    marginTop: 8,
  },
  priceRow: { display: "flex", justifyContent: "space-between", marginBottom: 8 },

  // ── Extra Services section ──
  extraSection: {
    marginTop: 24,
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 12px rgba(165, 180, 252, 0.15)",
    border: "1px solid #E5E7EB",
  },
  extraTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1E1B4B",
    margin: "0 0 6px",
    paddingBottom: 8,
    borderBottom: "2px solid #A5B4FC", // theme primary underline
  },
  extraSub: { fontSize: 13, color: "#9CA3AF", margin: "0 0 20px" },

  // Grid of service cards — 2 columns on desktop, 1 on mobile
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },

  // Single service card
  serviceCard: {
    borderRadius: 10,
    padding: "14px 16px",
    cursor: "pointer",           // pointer cursor shows it's clickable
    position: "relative",
    transition: "all 0.15s",
    userSelect: "none",          // prevent text selection on click
  },

  // Checkbox circle — top right of card
  serviceCheckbox: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  // Empty circle (not selected)
  checkboxOff: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid #D1D5DB",
    background: "#fff",
  },

  // Filled circle with checkmark (selected)
  checkboxOn: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#A5B4FC",       // theme primary
    color: "#fff",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  // Service name text
  serviceName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1E1B4B",
    marginBottom: 6,
    paddingRight: 24,            // space for checkbox
    lineHeight: 1.4,
  },

  // Service price text
  servicePrice: {
    fontSize: 13,
    fontWeight: 700,
    color: "#818CF8",            // theme primary
  },

  // "Added" label shown when selected
  selectedLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: 700,
    color: "#A5B4FC",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Summary bar below the grid
  servicesSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    padding: "10px 14px",
    background: "#EEF2FF",
    borderRadius: 8,
    fontSize: 14,
  },
};

// ── SHARED FIELD STYLES ──
// Used for Event Type dropdown, date inputs, and guest input
// These match the theme look (same border, radius, padding)

// Wrapper div for each label + input pair
const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
  marginBottom: 16,
};

// Label text above each input
const fieldLabel = {
  fontSize: 13,
  fontWeight: 600,
  color: "#4B5563",
};

// Style for <select> dropdown (Event Type)
const selectStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
  color: "#1E1B4B",
  background: "#fff",
  outline: "none",
  cursor: "pointer",
  boxSizing: "border-box",
};

// Style for <input type="date"> and <input type="number">
const dateInputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
  color: "#1E1B4B",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

// Info box shown below guest input — displays real-time guest cost
const guestCostBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 8,
  padding: "8px 12px",
  background: "#EEF2FF",       // light purple — theme accent
  borderRadius: 8,
  fontSize: 13,
};
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
