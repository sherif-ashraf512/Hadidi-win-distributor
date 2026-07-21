import axios from "axios";
import { clearToken, getToken } from "@/lib/auth";
import { STORAGE_LOCALE_KEY } from "@/messages";

function localeForApi() {
  if (typeof window === "undefined") return "ar";
  try {
    const raw = window.localStorage.getItem(STORAGE_LOCALE_KEY);
    if (raw === "en" || raw === "ar") return raw;
  } catch {
    /* ignore */
  }
  return "ar";
}

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000/api";

export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const loc = localeForApi();
  config.headers["Accept-Language"] = loc;
  config.headers["X-App-Locale"] = loc;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) clearToken();
    return Promise.reject(err);
  }
);
