// Navbar.js — Shared navigation bar for dashboard pages

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import myLogo from "../assets/mylogo.png";
import "./theme.css";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const links = isAdmin
    ? [{ to: "/admin-dashboard", label: "Dashboard" }]
    : [
        { to: "/user-dashboard", label: "Dashboard" },
        { to: "/events", label: "Events" },
        { to: "/bookings", label: "My Bookings" },
        { to: "/profile", label: "Profile" },
      ];

  const handleLogout = async () => {
    await logout(); // calls /api/logout on the backend
    navigate("/login");
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 200 }}>

      <nav className="app-navbar theme-header">
        <div className="app-navbar-brand" onClick={() => navigate("/")}>
          <img src={myLogo} alt="Event Management System" style={{ height: 44, width: "auto", display: "block" }} />
        </div>

        {/* Desktop links */}
        <div className="app-navbar-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
          <span className={`theme-badge ${user?.role}`}>
            {user?.role === "admin" ? "Admin" : "User"}
          </span>
          <span className="app-nav-username">{user?.name}</span>
          <button className="app-nav-logout" onClick={handleLogout}>Logout</button>
        </div>

        {/* Hamburger for mobile */}
        <button className="app-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="app-mobile-menu">
          <div className="app-mobile-user">
            Logged in as: <strong>{user?.name}</strong>{" "}
            <span className={`theme-badge ${user?.role}`}>{user?.role}</span>
          </div>
          {links.map((link) => (
            <button
              key={link.to}
              className="app-mobile-link"
              onClick={() => {
                setMenuOpen(false);
                navigate(link.to);
              }}
            >
              {link.label}
            </button>
          ))}
          <button className="app-mobile-link" onClick={() => { setMenuOpen(false); navigate("/"); }}>Home</button>
          <button className="app-mobile-link app-mobile-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}

    </div>
  );
}
