export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();
  const isProduction = process.env.NODE_ENV === "production";

  // Options for cookie — adapt to local dev vs production
  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 5) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction,           // false on localhost (no HTTPS), true in production
    sameSite: isProduction ? "None" : "Lax",  // Lax for localhost, None for cross-domain prod
  };

  // Remove password from the response object
  user.password = undefined;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};