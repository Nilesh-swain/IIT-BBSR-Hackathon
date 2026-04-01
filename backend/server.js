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
import "./src/models/OtpVerification.js";

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
const PORT = Number(process.env.PORT) || 5000;
const DB_RETRY_DELAYS_MS = [2000, 5000, 10000, 20000];
const allowedOrigins = Array.from(
  new Set(
    [
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      "https://antariksh-ns.onrender.com",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      ...(process.env.CORS_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim()),
    ].filter(Boolean),
  ),
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logEvent = (scope, details = {}) => {
  console.log(
    JSON.stringify({
      scope,
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
};

const getStatusPayload = () => ({
  success: true,
  status: "ok",
  service: "antariksh-api",
  uptimeSeconds: Math.round(process.uptime()),
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
});
const isAllowedOrigin = (origin) => !origin || allowedOrigins.includes(origin);
const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(
      JSON.stringify({
        scope: "cors_blocked",
        origin,
      }),
    );

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// --- 1. SECURITY & CORE MIDDLEWARES ---
app.use(
  helmet({
    crossOriginResourcePolicy: false, // 🛡️ Necessary for cross-domain auth
  })
);
app.use(morgan("dev"));
app.use((req, res, next) => {
  logEvent("api_request", {
    method: req.method,
    path: req.originalUrl,
    origin: req.headers.origin || null,
  });

  const requestOrigin = req.headers.origin;
  if (isAllowedOrigin(requestOrigin) && requestOrigin) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- 2. CORS CONFIG ---
app.use(
  cors(corsOptions)
);

// --- 3. DATABASE CONNECTION ---
const cleanupOrphanWatchlistRecords = async () => {
  const Watchlist = mongoose.model("Watchlist");
  const result = await Watchlist.deleteMany({
    $or: [{ user: { $exists: false } }, { user: null }],
  });

  logEvent("db_cleanup", { deletedCount: result.deletedCount || 0 });
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }

  let lastError;

  for (let attempt = 0; attempt <= DB_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        serverSelectionTimeoutMS: 5000,
      });

      logEvent("db_connected", { host: conn.connection.host });
      await cleanupOrphanWatchlistRecords();
      return conn;
    } catch (error) {
      lastError = error;
      const nextDelay = DB_RETRY_DELAYS_MS[attempt];

      console.error(
        JSON.stringify({
          scope: "db_connection_error",
          attempt: attempt + 1,
          message: error.message,
          nextDelayMs: nextDelay || null,
        }),
      );

      if (!nextDelay) {
        break;
      }

      await sleep(nextDelay);
    }
  }

  throw lastError;
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

// --- 4. HEALTH CHECK & ROOT ---
app.get("/", (req, res) => {
  res.send("Antariksh API is Live and Operational 🚀");
});

app.get("/status", (req, res) => {
  res.status(200).json(getStatusPayload());
});

app.get("/api/status", (req, res) => {
  res.status(200).json(getStatusPayload());
});

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Connectivity confirmed! 🚀",
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
app.use("/{*any}", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// --- 7. GLOBAL ERROR HANDLER ---
app.use(errorMiddleware);

const httpServer = createServer(app);

// --- 10. CRON JOB (NASA DATA SYNC) ---
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

mongoose.connection.on("connected", () => {
  logEvent("db_state", { state: "connected" });
});

mongoose.connection.on("disconnected", () => {
  console.warn(JSON.stringify({ scope: "db_state", state: "disconnected" }));
});

mongoose.connection.on("error", (error) => {
  console.error(
    JSON.stringify({
      scope: "db_state",
      state: "error",
      message: error.message,
    }),
  );
});

const startServer = async () => {
  try {
    await connectDB();
    await runInitialSync();

    httpServer.listen(PORT, "0.0.0.0", () => {
      logEvent("server_started", { port: PORT });
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: "server_boot_failed",
        message: error.message,
      }),
    );
    process.exit(1);
  }
};

startServer();
