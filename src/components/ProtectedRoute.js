import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullPageState({ message }) {
  return (
    <div className="fullscreen-state">
      <div className="panel fullscreen-panel">
        <h2>{message}</h2>
      </div>
    </div>
  );
}

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageState message="Restoring your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackRoute = user.role === "admin" ? "/admin/dashboard" : "/user-dashboard";
    return <Navigate replace to={fallbackRoute} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
