// AuthContext.js
// This is the "memory box" for the whole app.
// It remembers who is logged in and talks to the PHP backend.

import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user = the logged-in person's data (name, email, role)
  // null means nobody is logged in
  const [user, setUser] = useState(null);

  // loading = true while we are checking if a session exists
  const [loading, setLoading] = useState(true);

  // When the app first loads, ask the backend "is anyone logged in?"
  // The backend checks the PHP session cookie automatically
  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        const response = await API.get("/me");
        if (isActive) setUser(response.data.user ?? null);
      } catch {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    restoreSession();
    return () => { isActive = false; };
  }, []);

  // Login: send email + password to backend, get user back
  const login = async (credentials) => {
    const response = await API.post("/login", credentials);
    const loggedInUser = response.data.user ?? null;
    setUser(loggedInUser);
    return loggedInUser;
  };

  // Register: send name + email + password to backend
  const register = async (payload) => {
    await API.post("/register", payload);
  };

  // Logout: tell backend to destroy the session
  const logout = async () => {
    try {
      await API.get("/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth() — call this in any page to get the current user
export function useAuth() {
  return useContext(AuthContext);
}
