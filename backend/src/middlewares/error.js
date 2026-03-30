const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    // During development, show the actual message
    let message = err.message || "Internal Server Error";

    // 🛡️ Log everything in console for Render Dashboard visibility
    console.error(`🚨 [SYSTEM_ERROR]: ${req.method} ${req.originalUrl} | Status: ${err.statusCode} | Msg: ${err.message}`);
    if (err.stack) console.error(err.stack);

    // Handle Mongoose Duplicate Key
    if (err.code === 11000) {
        message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err.statusCode = 400;
    }

    // Handle JWT Error
    if (err.name === "JsonWebTokenError") {
        message = "Invalid Token. Try again.";
        err.statusCode = 400;
    }

    res.status(err.statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // This shows you the line number!
    });
};

export default errorMiddleware;
