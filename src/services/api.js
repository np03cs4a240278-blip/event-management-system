<<<<<<< HEAD
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost/event-management-system-main/backend/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
=======
<<<<<<< HEAD
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/event-api/"
});

export default API;
=======
// api.js — All backend communication goes through here
// withCredentials: true  → sends the PHP session cookie automatically
// so the backend always knows who is logged in

import axios from "axios";

const DEFAULT_PROJECT_FOLDER =
  process.env.REACT_APP_API_PROJECT_FOLDER || "event-management-system-main";

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return `http://localhost/${DEFAULT_PROJECT_FOLDER}/backend/api`;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}/${DEFAULT_PROJECT_FOLDER}/backend/api`;
}

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || getDefaultApiBaseUrl()
).replace(/\/+$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,          // sends session cookie with every request
  headers: { "Content-Type": "application/json" },
});

export default API;
>>>>>>> Backend
>>>>>>> 9b35fd94c228ec7931cb361d42260fd6c2e07d2f
