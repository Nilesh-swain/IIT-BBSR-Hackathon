export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 5) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // 🛡️ CRITICAL: Prevents frontend JS from reading the token (Anti-XSS)
    secure: true, // Always true for cross-site cookies
    sameSite: "None", // 🛡️ CRITICAL for cross-domain auth on Render
  };

  // Remove password from the response object
  user.password = undefined;

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token, // We send it in JSON too just for Postman visibility, but the Browser will use the Cookie.
  });
};