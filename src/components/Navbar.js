// components/Navbar.js — Page header bar inside AppShell
// Shows page title, subtitle, role badge, and unread message notification badge

import { ShieldCheck, UserCircle, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useContact } from "../context/ContactContext";

function Navbar({ title, subtitle, actions }) {
  const { user }        = useAuth();
  const { unreadCount } = useContact();
  const navigate        = useNavigate();
  const isAdmin         = user?.role === "admin";

  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">
          {isAdmin ? "Admin workspace" : "User workspace"}
        </p>
        <h1>{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>

      <div className="page-header__actions">
        {actions}

        {/* Notification bell — admin only, shows unread message count */}
        {isAdmin && (
          <button
            onClick={() => navigate("/admin/messages")}
            title={unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}` : "Contact Messages"}
            style={{
              position: "relative",
              background: unreadCount > 0 ? "#FDF2F8" : "#F5F3FF",
              border: `1.5px solid ${unreadCount > 0 ? "#FBCFE8" : "#EDE9FE"}`,
              borderRadius: "50%",
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(165,180,252,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            type="button"
          >
            <Bell size={17} color={unreadCount > 0 ? "#9D174D" : "#818CF8"} />

            {/* Red dot badge */}
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: -3,
                right: -3,
                background: "#EF4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                borderRadius: 999,
                minWidth: 17,
                height: 17,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                border: "2px solid #fff",
                lineHeight: 1,
              }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Role badge */}
        {user ? (
          <span
            className={`role-badge role-badge--${user.role}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            {isAdmin ? <ShieldCheck size={13} /> : <UserCircle size={13} />}
            {user.role}
          </span>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
