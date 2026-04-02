import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import OtpVerification from "../models/OtpVerification.js";
import AuthChallenge from "../models/AuthChallenge.js";
import CaptchaChallenge from "../models/CaptchaChallenge.js";
import { sendEmail, sendSecurityOtpEmail } from "./emailService.js";

const REGISTRATION_OTP_TTL_MS = 5 * 60 * 1000;
const SECURITY_OTP_TTL_MS = 10 * 60 * 1000;
const CAPTCHA_TTL_MS = 3 * 60 * 1000;
const TRUSTED_DEVICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const AUTH_SESSION_FIELDS =
  "username name email avatarUrl bio address role isVerified notificationPreferences security createdAt updatedAt";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeUsername = (username = "") => username.trim();
const normalizeCaptchaAnswer = (value = "") => String(value).trim();

const buildChallengeToken = () => crypto.randomBytes(24).toString("hex");
const hashToken = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const queueMail = (handler) => {
  setImmediate(() => {
    handler().catch((error) => {
      console.error("Async email dispatch failed:", error.message);
    });
  });
};

const queueOtpEmail = ({ email, otp, subject }) => {
  queueMail(() => sendEmail({ email, otp, subject }));
};

const queueSecurityEmail = ({ email, otp, subject, headline, message }) => {
  queueMail(() =>
    sendSecurityOtpEmail({
      email,
      otp,
      subject,
      headline,
      message,
    }),
  );
};

const createCaptchaPayload = (scope) => {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;
  const answer = String(left + right);
  const token = buildChallengeToken();

  return {
    token,
    scope,
    answer,
    question: `What is ${left} + ${right}?`,
    expiresAt: new Date(Date.now() + CAPTCHA_TTL_MS),
  };
};

const verifyCaptchaChallenge = async ({ scope, captchaToken, captchaAnswer }) => {
  const normalizedToken = String(captchaToken || "").trim();
  const normalizedAnswer = normalizeCaptchaAnswer(captchaAnswer);

  if (!normalizedToken || !normalizedAnswer) {
    return {
      valid: false,
      status: 400,
      body: { success: false, message: "Captcha verification is required." },
    };
  }

  const challenge = await CaptchaChallenge.findOne({
    token: normalizedToken,
    scope,
    expiresAt: { $gt: new Date() },
  });

  if (!challenge) {
    return {
      valid: false,
      status: 400,
      body: { success: false, message: "Captcha expired. Please refresh and try again." },
    };
  }

  if (challenge.answerHash !== hashToken(normalizedAnswer)) {
    return {
      valid: false,
      status: 400,
      body: { success: false, message: "Captcha answer is incorrect." },
    };
  }

  await CaptchaChallenge.deleteOne({ _id: challenge._id });

  return { valid: true };
};

const sanitizeUser = async (userId) =>
  User.findById(userId).select(AUTH_SESSION_FIELDS).lean();

const getTrustedDeviceMatch = (user, trustedDeviceToken) => {
  if (!trustedDeviceToken || !user?.security?.trustedDevices?.length) {
    return null;
  }

  const trustedTokenHash = hashToken(trustedDeviceToken);
  const now = Date.now();

  return (
    user.security.trustedDevices.find(
      (device) =>
        device.tokenHash === trustedTokenHash &&
        new Date(device.expiresAt).getTime() > now,
    ) || null
  );
};

const createAuthChallenge = async ({
  email,
  userId,
  purpose,
  metadata = {},
  ttlMs = SECURITY_OTP_TTL_MS,
}) => {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + ttlMs);

  await AuthChallenge.findOneAndUpdate(
    { email, purpose },
    {
      $set: {
        userId,
        otp,
        expiresAt,
        metadata,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  return { otp, expiresAt };
};

const createTrustedDevicePayload = (deviceLabel = "Trusted device") => {
  const token = buildChallengeToken();
  const tokenHash = hashToken(token);

  return {
    rawToken: token,
    record: {
      tokenHash,
      label: deviceLabel.trim() || "Trusted device",
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + TRUSTED_DEVICE_TTL_MS),
    },
  };
};

export const buildTrustedDeviceCookie = (token) => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: "trusted_device",
    value: token,
    options: {
      expires: new Date(Date.now() + TRUSTED_DEVICE_TTL_MS),
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
    },
  };
};

