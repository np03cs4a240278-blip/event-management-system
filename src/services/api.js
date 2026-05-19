// api.js — Centralised HTTP client for all backend requests.
// Uses axios with withCredentials so the PHP session cookie is sent automatically.

import axios from "axios";

// ── Resolve the API base URL ───────────────────────────────────────────────
// Priority 1: REACT_APP_API_BASE_URL set in .env  (most reliable)
// Priority 2: Auto-detect from current browser hostname (works for XAMPP)
function resolveBaseUrl() {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // Fallback: build URL from current hostname (React dev server on :3000,
  // XAMPP Apache on :80 — same machine, same hostname)
  const origin =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}`
      : "http://localhost";

  const folder =
    (process.env.REACT_APP_API_PROJECT_FOLDER || "event-management-system").trim();

  return `${origin}/${folder}/backend/api`;
}

const BASE_URL = resolveBaseUrl();

// ── Axios instance ─────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,          // sends PHP session cookie on every request
  headers: { "Content-Type": "application/json" },
  timeout: 20000,                 // 20 s — prevents hanging requests
});

// ── Response interceptor ───────────────────────────────────────────────────
// Converts network errors into a consistent shape so every catch block
// can read error.response.data.message without extra null-checks.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error — XAMPP not running, wrong URL, CORS block, etc.
      const msg =
        "Cannot reach the server. Make sure XAMPP is running and Apache is started.";
      error.response = { data: { message: msg } };
    }
    return Promise.reject(error);
  }
);

export default API;
