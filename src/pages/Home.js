// Home.js — Public landing page with contact form
// Uses lucide-react icons throughout

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  Lock,
  Settings,
  MapPin,
  Mail,
  Phone,
  Menu,
  X,
  Send,
  LogIn,
  UserPlus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";
import "./Home.css";
import "./theme.css";

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);

  const goTo = (path) => { setMenuOpen(false); navigate(path); };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError("Please fill in your name, email, and message.");
      setContactSuccess("");
      return;
    }
    setSubmittingContact(true);
    setContactError("");
    setContactSuccess("");
    try {
      const res = await API.post("/contact-messages", {
        name:    contactName.trim(),
        email:   contactEmail.trim(),
        message: contactMessage.trim(),
      });
      setContactName("");
      setContactEmail("");
      setContactMessage("");
      setContactSuccess(
        res.data?.message || "Your message has been sent successfully."
      );
    } catch (requestError) {
      // Show the exact backend message so it's easy to debug
      const msg =
        requestError?.response?.data?.message ||
        "Could not send your message. Please check that XAMPP is running.";
      setContactError(msg);
    } finally {
      setSubmittingContact(false);
    }
  };

  return (
    <div className="home">
      {/* ── NAVBAR ── */}
      <header className="home-navbar">
        <div className="home-navbar-brand" onClick={() => navigate("/")}>
          <Sparkles size={20} style={{ marginRight: 6, verticalAlign: "middle" }} />
          EventPro
        </div>
        <nav className="home-navbar-links">
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="home-nav-login">
            <LogIn size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Login
          </Link>
        </nav>
        <button className="home-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {menuOpen && (
        <div className="home-mobile-menu">
          <a href="#about"    className="home-mobile-link" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#events"   className="home-mobile-link" onClick={() => setMenuOpen(false)}>Events</a>
          <a href="#features" className="home-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#contact"  className="home-mobile-link" onClick={() => setMenuOpen(false)}>Contact</a>
          <button className="home-mobile-link home-mobile-login" onClick={() => goTo("/login")}>
            <LogIn size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Login
          </button>
          <button className="home-mobile-link" onClick={() => goTo("/register")}>
            <UserPlus size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Register
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="home-hero" id="home">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, #FBCFE8, #A5B4FC)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(165,180,252,0.3)",
          }}>
            <Sparkles size={32} color="#1E1B4B" />
          </div>
        </div>
        <h1 className="home-hero-title">Welcome to EventPro</h1>
        <p className="home-hero-desc">
          Browse and book events easily. Simple, fast, and reliable event booking at your fingertips.
        </p>
        <div className="home-hero-actions">
          <button className="home-hero-btn" onClick={() => navigate("/register")}>
            <UserPlus size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Get Started
          </button>
          <button className="home-hero-btn-outline" onClick={() => navigate("/login")}>
            <LogIn size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
            Login
          </button>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="home-section home-section-alt" id="about">
        <h2 className="home-section-title">About Us</h2>
        <p className="home-about-text">
          EventPro helps you find and book the best events. Whether it is a concert, seminar, or corporate event,
          our platform makes booking simple, transparent, and hassle-free.
        </p>
      </section>

      {/* ── EVENTS ── */}
      <section className="home-section" id="events">
        <h2 className="home-section-title">Sample Events</h2>
        <p className="home-section-sub">A glimpse of what&apos;s available</p>
        <div className="home-cards-grid">
          {[
            { title: "Tech Summit 2025", date: "15 Feb 2025", desc: "Annual technology conference. Kathmandu." },
            { title: "Music Festival",   date: "20 Mar 2025", desc: "Live music event. Pokhara." },
            { title: "Business Expo",    date: "5 Apr 2025",  desc: "Business networking event. Lalitpur." },
            { title: "Cultural Program", date: "10 May 2025", desc: "Cultural showcase. Bhaktapur." },
          ].map((ev) => (
            <div className="home-card" key={ev.title}>
              <h3 className="home-card-title">{ev.title}</h3>
              <p className="home-card-date" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={13} />
                {ev.date}
              </p>
              <p className="home-card-desc">{ev.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="home-section home-section-alt" id="features">
        <h2 className="home-section-title">Why Choose Us?</h2>
        <p className="home-section-sub">Simple features that make event booking easy</p>
        <div className="home-features-grid">
          {[
            { Icon: Calendar, title: "Easy Booking",       desc: "Book any event in a few clicks." },
            { Icon: Lock,     title: "Secure Login",       desc: "Your account is safely stored on our server." },
            { Icon: Settings, title: "Admin Control",      desc: "Admins can create, edit, and delete events." },
            { Icon: MapPin,   title: "Multiple Locations", desc: "Find events in Kathmandu, Pokhara, and more." },
          ].map(({ Icon, title, desc }) => (
            <div className="home-feature-card" key={title}>
              <span className="home-feature-icon"><Icon size={28} color="#818CF8" /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="home-section" id="contact">
        <h2 className="home-section-title">Contact Us</h2>
        <p className="home-section-sub">Have questions? Send us a message.</p>

        {contactError && (
          <div className="home-contact-message home-contact-message--error" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={15} />
            {contactError}
          </div>
        )}
        {contactSuccess && (
          <div className="home-contact-message home-contact-message--success" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={15} />
            {contactSuccess}
          </div>
        )}

        <form className="home-contact-form" onSubmit={handleContactSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            className="home-contact-input"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="home-contact-input"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Your Message"
            className="home-contact-input"
            rows={4}
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            required
          />
          <button type="submit" className="home-contact-btn" disabled={submittingContact}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Send size={15} />
            {submittingContact ? "Sending..." : "Send Message"}
          </button>
        </form>

        <div className="home-contact-info">
          <p style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Mail size={14} color="#818CF8" />
            np03cs4a240278@heraldcollege.edu.np
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Phone size={14} color="#818CF8" />
            977+ 9825901557
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={14} color="#818CF8" />
            Kathmandu, Nepal
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-footer-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#contact">Contact</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
        <p className="home-footer-copy">
          © 2025 EventPro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