export const clearTrustedDeviceCookie = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: "trusted_device",
    value: "",
    options: {
      expires: new Date(0),
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
    },
  };
};

export const issueCaptchaChallenge = async ({ scope }) => {
  const normalizedScope = scope === "login" ? "login" : "signup";
  const captcha = createCaptchaPayload(normalizedScope);

  await CaptchaChallenge.create({
    token: captcha.token,
    scope: normalizedScope,
    answerHash: hashToken(captcha.answer),
    question: captcha.question,
    expiresAt: captcha.expiresAt,
  });

  return {
    status: 201,
    body: {
      success: true,
      data: {
        scope: normalizedScope,
        token: captcha.token,
        question: captcha.question,
        expiresInSeconds: CAPTCHA_TTL_MS / 1000,
      },
    },
  };
};

export const createRegistrationOtp = async ({
  username,
  name,
  email,
  password,
  captchaToken,
  captchaAnswer,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  const normalizedName = name?.trim() || normalizedUsername;

  if (!normalizedUsername || !normalizedEmail || !password) {
    return {
      status: 400,
      body: { success: false, message: "Username, email, and password are required." },
    };
  }

  if (password.length < 6) {
    return {
      status: 400,
      body: { success: false, message: "Password must be at least 6 characters long." },
    };
  }

  const captchaCheck = await verifyCaptchaChallenge({
    scope: "signup",
    captchaToken,
    captchaAnswer,
  });

  if (!captchaCheck.valid) {
    return {
      status: captchaCheck.status,
      body: captchaCheck.body,
    };
  }

  const [existingEmailUser, existingUsernameUser] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select("_id isVerified username email"),
    User.findOne({ username: normalizedUsername }).select("_id isVerified username email"),
  ]);

  if (existingEmailUser?.isVerified) {
    return {
      status: 409,
      body: { success: false, message: "Identity already registered. Please login." },
    };
  }

  if (
    existingUsernameUser?.isVerified ||
    (existingUsernameUser &&
      existingEmailUser &&
      existingUsernameUser._id.toString() !== existingEmailUser._id.toString())
  ) {
    return {
      status: 409,
      body: { success: false, message: "Username is already in use." },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + REGISTRATION_OTP_TTL_MS);
  let pendingUser = existingEmailUser || existingUsernameUser || null;

  if (pendingUser) {
    pendingUser.username = normalizedUsername;
    pendingUser.name = normalizedName;
    pendingUser.email = normalizedEmail;
    pendingUser.password = passwordHash;
    pendingUser.isVerified = false;
    await pendingUser.save();
  } else {
    pendingUser = await User.create({
      username: normalizedUsername,
      name: normalizedName,
      email: normalizedEmail,
      password: passwordHash,
      isVerified: false,
    });
  }

  await OtpVerification.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        username: normalizedUsername,
        name: normalizedName,
        userId: pendingUser._id,
        passwordHash,
        otp,
        expiresAt,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  await sendEmail({
    email: normalizedEmail,
    otp,
    subject: "Antariksh Security Protocol: Verification OTP",
  });

  console.log(
    JSON.stringify({
      scope: "registration_otp_issued",
      email: normalizedEmail,
      userId: pendingUser._id,
      timestamp: new Date().toISOString(),
    }),
  );

  return {
    status: 202,
    body: {
      success: true,
      verificationRequired: true,
      stage: "otp_pending",
      verificationType: "registration",
      message: "Verification OTP sent. Please check your email.",
      email: normalizedEmail,
      expiresInSeconds: REGISTRATION_OTP_TTL_MS / 1000,
    },
  };
}

