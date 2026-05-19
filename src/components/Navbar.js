// components/Navbar.js — Page header bar inside AppShell
// Shows page title, subtitle, role badge, and optional action buttons

import { ShieldCheck, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar({ title, subtitle, actions }) {
  const { user } = useAuth();

  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">
          {user?.role === "admin" ? "Admin workspace" : "User workspace"}
        </p>
        <h1>{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>

      <div className="page-header__actions">
        {actions}
        {user ? (
          <span
            className={`role-badge role-badge--${user.role}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {user.role === "admin"
              ? <ShieldCheck size={13} />
              : <UserCircle size={13} />}
            {user.role}
          </span>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
