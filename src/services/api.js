// api.js — All backend communication goes through here
// withCredentials: true  → sends the PHP session cookie automatically
// so the backend always knows who is logged in

import axios from "axios";

const normalizeUrl = (url) => url.replace(/\/+$/, "");

const PAGE_PROTOCOL =
  typeof window !== "undefined" ? window.location.protocol : "http:";

const PAGE_HOSTNAME =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const BACKEND_ORIGIN =
  typeof window !== "undefined"
    ? `${PAGE_PROTOCOL}//${PAGE_HOSTNAME}`
    : "http://localhost";

const PROJECT_FOLDER_CANDIDATES = Array.from(
  new Set(
    [
      process.env.REACT_APP_API_PROJECT_FOLDER,
      "event-management-system-main",
      "event-management-system",
    ].filter(Boolean)
  )
);

const DIRECT_API_BASE_URL_CANDIDATES = Array.from(
  new Set(
    [
      `${PAGE_PROTOCOL}//${PAGE_HOSTNAME}:8001/api`,
      `${PAGE_PROTOCOL}//localhost:8001/api`,
      `${PAGE_PROTOCOL}//127.0.0.1:8001/api`,
      `${PAGE_PROTOCOL}//${PAGE_HOSTNAME}:8000/api`,
      `${PAGE_PROTOCOL}//localhost:8000/api`,
      `${PAGE_PROTOCOL}//127.0.0.1:8000/api`,
    ].map(normalizeUrl)
  )
);

const API_BASE_URL_CANDIDATES = Array.from(
  new Set(
    [
      ...PROJECT_FOLDER_CANDIDATES.map(
        (folder) => `${BACKEND_ORIGIN}/${folder}/backend/api`
      ),
      process.env.REACT_APP_API_BASE_URL,
      ...DIRECT_API_BASE_URL_CANDIDATES,
    ]
      .filter(Boolean)
      .map(normalizeUrl)
  )
);

const API = axios.create({
  baseURL: API_BASE_URL_CANDIDATES[0],
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.response.use(
  (response) => {
    const resolvedBaseUrl = normalizeUrl(response.config.baseURL || API.defaults.baseURL);
    if (resolvedBaseUrl && API.defaults.baseURL !== resolvedBaseUrl) {
      API.defaults.baseURL = resolvedBaseUrl;
    }
    return response;
  },
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;

    if (!config) {
      return Promise.reject(error);
    }

    const shouldRetryWithAnotherBaseUrl = !error?.response || status === 404 || status >= 500;

    if (!shouldRetryWithAnotherBaseUrl) {
      return Promise.reject(error);
    }

    const currentBaseUrl = normalizeUrl(config.baseURL || API.defaults.baseURL || "");
    const triedBaseUrls = config._triedBaseUrls || [currentBaseUrl];
    const nextBaseUrl = API_BASE_URL_CANDIDATES.find(
      (candidate) => !triedBaseUrls.includes(candidate)
    );

    if (!nextBaseUrl) {
      return Promise.reject(error);
    }

    return API.request({
      ...config,
      baseURL: nextBaseUrl,
      _triedBaseUrls: [...triedBaseUrls, nextBaseUrl],
    });
  }
);

export default API;