export const verifyRegistrationOtp = async ({ email, otp }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || "").trim();

  const pendingVerification = await OtpVerification.findOne({
    email: normalizedEmail,
    otp: normalizedOtp,
    expiresAt: { $gt: new Date() },
  });

  if (!pendingVerification) {
    return {
      status: 400,
      body: { success: false, message: "Invalid or expired key." },
    };
  }

  const user =
    (pendingVerification.userId
      ? await User.findById(pendingVerification.userId)
      : await User.findOne({ email: normalizedEmail })) ||
    null;

  if (!user) {
    return {
      status: 404,
      body: { success: false, message: "Pending account not found. Please register again." },
    };
  }

  user.username = pendingVerification.username;
  user.name = pendingVerification.name || pendingVerification.username;
  user.email = pendingVerification.email;
  user.password = pendingVerification.passwordHash;
  user.isVerified = true;
  await user.save();

  await OtpVerification.deleteOne({ _id: pendingVerification._id });

  console.log(
    JSON.stringify({
      scope: "registration_verified",
      email: normalizedEmail,
      userId: user._id,
      timestamp: new Date().toISOString(),
    }),
  );

  return { status: 200, user };
};

export const resendRegistrationOtp = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);

  const [existingUser, pendingVerification] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select("_id isVerified").lean(),
    OtpVerification.findOne({ email: normalizedEmail }),
  ]);

  if (existingUser?.isVerified) {
    return {
      status: 400,
      body: { success: false, message: "Identity already verified. Please login." },
    };
  }

  if (!pendingVerification) {
    return {
      status: 404,
      body: { success: false, message: "No pending verification found for this email." },
    };
  }

  pendingVerification.otp = generateOtp();
  pendingVerification.expiresAt = new Date(Date.now() + REGISTRATION_OTP_TTL_MS);
  await pendingVerification.save();

  await sendEmail({
    email: pendingVerification.email,
    otp: pendingVerification.otp,
    subject: "Antariksh Security Protocol: New Verification OTP",
  });

  return {
    status: 202,
    body: {
      success: true,
      verificationRequired: true,
      stage: "otp_pending",
      verificationType: "registration",
      message: "A new OTP has been queued for delivery.",
      email: pendingVerification.email,
      expiresInSeconds: REGISTRATION_OTP_TTL_MS / 1000,
    },
  };
};

export const authenticateUser = async ({
  email,
  password,
  captchaToken,
  captchaAnswer,
  trustedDeviceToken,
}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return {
      status: 400,
      body: { success: false, message: "Email and password are required." },
    };
  }

  const captchaCheck = await verifyCaptchaChallenge({
    scope: "login",
    captchaToken,
    captchaAnswer,
  });

  if (!captchaCheck.valid) {
    return {
      status: captchaCheck.status,
      body: captchaCheck.body,
    };
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    `${AUTH_SESSION_FIELDS} +password`,
  );

  if (!user || !(await user.comparePassword(password))) {
    return {
      status: 401,
      body: { success: false, message: "Access Denied: Invalid Credentials." },
    };
  }

  if (!user.isVerified) {
    return {
      status: 403,
      body: { success: false, message: "Account pending verification." },
    };
  }

  const trustedMatch = getTrustedDeviceMatch(user, trustedDeviceToken);

  if (trustedMatch) {
    await User.updateOne(
      {
        _id: user._id,
        "security.trustedDevices.tokenHash": trustedMatch.tokenHash,
      },
      {
        $set: {
          "security.trustedDevices.$.lastUsedAt": new Date(),
          "security.trustedDevices.$.expiresAt": new Date(Date.now() + TRUSTED_DEVICE_TTL_MS),
        },
      },
    );

    console.log(
      JSON.stringify({
        scope: "login_success",
        email: normalizedEmail,
        trustedDevice: true,
        timestamp: new Date().toISOString(),
      }),
    );

    return { status: 200, user };
  }

  console.log(
    JSON.stringify({
      scope: "login_success",
      email: normalizedEmail,
      trustedDevice: false,
      timestamp: new Date().toISOString(),
    }),
  );

  return { status: 200, user };
};

