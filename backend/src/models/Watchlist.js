import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema(
  {
    // 🔐 USER (Vault Owner)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    // ☄️ ASTEROID ID
    asteroidId: {
      type: String,
      required: [true, "Asteroid ID required"],
      trim: true,
    },

    // 🏷️ NAME
    name: {
      type: String,
      required: [true, "Name required"],
      trim: true,
    },

    // 📡 TELEMETRY DATA (Better than raw Object)
    asteroidData: {
      type: mongoose.Schema.Types.Mixed, // flexible but still safe
      required: [true, "Telemetry data required"],
    },

    // 🔔 USER NOTIFICATION SETTINGS
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔒 UNIQUE VAULT LOCK
 * Prevents duplicate asteroid per user
 */
WatchlistSchema.index(
  { user: 1, asteroidId: 1 },
  { unique: true }
);

/**
 * 🛡️ PRE-SAVE SECURITY CHECK
 */
WatchlistSchema.pre("save", async function () {
  if (!this.user) {
    throw new Error("SECURITY_ERROR: Cannot save without user reference.");
  }

  if (!this.asteroidId) {
    throw new Error("VALIDATION_ERROR: Asteroid ID missing.");
  }
});


/**
 * 🚀 OPTIONAL: Clean JSON Output (remove __v)
 */
WatchlistSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Watchlist =
  mongoose.models.Watchlist ||
  mongoose.model("Watchlist", WatchlistSchema);

export default Watchlist;