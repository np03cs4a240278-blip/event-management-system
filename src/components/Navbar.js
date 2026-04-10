<<<<<<< HEAD
=======
<<<<<<< HEAD
import "../styles/navbar.css";
function Navbar() {
  return (
    <div style={styles.navbar}>
      <input placeholder="Search events..." style={styles.search} />

      <button style={styles.button}>Create Event</button>
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
    background: "white",
  },

  search: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  button: {
    background: "#C4B5FD",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    color: "white",
  },
};

=======
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
import { useAuth } from "../context/AuthContext";

function Navbar({ title, subtitle, actions }) {
  const { user } = useAuth();

  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{user?.role === "admin" ? "Admin workspace" : "User workspace"}</p>
        <h1>{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>

      <div className="page-header__actions">
        {actions}
        {user ? (
          <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
        ) : null}
      </div>
    </header>
  );
}

<<<<<<< HEAD
=======
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
export default Navbar;
