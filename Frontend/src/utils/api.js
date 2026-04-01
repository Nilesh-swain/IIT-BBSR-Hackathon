/**
 * API Client for Antariksh Frontend
 * Uses Vite proxy: /api/* → backend:5000
 * Includes credentials for JWT cookies
 */

import { API_BASE } from "../config/api.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const buildApiUrl = (endpoint) => {
  const normalizedBase = API_BASE?.replace(/\/+$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (!normalizedBase) {
    return normalizedEndpoint;
  }

  return `${normalizedBase}${normalizedEndpoint}`;
};

export async function apiFetch(endpoint, options = {}, retries = 3, backoff = 1000) {
  const url = buildApiUrl(endpoint);
  const isFormData = options.body instanceof FormData;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

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
    console.log(`🌌 [API_UPLINK]: ${config.method || "GET"} ${url} | Attempt: ${4 - retries} | Trace: ${new Date().toISOString()}`);
    const response = await fetch(url, config);
    console.log(`📡 [API_DOWNLINK]: ${url} | Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // ⚠️ Use text() first to avoid 'Unexpected end of JSON input'
      const errorText = await response.text();
      console.error(`🛑 [API_ERROR]: ${url} | Status: ${response.status} | Msg: ${errorText}`);
      
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || `HTTP ${response.status}` };
      }
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // ✅ Handle 204 No Content or empty bodies safely
    if (response.status === 204) {
      console.log(`✅ [API_SUCCESS]: ${url} | No Content`);
      return null;
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log(`✅ [API_SUCCESS_JSON]: ${url}`, data);
      return data;
    }
    
    const textData = await response.text();
    console.log(`✅ [API_SUCCESS_TEXT]: ${url}`, textData);
    return textData;
  } catch (error) {
    const isNetworkError =
      error instanceof TypeError ||
      error.name === "AbortError" ||
      error.message.includes("Failed to fetch");
    
    if (retries > 0 && isNetworkError) {
      console.warn(`⚠️ [API_RETRY]: Retrying ${url} in ${backoff}ms (${retries} retries left). Reason: ${error.message}`);
      await sleep(backoff);
      return apiFetch(endpoint, options, retries - 1, backoff * 2);
    }

    console.error("⛔ [API_FATAL_EXCEPTION]:", error);
    
    // Enriching the error for the UI
    if (isNetworkError) {
      error.message =
        error.name === "AbortError"
          ? "The request timed out. Please try again."
          : "Unable to connect to the server. It might be waking up from sleep. Please try again in a few seconds.";
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
