import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import myLogo from "../assets/mylogo.png";

const linksByRole = {
  user: [
    { to: "/user-dashboard", label: "Dashboard" },
    { to: "/events", label: "Events" },
    { to: "/bookings", label: "My Bookings" },
    { to: "/profile", label: "Profile" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/events", label: "Manage Events" },
    { to: "/admin/bookings", label: "All Bookings" },
    { to: "/admin/users", label: "Users" },
    { to: "/profile", label: "Profile" },
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
      <div className="sidebar__brand">
        <img
          src={myLogo}
          alt="Event Management System"
          style={{ width: "100%", maxWidth: 180, height: "auto", marginBottom: 12 }}
        />
        <p className="eyebrow">Event Management System</p>
        <p className="sidebar__user">{user?.name}</p>
        <p className="sidebar__email">{user?.email}</p>
      </div>

      <nav className="sidebar__nav">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to={link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button className="button button-secondary sidebar__logout" onClick={handleLogout} type="button">
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
