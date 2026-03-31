import { apiGet } from "./api";

/**
 * Utility to verify backend connectivity.
 * Logs results to console with formatted tags.
 */
export const testBackendConnection = async () => {
  console.log("🔍 [SYSTEM_CHECK]: Initiating backend connectivity test...");
  try {
    const data = await apiGet("/api/test");
    if (data && data.success) {
      console.log("✅ [SYSTEM_CHECK]: Backend is reachable and healthy!", data);
      return { success: true, data };
    } else {
      console.warn("⚠️ [SYSTEM_CHECK]: Backend responded but with unexpected data:", data);
      return { success: false, data };
    }
  } catch (error) {
    console.error("❌ [SYSTEM_CHECK]: Backend connectivity test failed:", error.message);
    return { success: false, error: error.message };
  }
};

