// BookVenue.js — Multi-step booking form with live price calculation

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  Alert, Button, Card, Col, DatePicker, Divider,
  Form, Input, InputNumber, Row, Select, message,
} from "antd";
import dayjs from "dayjs";
import API from "../services/api";
import { getErrorMessage } from "../utils/apiError";
import { formatPrice } from "../utils/formatters";
import Navbar from "./Navbar";
import "./theme.css";
import "./DashboardShared.css";

const formatFormDate = (value) =>
  value?.format ? value.format("YYYY-MM-DD") : value || "";

const eventTypes = [
  "Bratabandha", "Wedding", "Corporate Event", "Birthday Celebration", "Conference",
];

const packagesByType = {
  Bratabandha: [
    { label: "Classic Bratabandha Package", price: 50000 },
    { label: "Family Celebration Package",  price: 85000 },
  ],
  Wedding: [
    { label: "Wedding Package",       price: 250000 },
    { label: "Grand Wedding Package", price: 420000 },
  ],
  "Corporate Event": [
    { label: "Corporate Event Package",    price: 120000 },
    { label: "Executive Business Package", price: 180000 },
  ],
  "Birthday Celebration": [
    { label: "Birthday Package",         price: 50000 },
    { label: "Premium Birthday Package", price: 85000 },
  ],
  Conference: [
    { label: "Conference Package", price: 150000 },
    { label: "Summit Package",     price: 220000 },
  ],
};

const timeSlots = ["Morning", "Afternoon", "Evening", "Full Day"];

const extraServices = [
  { id: "decorations", name: "Decorations",               price: 15000 },
  { id: "catering",    name: "Catering",                  price: 50000 },
  { id: "dj",          name: "DJ & Music",                price: 20000 },
  { id: "photography", name: "Photography & Videography", price: 25000 },
  { id: "makeup",      name: "Makeup & Beauty",           price: 10000 },
  { id: "host",        name: "Event Host (MC)",           price: 8000  },
  { id: "other",       name: "Other Services",            price: 12000 },
];

const GUEST_PRICE = 200;

