<<<<<<< HEAD
import { BrowserRouter,Routes,Route } from "react-router-dom"

import Dashboard from "./pages/user/Dashboard"
import Events from "./pages/user/Events"
import Bookings from "./pages/user/Bookings"

import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageEvents from "./pages/admin/ManageEvents"

import Login from "./pages/Login"
import Signup from "./pages/Signup"

function App(){

return(

<BrowserRouter>

<Routes>

<Route path="/" element={<Login/>}/>
<Route path="/signup" element={<Signup/>}/>

<Route path="/dashboard" element={<Dashboard/>}/>
<Route path="/events" element={<Events/>}/>
<Route path="/bookings" element={<Bookings/>}/>

<Route path="/admin/dashboard" element={<AdminDashboard/>}/>
<Route path="/admin/events" element={<ManageEvents/>}/>

</Routes>

</BrowserRouter>

)

}

export default App
=======
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
>>>>>>> Backend
