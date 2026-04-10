// api.js — All backend communication goes through here
// withCredentials: true  → sends the PHP session cookie automatically
// so the backend always knows who is logged in

import axios from "axios";

const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost/event-management-system-main/backend/api"
).replace(/\/+$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default API;