export default function BookVenue() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form]   = Form.useForm();

  const [events, setEvents]                     = useState([]);
  const [bookedIds, setBookedIds]               = useState(new Set());
  const [selectedEvent, setSelectedEvent]       = useState(null);
  const [selectedType, setSelectedType]         = useState("Bratabandha");
  const [selectedPackage, setSelectedPackage]   = useState(null);
  const [guestCount, setGuestCount]             = useState(10);
  const [selectedServices, setSelectedServices] = useState([]);
  const [specialRequest, setSpecialRequest]     = useState("");
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState("");

  // Load events and already-booked IDs on mount
  useEffect(() => {
    let isActive = true;
    const loadData = async () => {
      try {
        const [eventsResponse, bookingsResponse] = await Promise.all([
          API.get("/events"),
          API.get("/my-bookings"),
        ]);
        if (!isActive) return;

        const loadedEvents = eventsResponse.data.events ?? [];
        const ids = new Set(
          (bookingsResponse.data.bookings ?? [])
            .map((booking) => booking.event?.id)
            .filter(Boolean)
        );
        setEvents(loadedEvents);
        setBookedIds(ids);

        // Pre-select event if navigated from Events page
        const presetEvent = location.state?.eventId
          ? loadedEvents.find((event) => event.id === location.state.eventId)
          : loadedEvents[0];

        if (presetEvent) {
          setSelectedEvent(presetEvent);
          form.setFieldValue("eventId", presetEvent.id);
        }
      } catch (requestError) {
        if (isActive) setError(getErrorMessage(requestError, "Could not load booking options."));
      }
    };
    loadData();
    return () => { isActive = false; };
  }, [form, location.state]);

  // Reset package when event type changes
  useEffect(() => {
    const defaultPackage = packagesByType[selectedType]?.[0] ?? null;
    setSelectedPackage(defaultPackage);
    form.setFieldsValue({
      eventType:    selectedType,
      eventPackage: defaultPackage?.label,
    });
  }, [selectedType, form]);

  useEffect(() => {
    form.setFieldValue("guestCount", guestCount);
  }, [form, guestCount]);

  // Live price calculation
  const guestCost   = guestCount * GUEST_PRICE;
  const packageCost = selectedPackage?.price ?? 0;
  const extrasCost  = selectedServices.reduce((total, id) => {
    const service = extraServices.find((item) => item.id === id);
    return total + (service?.price ?? 0);
  }, 0);
  const totalPrice = (Number(selectedEvent?.price) || 0) + guestCost + packageCost + extrasCost;

  const availablePackages    = useMemo(() => packagesByType[selectedType] ?? [], [selectedType]);
  const selectedServiceItems = extraServices.filter((s) => selectedServices.includes(s.id));
  const alreadyBooked        = selectedEvent ? bookedIds.has(selectedEvent.id) : false;

  const handleEventChange = (eventId) => {
    setSelectedEvent(events.find((item) => item.id === eventId) || null);
  };

  const toggleService = (serviceId) => {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  };

  const handleSubmit = async (values) => {
    if (!selectedEvent) { message.warning("Please select a venue."); return; }
    if (alreadyBooked)  { message.warning("You already booked this event."); return; }

    setLoading(true);
    setError("");
    try {
      await API.post("/bookings", {
        event_id:        selectedEvent.id,
        event_type:      values.eventType || selectedType,
        package_name:    selectedPackage?.label || values.eventPackage || "",
        start_date:      formatFormDate(values.startDate),
        end_date:        formatFormDate(values.endDate),
        event_date:      formatFormDate(values.eventDate),
        time_slot:       values.timeSlot || "",
        guest_count:     guestCount,
        special_request: specialRequest.trim(),
        extra_services:  selectedServiceItems.map((service) => ({
          id: service.id, name: service.name, price: service.price,
        })),
        package_price:   packageCost,
        guest_price:     guestCost,
        services_price:  extrasCost,
        total_price:     totalPrice,
      });
      setBookedIds((current) => new Set([...current, selectedEvent.id]));
      message.success(`Booking confirmed for "${selectedEvent.title}".`);
      navigate("/bookings", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Booking failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-page">
      <Navbar />

      <div className="dash-hero theme-header">
        <h1 className="dash-hero-title">Book a Venue</h1>
        <p className="dash-hero-sub">Select your event setup, add optional services, and confirm your booking.</p>
      </div>

      <div className="dash-content">
        {error ? <Alert message={error} showIcon style={{ borderRadius: 16, marginBottom: 20 }} type="error" /> : null}

        <section className="booking-layout">

          {/* LEFT: Main form */}
          <Card className="booking-card booking-card--form">
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <div className="booking-card__section">

                <Form.Item label="Event Type *" name="eventType" rules={[{ required: true, message: "Please select an event type." }]}>
                  <Select onChange={setSelectedType} options={eventTypes.map((type) => ({ label: type, value: type }))} value={selectedType} />
                </Form.Item>

                <div className="booking-grid booking-grid--2">
                  <Form.Item label="Event Start Date *" name="startDate" rules={[{ required: true, message: "Please select a start date." }]}>
                    <DatePicker disabledDate={(date) => date && date < dayjs().startOf("day")} format="MM/DD/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label="Event End Date *" name="endDate" rules={[{ required: true, message: "Please select an end date." }]}>
                    <DatePicker disabledDate={(date) => date && date < dayjs().startOf("day")} format="MM/DD/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                </div>

                <Form.Item label="Select Venue *" name="eventId" rules={[{ required: true, message: "Please choose a venue." }]}>
                  <Select
                    onChange={handleEventChange}
                    options={events.map((event) => ({
                      label: `${event.title} — ${event.location} (${formatPrice(event.price)})`,
                      value: event.id,
                    }))}
                    placeholder="Choose a venue"
                    showSearch
                  />
                </Form.Item>

                <Form.Item label="Event Package *" name="eventPackage" rules={[{ required: true, message: "Please choose a package." }]}>
                  <Select
                    onChange={(label) => setSelectedPackage(availablePackages.find((item) => item.label === label) || null)}
                    options={availablePackages.map((item) => ({ label: `${item.label} (${formatPrice(item.price)})`, value: item.label }))}
                    placeholder="Choose a package"
                  />
                </Form.Item>

                <div className="booking-grid booking-grid--2">
                  <Form.Item label="Event Date *" name="eventDate" rules={[{ required: true, message: "Please select an event date." }]}>
                    <DatePicker disabledDate={(date) => date && date < dayjs().startOf("day")} format="MM/DD/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label="Time Slot" name="timeSlot">
                    <Select options={timeSlots.map((slot) => ({ label: slot, value: slot }))} placeholder="Choose time slot" />
                  </Form.Item>
                </div>

                <Form.Item label="Number of Guests *" name="guestCount" rules={[{ required: true, message: "Please enter the number of guests." }]}>
                  <InputNumber min={1} onChange={(value) => setGuestCount(value || 1)} style={{ width: "100%" }} value={guestCount} />
                </Form.Item>

                <Form.Item label="Special Request" name="specialRequest">
                  <Input.TextArea
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Decoration style, food preference, stage setup, or any special request..."
                    rows={4}
                    value={specialRequest}
                  />
                </Form.Item>

                <div className="booking-note">
                  <span>{guestCount} guests × {formatPrice(GUEST_PRICE)}</span>
                  <strong>Guest Cost: {formatPrice(guestCost)}</strong>
                </div>
              </div>

              <Button
                block className="booking-submit"
                disabled={!selectedEvent || alreadyBooked}
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                loading={loading}
                type="primary"
              >
                {alreadyBooked ? "Already Booked" : "Confirm Booking"}
              </Button>
            </Form>
          </Card>

          {/* RIGHT: Summary sidebar */}
          <div className="booking-sidebar">
            <Card className="booking-card" title="Booking Summary">
              {selectedEvent ? (
                <div className="booking-summary">
                  <strong className="booking-summary__title">{selectedEvent.title}</strong>
                  <span className="booking-summary__meta"><EnvironmentOutlined /> {selectedEvent.location}</span>
                  <Divider />
                  <div className="booking-summary__row"><span>Venue Price:</span><strong>{formatPrice(selectedEvent.price)}</strong></div>
                  <div className="booking-summary__row"><span>Guest Cost ({guestCount} × {formatPrice(GUEST_PRICE)}):</span><strong>{formatPrice(guestCost)}</strong></div>
                  {selectedPackage ? (
                    <div className="booking-summary__row"><span>{selectedPackage.label}:</span><strong>{formatPrice(selectedPackage.price)}</strong></div>
                  ) : null}
                  {selectedServiceItems.length ? (
                    <>
                      <Divider />
                      <span className="booking-summary__label">Extra Services:</span>
                      {selectedServiceItems.map((service) => (
                        <div className="booking-summary__row" key={service.id}>
                          <span>{service.name}</span><strong>{formatPrice(service.price)}</strong>
                        </div>
                      ))}
                    </>
                  ) : null}
                  {specialRequest.trim() ? (
                    <><Divider /><span className="booking-summary__label">Special Request:</span><p className="booking-summary__request">{specialRequest}</p></>
                  ) : null}
                  <Divider />
                  <div className="booking-summary__row booking-summary__row--total">
                    <span>Grand Total:</span><strong>{formatPrice(totalPrice)}</strong>
                  </div>
                </div>
              ) : (
                <p>Select a venue to view the booking summary.</p>
              )}
            </Card>

            <Card className="booking-card" title="Available Packages">
              <div className="booking-package-list">
                {availablePackages.map((item) => (
                  <div className="booking-summary__row" key={item.label}>
                    <span>{item.label}</span><strong>{formatPrice(item.price)}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Extra Services */}
        <Card className="booking-card booking-card--services" title="Extra Services (Optional)">
          <p className="booking-services__copy">Customize your event by adding extra services. All are optional.</p>
          <Row gutter={[16, 16]}>
            {extraServices.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              return (
                <Col key={service.id} lg={8} md={12} xs={24}>
                  <button
                    className={`booking-service${isSelected ? " is-selected" : ""}`}
                    onClick={() => toggleService(service.id)}
                    type="button"
                  >
                    <div>
                      <strong>{service.name}</strong>
                      <span>{formatPrice(service.price)}</span>
                    </div>
                    <small>{isSelected ? "Added ✓" : "Optional"}</small>
                  </button>
                </Col>
              );
            })}
          </Row>
          <div className="booking-services__footer">
            <span>{selectedServices.length} service(s) selected</span>
            <strong>+ {formatPrice(extrasCost)}</strong>
          </div>
        </Card>
      </div>
    </div>
  );
}
