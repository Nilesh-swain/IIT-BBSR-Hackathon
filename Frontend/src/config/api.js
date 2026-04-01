const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const resolveApiBase = () => {
  const envUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "");

  if (envUrl) {
    return envUrl;
  }

  if (typeof window === "undefined") {
    return "";
  }

  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalHost) {
    return "http://localhost:5000";
  }

  return trimTrailingSlash(window.location.origin);
};

export const API_BASE = resolveApiBase();

console.log("🌐 API BASE URL:", API_BASE || "[same-origin /api fallback]");
