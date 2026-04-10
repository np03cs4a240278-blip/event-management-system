<<<<<<< HEAD
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
import AdminDashboard from "./pages/AdminDashboard";
import BookVenue      from "./pages/BookVenue";

// App-shell pages (original backend-connected)
import Profile        from "./pages/Profile";
import AdminBookings  from "./pages/admin/Bookings";
import ManageEvents   from "./pages/admin/ManageEvents";
import UserBookings   from "./pages/user/Bookings";
import Events         from "./pages/user/Events";

function App() {
=======
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
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
<<<<<<< HEAD
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/signup"   element={<Signup />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback" element={<FeedbackForm eventName="Tech Summit 2026" />} />

          {/* User routes */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/book-venue"     element={<BookVenue />} />
            <Route path="/events"         element={<Events />} />
            <Route path="/bookings"       element={<UserBookings />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/events"    element={<ManageEvents />} />
            <Route path="/admin/bookings"  element={<AdminBookings />} />
          </Route>

          {/* Shared protected */}
          <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
=======
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
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
<<<<<<< HEAD

export default App;
=======
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
