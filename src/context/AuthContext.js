// AuthContext.js
// This is the "memory box" for the whole app.
// It remembers who is logged in and talks to the PHP backend.

import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

// localStorage keys for persisting auth state across page refreshes
const AUTH_STORAGE_KEY = "ems.auth.user";
const AUTH_SESSION_KEY = "ems.auth.session";
const AUTH_COOKIE_KEY  = "ems_auth_state";

function parseStoredUser(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function readStoredUser() {
  if (typeof window === "undefined") return null;
  return (
    parseStoredUser(window.localStorage.getItem(AUTH_STORAGE_KEY)) ||
    parseStoredUser(window.sessionStorage.getItem(AUTH_SESSION_KEY))
  );
}

function writeAuthCookie(user) {
  if (typeof document === "undefined") return;
  const value = user ? `${user.role || "user"}:${user.id || "guest"}` : "guest";
  document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=86400; samesite=lax`;
}

function persistAuthState(user) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
    if (typeof document !== "undefined") {
      document.cookie = `${AUTH_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
    }
    return;
  }
  const serialized = JSON.stringify(user);
  window.localStorage.setItem(AUTH_STORAGE_KEY, serialized);
  window.sessionStorage.setItem(AUTH_SESSION_KEY, serialized);
  writeAuthCookie(user);
}

export function AuthProvider({ children }) {
  // user = the logged-in person's data (name, email, role)
  // null means nobody is logged in
  const [user, setUser]       = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  // Sync user state to both React state and localStorage
  const syncUserState = (nextUser) => {
    setUser(nextUser);
    persistAuthState(nextUser);
    return nextUser;
  };

  // When the app first loads, ask the backend "is anyone logged in?"
  // The backend checks the PHP session cookie automatically
  useEffect(() => {
    let isActive = true;
    const restoreSession = async () => {
      try {
        const response = await API.get("/me");
        if (isActive) syncUserState(response.data.user ?? null);
      } catch {
        if (isActive) syncUserState(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    restoreSession();
    return () => { isActive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login: send email + password to backend, get user back
  const login = async (credentials) => {
    const response = await API.post("/login", credentials);
    const loggedInUser = response.data.user ?? null;
    syncUserState(loggedInUser);
    return loggedInUser;
  };

  // Register: send name + email + password to backend
  const register = async (payload) => {
    await API.post("/register", payload);
  };

  // Change password
  const changePassword = async (payload) => {
    const response = await API.post("/change-password", payload);
    const updatedUser = response.data.user ?? null;
    syncUserState(updatedUser);
    return response.data;
  };

  // Logout: tell backend to destroy the session
  const logout = async () => {
    try {
      await API.get("/logout");
    } finally {
      syncUserState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth() — call this in any page to get the current user
export function useAuth() {
  return useContext(AuthContext);
}
