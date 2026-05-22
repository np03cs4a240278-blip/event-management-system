// api.js — All backend communication goes through here
// withCredentials: true  → sends the PHP session cookie automatically
// so the backend always knows who is logged in

import axios from "axios";

// ── Determine the API base URL ─────────────────────────────────────────────
// Priority 1: explicit env variable (set in .env)
// Priority 2: auto-detect from current hostname (works for XAMPP on localhost)

function buildBaseUrl() {
  // Use the explicit env variable if provided
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "");
  }

  // Auto-detect: works when React dev server (port 3000) and XAMPP (port 80)
  // are both running on the same machine
  const origin =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}`
      : "http://localhost";

  const folder =
    process.env.REACT_APP_API_PROJECT_FOLDER || "event-management-system";

  return `${origin}/${folder}/backend/api`;
}

const BASE_URL = buildBaseUrl();

// ── Create axios instance ──────────────────────────────────────────────────
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends PHP session cookie on every request
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 second timeout — prevents hanging requests
});

// ── Response interceptor ───────────────────────────────────────────────────
// Normalises errors so every catch block gets a consistent shape
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (XAMPP not running, wrong URL, CORS, etc.)
    if (!error.response) {
      const networkError = new Error(
        "Cannot reach the server. Make sure XAMPP is running and Apache is started."
      );
      networkError.response = {
        data: {
          message:
            "Cannot reach the server. Make sure XAMPP is running and Apache is started.",
        },
      };
      return Promise.reject(networkError);
    }
    return Promise.reject(error);
  }
);

export default API;
