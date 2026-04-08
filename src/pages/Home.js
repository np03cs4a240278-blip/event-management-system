// Home.js — Public landing page

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";
import "./theme.css";

export default function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (path) => { setMenuOpen(false); navigate(path); };

  return (
    <div className="home">

      {/* NAVBAR */}
      <header className="home-navbar">
        <div className="home-navbar-brand">EVENT MANAGEMENT SYSTEM</div>
        <nav className="home-navbar-links">
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="home-nav-login">Login</Link>
        </nav>
        <button className="home-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      </header>

      {menuOpen && (
        <div className="home-mobile-menu">
          <a href="#about"    className="home-mobile-link" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#events"   className="home-mobile-link" onClick={() => setMenuOpen(false)}>Events</a>
          <a href="#features" className="home-mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#contact"  className="home-mobile-link" onClick={() => setMenuOpen(false)}>Contact</a>
          <button className="home-mobile-link home-mobile-login" onClick={() => goTo("/login")}>Login</button>
          <button className="home-mobile-link" onClick={() => goTo("/register")}>Register</button>
        </div>
      )}

      {/* HERO */}
      <section className="home-hero" id="home">
        <h1 className="home-hero-title">Welcome to Event Management System</h1>
        <p className="home-hero-desc">
          Browse and book events easily. Simple, fast, and reliable event booking at your fingertips.
        </p>
        <button className="home-hero-btn" onClick={() => navigate("/register")}>Get Started</button>
        <button className="home-hero-btn-outline" onClick={() => navigate("/login")}>Login</button>
      </section>

      {/* ABOUT */}
      <section className="home-section home-section-alt" id="about">
        <h2 className="home-section-title">About Us</h2>
        <p className="home-about-text">
          Event Management System helps you find and book the best events.
          Whether it is a concert, seminar, or corporate event, our platform makes
          booking simple, transparent, and hassle-free.
        </p>
      </section>

      {/* EVENTS */}
      <section className="home-section" id="events">
        <h2 className="home-section-title">Sample Events</h2>
        <p className="home-section-sub">A glimpse of what's available</p>
        <div className="home-cards-grid">
          <div className="home-card"><h3 className="home-card-title">Tech Summit 2025</h3><p className="home-card-date">15 Feb 2025</p><p className="home-card-desc">Annual technology conference. Kathmandu.</p></div>
          <div className="home-card"><h3 className="home-card-title">Music Festival</h3><p className="home-card-date">20 Mar 2025</p><p className="home-card-desc">Live music event. Pokhara.</p></div>
          <div className="home-card"><h3 className="home-card-title">Business Expo</h3><p className="home-card-date">5 Apr 2025</p><p className="home-card-desc">Business networking event. Lalitpur.</p></div>
          <div className="home-card"><h3 className="home-card-title">Cultural Program</h3><p className="home-card-date">10 May 2025</p><p className="home-card-desc">Cultural showcase. Bhaktapur.</p></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-section home-section-alt" id="features">
        <h2 className="home-section-title">Why Choose Us?</h2>
        <p className="home-section-sub">Simple features that make event booking easy</p>
        <div className="home-features-grid">
          <div className="home-feature-card"><span className="home-feature-icon">📅</span><h3>Easy Booking</h3><p>Book any event in a few clicks.</p></div>
          <div className="home-feature-card"><span className="home-feature-icon">🔒</span><h3>Secure Login</h3><p>Your account is safely stored on our server.</p></div>
          <div className="home-feature-card"><span className="home-feature-icon">⚙️</span><h3>Admin Control</h3><p>Admins can create, edit, and delete events.</p></div>
          <div className="home-feature-card"><span className="home-feature-icon">📍</span><h3>Multiple Locations</h3><p>Find events in Kathmandu, Pokhara, and more.</p></div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="home-section" id="contact">
        <h2 className="home-section-title">Contact Us</h2>
        <p className="home-section-sub">Have questions? Send us a message.</p>
        <form className="home-contact-form" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
          <input type="text"  placeholder="Your Name"    className="home-contact-input" required />
          <input type="email" placeholder="Your Email"   className="home-contact-input" required />
          <textarea           placeholder="Your Message" className="home-contact-input" rows={4} required />
          <button type="submit" className="home-contact-btn">Send Message</button>
        </form>
        <div className="home-contact-info">
          <p>info@ems.com</p>
          <p>+977 01-4XXXXXX</p>
          <p>Kathmandu, Nepal</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#contact">Contact</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
        <p className="home-footer-copy">2025 Event Management System. All rights reserved.</p>
      </footer>

    </div>
  );
}
