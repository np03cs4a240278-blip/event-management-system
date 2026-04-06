import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/Bookings";
import ManageEvents from "./pages/admin/ManageEvents";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Bookings from "./pages/user/Bookings";
import Dashboard from "./pages/user/Dashboard";
import Events from "./pages/user/Events";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Login />} path="/" />
          <Route element={<Login />} path="/login" />
          <Route element={<Signup />} path="/signup" />

          <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
            <Route element={<Profile />} path="/profile" />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route element={<Dashboard />} path="/dashboard" />
            <Route element={<Events />} path="/events" />
            <Route element={<Bookings />} path="/bookings" />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminDashboard />} path="/admin/dashboard" />
            <Route element={<ManageEvents />} path="/admin/events" />
            <Route element={<AdminBookings />} path="/admin/bookings" />
          </Route>

          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
