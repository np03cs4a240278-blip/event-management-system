// Sidebar.js — Left navigation panel for AppShell pages
// Uses the real logo image + lucide-react icons + ContactContext for unread badge

import {
  LayoutDashboard,
  CalendarDays,
  BookMarked,
  Users,
  UserCircle,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useContact } from "../context/ContactContext";
import AppLogo from "./AppLogo";

// Role-based navigation links with icons
const userLinks = [
  { to: "/user-dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { to: "/events",         label: "Events",      Icon: CalendarDays },
  { to: "/bookings",       label: "My Bookings", Icon: BookMarked },
  { to: "/profile",        label: "Profile",     Icon: UserCircle },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard",        Icon: LayoutDashboard },
  { to: "/admin/events",    label: "Manage Events",    Icon: CalendarDays },
  { to: "/admin/bookings",  label: "All Bookings",     Icon: BookMarked },
  { to: "/admin/users",     label: "Users",            Icon: Users },
  { to: "/admin/messages",  label: "Contact Messages", Icon: MessageSquare, badge: true },
  { to: "/profile",         label: "Profile",          Icon: UserCircle },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const { unreadCount }  = useContact();
  const navigate = useNavigate();

  const navLinks = user?.role === "admin" ? adminLinks : userLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      {/* Brand — logo image */}
      <div
        className="sidebar__brand"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        {/* Logo centred with a soft white glow behind it */}
        <div style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: "10px 12px",
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <AppLogo size="sm" style={{ filter: "brightness(1.1) drop-shadow(0 2px 8px rgba(165,180,252,0.4))" }} />
        </div>

        <p className="sidebar__user">{user?.name}</p>
        <p className="sidebar__email">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navLinks.map(({ to, label, Icon, badge }) => (
          <NavLink
            key={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to={to}
          >
            <Icon size={17} />
            <span style={{ flex: 1 }}>{label}</span>

            {/* Unread badge — only on Contact Messages link for admin */}
            {badge && unreadCount > 0 && (
              <span style={{
                background: "#FBCFE8",
                color: "#9D174D",
                fontSize: 11,
                fontWeight: 800,
                borderRadius: 999,
                padding: "2px 7px",
                minWidth: 20,
                textAlign: "center",
                lineHeight: "16px",
              }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
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
