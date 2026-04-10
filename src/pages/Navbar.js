// Navbar.js — Shared navigation bar for dashboard pages

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
<<<<<<< HEAD
import myLogo from "../assets/mylogo.png";
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import "./theme.css";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout(); // calls /api/logout on the backend
    navigate("/login");
  };

  const goToDashboard = () => {
    setMenuOpen(false);
    navigate(user?.role === "admin" ? "/admin-dashboard" : "/user-dashboard");
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 200 }}>

      <nav className="app-navbar theme-header">
        <div className="app-navbar-brand" onClick={() => navigate("/")}>
<<<<<<< HEAD
          <img src={myLogo} alt="Event Management System" style={{ height: 44, width: "auto", display: "block" }} />
=======
          EVENT MANAGEMENT SYSTEM
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
        </div>

        {/* Desktop links */}
        <div className="app-navbar-links">
          <span className="app-nav-link" onClick={goToDashboard}>Dashboard</span>
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
          <button className="app-mobile-link" onClick={goToDashboard}>Dashboard</button>
          <button className="app-mobile-link" onClick={() => { setMenuOpen(false); navigate("/"); }}>Home</button>
          <button className="app-mobile-link app-mobile-logout" onClick={handleLogout}>Logout</button>
        </div>
      )}

    </div>
  );
}
