const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  let message = err.message || "Internal Server Error";
  const payload = {
    scope: "api_exception",
    method: req.method,
    path: req.originalUrl,
    statusCode: err.statusCode,
    message: err.message,
  };

  if (err.code === 11000) {
    message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err.statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    message = "Invalid token. Try again.";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Session expired. Please login again.";
    err.statusCode = 401;
  }

  if (err.name === "ValidationError") {
    message =
      Object.values(err.errors || {})
        .map((entry) => entry.message)
        .filter(Boolean)
        .join(", ") || "Validation failed.";
    err.statusCode = 400;
  }

  console.error(
    JSON.stringify({
      ...payload,
      statusCode: err.statusCode,
      responseMessage: message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    }),
  );

  res.status(err.statusCode).json({
    success: false,
    message,
    errorCode: err.code || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorMiddleware;
