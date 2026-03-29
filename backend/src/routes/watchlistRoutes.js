import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  toggleWatchlist,
  getWatchlist,
} from "../controllers/watchlistController.js";

const router = express.Router();

/**
 * 🔐 GLOBAL SECURITY LAYER
 * All routes below require authentication
 */
router.use(protect);

/**
 * 🧪 OPTIONAL: Health Check Route (for debugging)
 * You can remove in production if not needed
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Watchlist service is active 🚀",
  });
});

/**
 * 📡 GET /api/watchlist
 * Retrieve logged-in user's asteroid vault
 */
router.get("/", getWatchlist);

/**
 * 🔄 POST /api/watchlist/toggle
 * Add or remove asteroid from vault
 */
router.post(
  "/toggle",
  (req, res, next) => {
    const { asteroidId, name } = req.body;

    // ⚠️ Basic validation before hitting controller
    if (!asteroidId) {
      return res.status(400).json({
        success: false,
        message: "Asteroid ID is required",
      });
    }

    // Name is required only when adding (optional logic)
    if (!name && !req.body.removeOnly) {
      console.warn("Name missing, but proceeding...");
    }

    next();
  },
  toggleWatchlist
);

/**
 * 🚫 FALLBACK ROUTE (for unknown endpoints)
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found in Watchlist API",
  });
});

/**
 * 📦 EXPORT ROUTER
 */
export default router;