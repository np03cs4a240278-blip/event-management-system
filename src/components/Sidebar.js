<<<<<<< HEAD
=======
<<<<<<< HEAD
import { Link } from "react-router-dom"
import "../styles/sidebar.css"

function Sidebar(){

return(

<div style={styles.sidebar}>

<h2 style={styles.logo}>EventPro</h2>

<ul style={styles.menu}>

<li><Link to="/dashboard">Dashboard</Link></li>
<li><Link to="/events">Events</Link></li>
<li><Link to="/bookings">Bookings</Link></li>
<li><Link to="/admin/dashboard">Admin</Link></li>

</ul>

</div>

)

}

const styles = {

sidebar:{
width:"220px",
height:"100vh",
background:"white",
padding:"20px",
boxShadow:"2px 0 10px rgba(0,0,0,0.05)"
},

logo:{
color:"#A78BFA"
},

menu:{
listStyle:"none",
lineHeight:"40px",
padding:0
}

}

export default Sidebar
=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linksByRole = {
  user: [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/events", label: "Events" },
    { to: "/bookings", label: "My Bookings" },
    { to: "/profile", label: "Profile" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/events", label: "Manage Events" },
    { to: "/admin/bookings", label: "All Bookings" },
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
        <p className="eyebrow">Event Management</p>
        <h2>EventPro</h2>
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
<<<<<<< HEAD
=======
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