export const verifyLoginOtp = async ({
  email,
  otp,
  challengeToken,
  trustDevice = false,
  deviceLabel = "Trusted device",
}) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || "").trim();
  const normalizedChallengeToken = String(challengeToken || "").trim();

  if (!normalizedEmail || !normalizedOtp || !normalizedChallengeToken) {
    return {
      status: 400,
      body: { success: false, message: "Email, OTP, and challenge token are required." },
    };
  }

  const challenge = await AuthChallenge.findOne({
    email: normalizedEmail,
    purpose: "login_otp",
    otp: normalizedOtp,
    expiresAt: { $gt: new Date() },
  });

  if (!challenge) {
    return {
      status: 400,
      body: { success: false, message: "Invalid or expired login verification code." },
    };
  }

  if (challenge.metadata?.challengeTokenHash !== hashToken(normalizedChallengeToken)) {
    return {
      status: 400,
      body: { success: false, message: "Login verification session is invalid." },
    };
  }

  const user = await User.findById(challenge.userId).select(`${AUTH_SESSION_FIELDS} +password`);

  if (!user || !user.isVerified) {
    return {
      status: 404,
      body: { success: false, message: "Verified account not found." },
    };
  }

  let trustedDeviceCookie = null;

  if (trustDevice) {
    const trustedDevice = createTrustedDevicePayload(deviceLabel);
    user.security = user.security || {};
    user.security.trustedDevices = (user.security.trustedDevices || []).filter(
      (device) => new Date(device.expiresAt).getTime() > Date.now(),
    );
    user.security.trustedDevices.unshift(trustedDevice.record);
    user.security.trustedDevices = user.security.trustedDevices.slice(0, 5);
    await user.save();
    trustedDeviceCookie = buildTrustedDeviceCookie(trustedDevice.rawToken);
  }

  await AuthChallenge.deleteOne({ _id: challenge._id });

  return { status: 200, user, trustedDeviceCookie };
};

export const resendLoginOtp = async ({ email, challengeToken }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedChallengeToken = String(challengeToken || "").trim();

  const challenge = await AuthChallenge.findOne({
    email: normalizedEmail,
    purpose: "login_otp",
    expiresAt: { $gt: new Date() },
  });

  if (!challenge) {
    return {
      status: 404,
      body: { success: false, message: "Login verification session not found." },
    };
  }

  if (challenge.metadata?.challengeTokenHash !== hashToken(normalizedChallengeToken)) {
    return {
      status: 400,
      body: { success: false, message: "Login verification session is invalid." },
    };
  }

  challenge.otp = generateOtp();
  challenge.expiresAt = new Date(Date.now() + SECURITY_OTP_TTL_MS);
  await challenge.save();

  queueSecurityEmail({
    email: normalizedEmail,
    otp: challenge.otp,
    subject: "Antariksh Login Verification Code",
    headline: "Login Verification",
    message: "Here is your new login verification code.",
  });

  return {
    status: 202,
    body: {
      success: true,
      verificationRequired: true,
      stage: "login_otp_pending",
      verificationType: "login",
      message: "A fresh login verification code was sent.",
      email: normalizedEmail,
      challengeToken: normalizedChallengeToken,
      expiresInSeconds: SECURITY_OTP_TTL_MS / 1000,
    },
  };
};

export const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return {
      status: 400,
      body: { success: false, message: "Email is required." },
    };
  }

  const user = await User.findOne({ email: normalizedEmail }).select("_id email isVerified");

  if (!user || !user.isVerified) {
    return {
      status: 200,
      body: {
        success: true,
        message: "If this account exists, password reset instructions were sent.",
      },
    };
  }

  const resetToken = buildChallengeToken();
  const { otp } = await createAuthChallenge({
    email: user.email,
    userId: user._id,
    purpose: "password_reset",
    metadata: {
      resetTokenHash: hashToken(resetToken),
    },
  });

  await sendSecurityOtpEmail({
    email: user.email,
    otp,
    subject: "Antariksh Password Reset Code",
    headline: "Password Reset",
    message: "Use this code to verify your password reset request.",
  });

  return {
    status: 202,
    body: {
      success: true,
      resetRequired: true,
      verificationType: "password_reset",
      message: "Password reset OTP sent to your email.",
      email: user.email,
      resetToken,
      expiresInSeconds: SECURITY_OTP_TTL_MS / 1000,
    },
  };
};

