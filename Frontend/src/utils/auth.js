// Auth utils - check real backend session
import { apiGet } from "./api.js";

export const checkAuth = async () => {
  try {
    const user = await apiGet("/auth/me");
    return !!user;
  } catch (error) {
    return false;
  }
};
