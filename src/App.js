// App.js — Main routing file
// Defines all pages and who can access them

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./pages/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BookVenue from "./pages/BookVenue";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages — anyone can visit */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User-only pages */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-venue"
            element={
              <ProtectedRoute role="user">
                <BookVenue />
              </ProtectedRoute>
            }
          />

          {/* Admin-only pages */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
