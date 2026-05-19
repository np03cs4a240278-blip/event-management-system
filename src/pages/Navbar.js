// Navbar.js — Shared navigation bar for dashboard pages (non-AppShell)
// Uses lucide-react icons for a modern, consistent look

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  BookMarked,
  UserCircle,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./theme.css";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  const links = isAdmin
    ? [{ to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard }]
    : [
        { to: "/user-dashboard", label: "Dashboard",  Icon: LayoutDashboard },
        { to: "/events",         label: "Events",      Icon: CalendarDays },
        { to: "/bookings",       label: "My Bookings", Icon: BookMarked },
        { to: "/profile",        label: "Profile",     Icon: UserCircle },
      ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 200 }}>
      <nav className="app-navbar theme-header">
        {/* Brand */}
        <div className="app-navbar-brand" onClick={() => navigate("/")}>
          <Sparkles size={20} style={{ marginRight: 6, verticalAlign: "middle" }} />
          EventPro
        </div>

        {/* Desktop links */}
        <div className="app-navbar-links">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `app-nav-link${isActive ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}
              to={to}
            >
              <Icon size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />
              {label}
            </NavLink>
          ))}

          {/* Role badge */}
          <span className={`theme-badge ${user?.role}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {isAdmin ? <ShieldCheck size={12} /> : <UserCircle size={12} />}
            {user?.role === "admin" ? "Admin" : "User"}
          </span>

          <span className="app-nav-username">{user?.name}</span>

          <button
            className="app-nav-logout"
            onClick={handleLogout}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* Hamburger for mobile */}
        <button
          className="app-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="app-mobile-menu">
          <div className="app-mobile-user">
            Logged in as: <strong>{user?.name}</strong>{" "}
            <span className={`theme-badge ${user?.role}`}>{user?.role}</span>
          </div>
          {links.map(({ to, label, Icon }) => (
            <button
              key={to}
              className="app-mobile-link"
              onClick={() => { setMenuOpen(false); navigate(to); }}
            >
              <Icon size={15} style={{ verticalAlign: "middle", marginRight: 6 }} />
              {label}
            </button>
          ))}
          <button className="app-mobile-link" onClick={() => { setMenuOpen(false); navigate("/"); }}>
            Home
          </button>
          <button
            className="app-mobile-link app-mobile-logout"
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
