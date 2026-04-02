const stores = new Map();

const now = () => Date.now();

const getClientKey = (req, keyGenerator) => {
  if (typeof keyGenerator === "function") {
    return keyGenerator(req);
  }

  return (
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "unknown"
  );
};

const cleanupBucket = (bucket, windowMs) => {
  const threshold = now() - windowMs;
  return bucket.filter((timestamp) => timestamp > threshold);
};

export const createRateLimit = ({
  windowMs = 60_000,
  max = 10,
  keyGenerator,
  message = "Too many requests. Please try again later.",
}) => {
  return (req, res, next) => {
    const key = `${req.baseUrl}${req.path}:${getClientKey(req, keyGenerator)}`;
    const bucket = cleanupBucket(stores.get(key) || [], windowMs);

    if (bucket.length >= max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil(windowMs / 1000),
      });
    }

    bucket.push(now());
    stores.set(key, bucket);
    next();
  };
};
