import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); // 🌐 Fix DNS issues

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cron from "node-cron";
import { createServer } from "http";

// --- IMPORT MODELS FIRST (IMPORTANT) ---
import "./src/models/Watchlist.js";

// Services & Middlewares
import { fetchAndCacheAsteroids } from "./src/services/nasaService.js";
import errorMiddleware from "./src/middlewares/error.js";

// Routes
import authRoutes from "./src/routes/userRoutes.js";
import asteroidRoutes from "./src/routes/asteroidRoutes.js";
import watchlistRoutes from "./src/routes/watchlistRoutes.js";
import communityRoutes from "./src/routes/communityRoutes.js";
import researchRoutes from "./src/routes/researchRoutes.js";

const app = express();

// --- 1. SECURITY & CORE MIDDLEWARES ---
app.use(
  helmet({
    crossOriginResourcePolicy: false, // 🛡️ Necessary for cross-domain auth
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- 2. CORS CONFIG ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- 3. DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`📡 DB Connected: ${conn.connection.host}`);

    // 🧹 CLEANUP: Remove orphan watchlist items
    const Watchlist = mongoose.model("Watchlist");

    const result = await Watchlist.deleteMany({
      $or: [
        { user: { $exists: false } },
        { user: null },
      ],
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Removed ${result.deletedCount} orphan records`);
    } else {
      console.log("✅ No orphan records found");
    }
  } catch (error) {
    console.error(`❌ DB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

// 🌌 INITIAL SYNC FUNCTION (Robust Data Registry)
const runInitialSync = async () => {
  try {
    const Asteroid = mongoose.model("Asteroid");
    const asteroidCount = await Asteroid.countDocuments();
    
    console.log(`🌌 Registry Status: ${asteroidCount} objects indexed in Atlas.`);

    if (asteroidCount < 20) {
      console.log("🌌 Initializing Data Uplink to NASA API...");
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      await fetchAndCacheAsteroids(today, endDate);
      console.log("✅ Registry Synchronized Successfully.");
    }
  } catch (error) {
    console.error("⚠️ Local Registry Synchronization Failure:", error.message);
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ Production Hint: Ensure NASA_API_KEY is available and Atlas IP whitelist allows connections.");
    }
  }
};

// Start DB then Start Sync (Sync is now decoupled)
await connectDB();
runInitialSync();

// --- 4. HEALTH CHECK ---
app.get("/status", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Active",
    message: "Backend is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// --- 5. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/asteroids", asteroidRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/research", researchRoutes);

// --- 6. 404 HANDLER ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// --- 7. GLOBAL ERROR HANDLER ---
app.use(errorMiddleware);

// --- 8. SERVER ---
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// --- 9. CRON JOB (NASA DATA SYNC) ---
cron.schedule("0 */6 * * *", async () => {
  try {
    console.log("🌌 Updating asteroid cache...");

    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    await fetchAndCacheAsteroids(today, endDate);

    console.log("✅ Cache updated");
  } catch (error) {
    console.error("❌ Cron failed:", error.message);
  }
});

// --- 10. START SERVER ---
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