export const verifyPasswordResetOtp = async ({ email, otp, resetToken }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || "").trim();
  const normalizedResetToken = String(resetToken || "").trim();

  if (!normalizedEmail || !normalizedOtp || !normalizedResetToken) {
    return {
      status: 400,
      body: { success: false, message: "Email, OTP, and reset token are required." },
    };
  }

  const challenge = await AuthChallenge.findOne({
    email: normalizedEmail,
    purpose: "password_reset",
    otp: normalizedOtp,
    expiresAt: { $gt: new Date() },
  });

  if (!challenge) {
    return {
      status: 400,
      body: { success: false, message: "Invalid or expired password reset code." },
    };
  }

  if (challenge.metadata?.resetTokenHash !== hashToken(normalizedResetToken)) {
    return {
      status: 400,
      body: { success: false, message: "Password reset session is invalid." },
    };
  }

  const passwordResetGrant = buildChallengeToken();

  challenge.metadata = {
    ...challenge.metadata,
    resetTokenHash: hashToken(normalizedResetToken),
    passwordResetGrantHash: hashToken(passwordResetGrant),
    otpVerifiedAt: new Date().toISOString(),
  };
  await challenge.save();

  return {
    status: 200,
    body: {
      success: true,
      passwordResetVerified: true,
      message: "Reset code verified. You can now set a new password.",
      email: normalizedEmail,
      resetToken: normalizedResetToken,
      passwordResetGrant,
    },
  };
};

export const completePasswordReset = async ({
  email,
  resetToken,
  passwordResetGrant,
  newPassword,
}) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedResetToken = String(resetToken || "").trim();
  const normalizedGrant = String(passwordResetGrant || "").trim();

  if (!normalizedEmail || !normalizedResetToken || !normalizedGrant || !newPassword) {
    return {
      status: 400,
      body: { success: false, message: "All password reset fields are required." },
    };
  }

  if (newPassword.length < 6) {
    return {
      status: 400,
      body: { success: false, message: "Password must be at least 6 characters long." },
    };
  }

  const challenge = await AuthChallenge.findOne({
    email: normalizedEmail,
    purpose: "password_reset",
    expiresAt: { $gt: new Date() },
  });

  if (!challenge) {
    return {
      status: 400,
      body: { success: false, message: "Password reset session has expired." },
    };
  }

  if (
    challenge.metadata?.resetTokenHash !== hashToken(normalizedResetToken) ||
    challenge.metadata?.passwordResetGrantHash !== hashToken(normalizedGrant)
  ) {
    return {
      status: 400,
      body: { success: false, message: "Password reset authorization is invalid." },
    };
  }

  const user = await User.findById(challenge.userId).select("+password");

  if (!user) {
    return {
      status: 404,
      body: { success: false, message: "User account not found." },
    };
  }

  user.password = newPassword;
  user.security = user.security || {};
  user.security.trustedDevices = [];
  await user.save();

  await AuthChallenge.deleteOne({ _id: challenge._id });

  return {
    status: 200,
    body: {
      success: true,
      message: "Password reset complete. Please login with your new password.",
    },
  };
};

export const getUserSettings = async (userId) => {
  const user = await sanitizeUser(userId);

  if (!user) {
    return {
      status: 404,
      body: { success: false, message: "User not found." },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      data: {
        notificationPreferences: user.notificationPreferences,
        security: user.security,
      },
    },
  };
};

export const updateUserSettings = async (userId, payload = {}) => {
  const update = {};

  if (payload.notificationPreferences) {
    update.notificationPreferences = {
      emailUpdates: Boolean(payload.notificationPreferences.emailUpdates),
      webNotifications: Boolean(payload.notificationPreferences.webNotifications),
      desktopNotifications: Boolean(payload.notificationPreferences.desktopNotifications),
      smsUpdates: Boolean(payload.notificationPreferences.smsUpdates),
      soundEffects: Boolean(payload.notificationPreferences.soundEffects),
    };
  }

  if (payload.security?.twoFactor) {
    update["security.twoFactor.enabled"] = Boolean(payload.security.twoFactor.enabled);
    update["security.twoFactor.method"] =
      payload.security.twoFactor.method === "trusted_device" ? "trusted_device" : "otp";
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: update },
    { new: true, runValidators: true },
  ).select(AUTH_SESSION_FIELDS);

  if (!user) {
    return {
      status: 404,
      body: { success: false, message: "User not found." },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      message: "Settings updated successfully.",
      data: {
        notificationPreferences: user.notificationPreferences,
        security: user.security,
      },
    },
  };
};
