const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const ensureApiSuffix = (value = "") =>
  value.endsWith("/api") ? value : `${trimTrailingSlash(value)}/api`;

const resolveApiBase = () => {
  const envUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || "");

  if (envUrl) {
    return ensureApiSuffix(envUrl);
  }

  if (typeof window === "undefined") {
    return "";
  }

  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalHost) {
    return "http://localhost:5000/api";
  }

  return `${trimTrailingSlash(window.location.origin)}/api`;
};

export const API_BASE = resolveApiBase();

console.log("🌐 API BASE URL:", API_BASE || "[same-origin /api fallback]");
