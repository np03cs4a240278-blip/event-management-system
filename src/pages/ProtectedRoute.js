// ProtectedRoute.js — Guards pages that require login
// If not logged in → go to /login
// If wrong role → go to correct dashboard

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Still checking session — show nothing yet
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8F9FD" }}>
        <p style={{ color: "#9CA3AF", fontSize: 16 }}>Loading...</p>
      </div>
    );
  }

  // Not logged in → go to login page
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role → redirect to correct dashboard
  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />;
  }

  return children;
}
