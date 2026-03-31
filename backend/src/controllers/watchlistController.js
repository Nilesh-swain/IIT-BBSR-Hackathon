import mongoose from "mongoose";
import Watchlist from "../models/Watchlist.js";
import { sendVaultNotification } from "../services/emailService.js";

/**
 * @desc    Toggle asteroid in user's private vault
 * @route   POST /api/watchlist/toggle
 * @access  Private
 */
export const toggleWatchlist = async (req, res, next) => {
  try {
    const { asteroidId, name, asteroidData } = req.body;

    // 1. Identity Guard
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "IDENTITY_REQUIRED: Please sign in.",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id || req.user.id);

    if (!asteroidId) {
      return res.status(400).json({
        success: false,
        message: "Asteroid ID is required.",
      });
    }

    const resolvedName = name || asteroidData?.name;
    if (!resolvedName) {
      return res.status(400).json({
        success: false,
        message: "Asteroid name is required.",
      });
    }

    if (!asteroidData || typeof asteroidData !== "object") {
      return res.status(400).json({
        success: false,
        message: "Asteroid telemetry payload is required.",
      });
    }

    // 2. Check if asteroid already exists for this user
    const existingItem = await Watchlist.findOne({
      user: userId,
      asteroidId,
    })
      .select("_id")
      .lean();

    // 3. REMOVE (Toggle Off)
    if (existingItem) {
      await Watchlist.deleteOne({ _id: existingItem._id });

      return res.status(200).json({
        success: true,
        action: "removed",
        notification: `${resolvedName} removed from your vault.`,
      });
    }

    // 4. ADD (Toggle On)
    const newItem = await Watchlist.create({
      user: userId,
      asteroidId,
      name: resolvedName,
      asteroidData,
    });

    // 5. Send Email (Non-blocking)
    if (req.user?.email) {
      sendVaultNotification(req.user.email, resolvedName).catch(() =>
        console.warn("Email service failed (non-blocking).")
      );
    }

    return res.status(201).json({
      success: true,
      action: "added",
      notification: `${resolvedName} added to your vault.`,
      data: {
        asteroidId: newItem.asteroidId,
        name: newItem.name,
        ...newItem.asteroidData,
        savedAt: newItem.createdAt,
      },
    });
  } catch (error) {
    console.error("toggleWatchlist error:", error);
    next(error);
  }
};

/**
 * @desc    Get ONLY logged-in user's watchlist
 * @route   GET /api/watchlist
 * @access  Private
 */
export const getWatchlist = async (req, res, next) => {
  try {
    // 1. Identity Guard
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "AUTH_REQUIRED: Please login.",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.user._id || req.user.id);

    // 2. Fetch ONLY this user's data (core fix)
    const userItems = await Watchlist.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("asteroidId name asteroidData createdAt")
      .lean();

    // 3. Format clean response
    const watchlist = userItems.map((item) => ({
      asteroidId: item.asteroidId,
      name: item.name,
      ...item.asteroidData,
      savedAt: item.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: watchlist.length,
      watchlist,
      meta: {
        vault_owner: userId,
        last_sync: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("getWatchlist error:", error);
    next(error);
  }
};
