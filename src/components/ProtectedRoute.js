import { Navigate, Outlet, useLocation } from "react-router-dom";
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
  const location = useLocation();

  if (loading) {
    return <FullPageState message="Restoring your session..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.must_change_password && location.pathname !== "/profile") {
    return <Navigate replace to="/profile" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallbackRoute = user.role === "admin" ? "/admin/dashboard" : "/events";
    return <Navigate replace to={fallbackRoute} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
