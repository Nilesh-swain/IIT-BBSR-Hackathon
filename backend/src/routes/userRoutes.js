import express from "express";
import {
  registerUser,
  verifyOTP,
  loginUser,
  logout,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  uploadPaper,
  resendOTP,
  getCaptchaChallenge,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  getSettings,
  updateSettings,
} from "../controllers/userController.js";
import { protect as isAuthenticated } from "../middlewares/auth.js";
import upload from "../config/cloudinary.js"; // Standard Cloudinary/Multer config

const router = express.Router();

/** * --- PUBLIC AUTH PROTOCOLS --- 
 * These endpoints handle identity creation and session initiation.
 */

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/verify-otp
router.post("/verify-otp", verifyOTP);

// @route   POST /api/auth/login
router.post("/login", loginUser);

// @route   POST /api/auth/captcha
router.post("/captcha", getCaptchaChallenge);

// @route   POST /api/auth/resend-otp
router.post("/resend-otp", resendOTP);

// @route   POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// @route   POST /api/auth/forgot-password/verify-otp
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);

// @route   POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

// @route   GET /api/auth/logout
router.get("/logout", logout);

/** * --- PROTECTED SYSTEM NODES --- 
 * These require a valid JWT via the 'isAuthenticated' middleware.
 */

/**
 * @desc    Profile Data Management
 * Matches frontend: apiGet("/auth/profile") & apiPut("/auth/profile")
 */
router
  .route("/profile")
  .get(isAuthenticated, getMyProfile)
  .put(isAuthenticated, updateProfile);

router
  .route("/settings")
  .get(isAuthenticated, getSettings)
  .put(isAuthenticated, updateSettings);

/**
 * @desc    Avatar Synchronization
 * Matches frontend: apiPostForm("/auth/upload-avatar", formData)
 * Uses Multer-Cloudinary to process 'avatar' field
 */
router.post(
  "/upload-avatar",
  isAuthenticated,
  upload.single("avatar"),
  uploadAvatar
);

/**
 * @desc    Research Archive Integration
 * Matches frontend: apiPostForm("/auth/upload-paper", formData)
 * Uses Multer-Cloudinary to process 'paper' field (PDFs/Docs)
 */
router.post(
  "/upload-paper",
  isAuthenticated,
  upload.single("paper"),
  uploadPaper
);

/** * --- SYSTEM ALIASES --- 
 * Redundant nodes for internal compatibility and health checks.
 */
router.get("/me", isAuthenticated, getMyProfile);
router.get("/auth/me", isAuthenticated, getMyProfile);

export default router;
