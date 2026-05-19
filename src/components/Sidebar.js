// Sidebar.js — Left navigation panel for AppShell pages
// Uses lucide-react icons for a modern, consistent look

import {
  LayoutDashboard,
  CalendarDays,
  BookMarked,
  Users,
  UserCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Role-based navigation links with icons
const linksByRole = {
  user: [
    { to: "/user-dashboard", label: "Dashboard",   Icon: LayoutDashboard },
    { to: "/events",         label: "Events",       Icon: CalendarDays },
    { to: "/bookings",       label: "My Bookings",  Icon: BookMarked },
    { to: "/profile",        label: "Profile",      Icon: UserCircle },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard",      Icon: LayoutDashboard },
    { to: "/admin/events",    label: "Manage Events",   Icon: CalendarDays },
    { to: "/admin/bookings",  label: "All Bookings",    Icon: BookMarked },
    { to: "/admin/users",     label: "Users",           Icon: Users },
    { to: "/profile",         label: "Profile",         Icon: UserCircle },
  ],
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navLinks = linksByRole[user?.role || "user"];

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <Sparkles size={20} color="#A5B4FC" />
          <p className="eyebrow" style={{ margin: 0, color: "rgba(165,180,252,0.9)" }}>Event Management</p>
        </div>
        <h2>EventPro</h2>
        <p className="sidebar__user">{user?.name}</p>
        <p className="sidebar__email">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navLinks.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to={to}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        className="button button-secondary sidebar__logout"
        onClick={handleLogout}
        type="button"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}
      >
        <LogOut size={16} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
