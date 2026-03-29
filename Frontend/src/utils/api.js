/**
 * API Client for Antariksh Frontend
 * Uses Vite proxy: /api/* → backend:5000
 * Includes credentials for JWT cookies
 */

const API_BASE = "/api";

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const config = {
    headers: isFormData
      ? { ...options.headers }
      : {
          "Content-Type": "application/json",
          ...options.headers,
        },
    credentials: "include", // Essential for JWT cookies
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.ok ? response.json() : null;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
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
