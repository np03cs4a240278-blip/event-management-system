import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Home       from "./pages/Home";
import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import Register   from "./pages/Register";
import FeedbackForm from "./components/FeedbackForm";

// Dashboard pages (theme-styled, backend-connected)
import UserDashboard  from "./pages/UserDashboard";
import BookVenue      from "./pages/BookVenue";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings  from "./pages/admin/Bookings";
import ManageEvents   from "./pages/admin/ManageEvents";
import ManageUsers    from "./pages/admin/ManageUsers";
import Profile        from "./pages/Profile";
import UserBookings   from "./pages/user/Bookings";
import Events         from "./pages/user/Events";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/signup"   element={<Signup />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback" element={<FeedbackForm eventName="Tech Summit 2026" />} />

          {/* User routes */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/dashboard"      element={<Navigate replace to="/user-dashboard" />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/book-venue"     element={<BookVenue />} />
            <Route path="/events"         element={<Events />} />
            <Route path="/bookings"       element={<UserBookings />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/events"    element={<ManageEvents />} />
            <Route path="/admin/bookings"  element={<AdminBookings />} />
            <Route path="/admin/users"     element={<ManageUsers />} />
          </Route>

          {/* Shared protected */}
          <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
