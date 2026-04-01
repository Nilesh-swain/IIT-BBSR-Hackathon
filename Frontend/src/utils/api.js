/**
 * API Client for Antariksh Frontend
 * Uses Vite proxy: /api/* → backend:5000
 * Includes credentials for JWT cookies
 */

import { API_BASE } from "../config/api.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const RETRY_DELAYS_MS = [2000, 5000, 10000, 20000];
const DEFAULT_TIMEOUT_MS = 20000;

const createApiError = (message, details = {}) => {
  const error = new Error(message);
  Object.assign(error, details);
  return error;
};

export const buildApiUrl = (endpoint) => {
  const normalizedBase = API_BASE?.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const strippedEndpoint = normalizedEndpoint.replace(/^\/api(?=\/|$)/, "");

  if (!normalizedBase) {
    return `/api${strippedEndpoint}`;
  }

  return `${normalizedBase}${strippedEndpoint}`;
};

export async function apiFetch(endpoint, options = {}, retryIndex = 0) {
  const url = buildApiUrl(endpoint);
  const isFormData = options.body instanceof FormData;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const config = {
    headers: isFormData
      ? { ...options.headers }
      : {
          "Content-Type": "application/json",
          ...options.headers,
        },
    credentials: "include", // Essential for JWT cookies
    signal: controller.signal,
    ...options,
  };

  try {
    console.log(
      JSON.stringify({
        scope: "api_request",
        method: config.method || "GET",
        url,
        attempt: retryIndex + 1,
        timestamp: new Date().toISOString(),
      }),
    );

    const response = await fetch(url, config);
    console.log(
      JSON.stringify({
        scope: "api_response",
        method: config.method || "GET",
        url,
        status: response.status,
        statusText: response.statusText,
      }),
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        JSON.stringify({
          scope: "api_error",
          method: config.method || "GET",
          url,
          status: response.status,
          body: errorText,
        }),
      );

      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || `HTTP ${response.status}` };
      }

      throw createApiError(errorData.message || `HTTP ${response.status}`, {
        status: response.status,
        responseBody: errorData,
      });
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (data === null || typeof data !== "object") {
        throw createApiError("Invalid JSON response received from server.", {
          status: response.status,
        });
      }

      return data;
    }

    throw createApiError("Unexpected response format received from server.", {
      status: response.status,
      contentType,
    });
  } catch (error) {
    const isNetworkError =
      error instanceof TypeError ||
      error.name === "AbortError" ||
      error.message.includes("Failed to fetch");

    if (isNetworkError && retryIndex < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[retryIndex];

      console.warn(
        JSON.stringify({
          scope: "api_retry",
          method: config.method || "GET",
          url,
          attempt: retryIndex + 1,
          nextDelayMs: delay,
          reason: error.message,
        }),
      );

      await sleep(delay);
      return apiFetch(endpoint, options, retryIndex + 1);
    }

    console.error(
      JSON.stringify({
        scope: "api_fatal",
        method: config.method || "GET",
        url,
        message: error.message,
        status: error.status || null,
      }),
    );

    if (isNetworkError) {
      error.message =
        error.name === "AbortError"
          ? "The request timed out. Please try again."
          : "Server is waking up, please wait and try again.";
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// Convenience methods
export const apiPost = (endpoint, data) =>
  apiFetch(endpoint, { method: "POST", body: JSON.stringify(data) });

export const apiGet = (endpoint) => apiFetch(endpoint, { method: "GET" });

export const apiPut = (endpoint, data) =>
  apiFetch(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

export const apiPostForm = (endpoint, formData) =>
  apiFetch(endpoint, {
    method: "POST",
    body: formData,
    headers: {
      // Don't set Content-Type - let browser set multipart boundary
    },
  });

export default apiFetch;
