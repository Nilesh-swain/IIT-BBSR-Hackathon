import "dotenv/config";
import dns from "node:dns";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cron from "node-cron";
import { createServer } from "http";

import "./src/models/Watchlist.js";
import "./src/models/OtpVerification.js";
import "./src/models/AuthChallenge.js";
import "./src/models/CaptchaChallenge.js";

import { fetchAndCacheAsteroids } from "./src/services/nasaService.js";
import { verifyMailConnection } from "./src/services/emailService.js";
import errorMiddleware from "./src/middlewares/error.js";

import authRoutes from "./src/routes/userRoutes.js";
import asteroidRoutes from "./src/routes/asteroidRoutes.js";
import watchlistRoutes from "./src/routes/watchlistRoutes.js";
import communityRoutes from "./src/routes/communityRoutes.js";
import researchRoutes from "./src/routes/researchRoutes.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 5000;
const DATABASE_NAME = process.env.MONGO_DB_NAME || "antariksh";
const DB_RETRY_DELAYS_MS = [2000, 5000, 10000, 20000];
const isProduction = process.env.NODE_ENV === "production";

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
  const logObject = {
    scope,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    ...details,
  };

  if (isProduction) {
    console.log(JSON.stringify(logObject));
  } else {
    const detailStr = Object.keys(details).length ? JSON.stringify(details) : "";
    console.log(`\x1b[36m[${logObject.timestamp}]\x1b[0m \x1b[33m[${scope}]\x1b[0m ${detailStr}`);
  }
};

const getStatusPayload = () => ({
  success: true,
  status: "ok",
  service: "antariksh-api",
  version: "2.1.0",
  uptimeSeconds: Math.round(process.uptime()),
  environment: process.env.NODE_ENV || "development",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  databaseName: mongoose.connection.name || DATABASE_NAME,
  memoryUsage: process.memoryUsage(),
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

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  logEvent("api_request", {
    method: req.method,
    path: req.originalUrl,
    origin: req.headers.origin || null,
  });
  next();
});

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
        dbName: DATABASE_NAME,
        family: 4,
        serverSelectionTimeoutMS: 5000,
      });

      logEvent("db_connected", {
        host: conn.connection.host,
        databaseName: conn.connection.name,
      });

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

const runInitialSync = async () => {
  try {
    const Asteroid = mongoose.model("Asteroid");
    const asteroidCount = await Asteroid.countDocuments();

    logEvent("asteroid_registry_status", { asteroidCount });

    if (asteroidCount < 20) {
      const today = new Date().toISOString().split("T")[0];
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      await fetchAndCacheAsteroids(today, endDate);
      logEvent("asteroid_registry_sync_complete");
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: "asteroid_registry_sync_failed",
        message: error.message,
      }),
    );
  }
};

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Antariksh API is live and operational.",
  });
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
    message: "Connectivity confirmed.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/asteroids", asteroidRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/research", researchRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorMiddleware);

cron.schedule("0 */6 * * *", async () => {
  try {
    logEvent("asteroid_cache_refresh_started");

    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    await fetchAndCacheAsteroids(today, endDate);
    logEvent("asteroid_cache_refresh_complete");
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: "asteroid_cache_refresh_failed",
        message: error.message,
      }),
    );
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
    const mailReady = await verifyMailConnection();

    if (!mailReady) {
      console.warn("Mail system is not ready. Registration will be offline.");
    }

    if (!isProduction || String(process.env.ENABLE_NASA_SYNC_ON_BOOT || "true") === "true") {
      await runInitialSync();
    }

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
