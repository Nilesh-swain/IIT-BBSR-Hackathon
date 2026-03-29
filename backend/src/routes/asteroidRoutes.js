import express from "express";
import { protect, authorize } from "../middlewares/auth.js";
import {
  getAsteroids,
  getAsteroid,
  refreshCache,
  getHazardous,
} from "../controllers/asteroidController.js";

// Import your Watchlist controllers
import {
  toggleWatchlist,
  getWatchlist,
} from "../controllers/watchlistController.js";

const router = express.Router();

// --- PUBLIC ROUTES (NASA Data) ---
router.route("/").get(getAsteroids);
router.route("/hazardous").get(getHazardous);
router.route("/:id").get(getAsteroid);

// --- ADMIN ONLY ---
router.route("/refresh").post(protect, authorize("admin"), refreshCache);

export default router;
