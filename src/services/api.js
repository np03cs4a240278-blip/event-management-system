// api.js — All backend communication goes through here
// withCredentials: true  → sends the PHP session cookie automatically
// so the backend always knows who is logged in

import axios from "axios";

const normalizeUrl = (url) => url.replace(/\/+$/, "");

const BACKEND_ORIGIN =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}`
    : "http://localhost";

const PROJECT_FOLDER_CANDIDATES = [
  "event-management-system",
  "event-management-system-main",
  process.env.REACT_APP_API_PROJECT_FOLDER,
].filter(Boolean);

// Build a list of candidate base URLs to try (handles different dev setups)
const API_BASE_URL_CANDIDATES = Array.from(
  new Set(
    [
      ...PROJECT_FOLDER_CANDIDATES.map(
        (folder) => `${BACKEND_ORIGIN}/${folder}/backend/api`,
      ),
      process.env.REACT_APP_API_BASE_URL,
    ]
      .filter(Boolean)
      .map(normalizeUrl),
  ),
);

const API = axios.create({
  baseURL: API_BASE_URL_CANDIDATES[0],
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Auto-retry with next candidate URL on 404 (handles different server setups)
API.interceptors.response.use(
  (response) => {
    const resolvedBaseUrl = normalizeUrl(
      response.config.baseURL || API.defaults.baseURL,
    );
    if (resolvedBaseUrl && API.defaults.baseURL !== resolvedBaseUrl) {
      API.defaults.baseURL = resolvedBaseUrl;
    }
    return response;
  },
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;

    if (!config || status !== 404) return Promise.reject(error);

    const currentBaseUrl = normalizeUrl(
      config.baseURL || API.defaults.baseURL || "",
    );
    const triedBaseUrls = config._triedBaseUrls || [currentBaseUrl];
    const nextBaseUrl = API_BASE_URL_CANDIDATES.find(
      (candidate) => !triedBaseUrls.includes(candidate),
    );

    if (!nextBaseUrl) return Promise.reject(error);

    return API.request({
      ...config,
      baseURL: nextBaseUrl,
      _triedBaseUrls: [...triedBaseUrls, nextBaseUrl],
    });
  },
);

export default API;
