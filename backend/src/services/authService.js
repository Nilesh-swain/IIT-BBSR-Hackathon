import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import OtpVerification from "../models/OtpVerification.js";
import { sendEmail } from "./emailService.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const AUTH_SESSION_FIELDS =
  "username name email avatarUrl bio address role isVerified createdAt updatedAt";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeUsername = (username = "") => username.trim();

const queueOtpEmail = ({ email, otp, subject }) => {
  setImmediate(() => {
    sendEmail({ email, otp, subject }).catch((error) => {
      console.error("OTP email dispatch failed:", {
        email,
        message: error.message,
      });
    });
  });
};

export const createRegistrationOtp = async ({ username, name, email, password }) => {
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

  const [existingEmailUser, existingUsernameUser] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select("_id").lean(),
    User.findOne({ username: normalizedUsername }).select("_id").lean(),
  ]);

  if (existingEmailUser) {
    return {
      status: 409,
      body: { success: false, message: "Identity already registered. Please login." },
    };
  }

  if (existingUsernameUser) {
    return {
      status: 409,
      body: { success: false, message: "Username is already in use." },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await OtpVerification.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        username: normalizedUsername,
        name: normalizedName,
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

  queueOtpEmail({
    email: normalizedEmail,
    otp,
    subject: "Antariksh Security Protocol: Verification OTP",
  });

  return {
    status: 202,
    body: {
      success: true,
      message: "Verification OTP sent. Please check your email.",
      email: normalizedEmail,
      expiresInSeconds: OTP_TTL_MS / 1000,
    },
  };
};

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

  const [existingEmailUser, existingUsernameUser] = await Promise.all([
    User.findOne({ email: normalizedEmail }).select("_id").lean(),
    User.findOne({ username: pendingVerification.username }).select("_id").lean(),
  ]);

  if (existingEmailUser || existingUsernameUser) {
    await OtpVerification.deleteOne({ _id: pendingVerification._id });
    return {
      status: 409,
      body: { success: false, message: "Identity already registered. Please login." },
    };
  }

  const user = await User.create({
    username: pendingVerification.username,
    name: pendingVerification.name || pendingVerification.username,
    email: pendingVerification.email,
    password: pendingVerification.passwordHash,
    isVerified: true,
  });

  await OtpVerification.deleteOne({ _id: pendingVerification._id });

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
  pendingVerification.expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await pendingVerification.save();

  queueOtpEmail({
    email: pendingVerification.email,
    otp: pendingVerification.otp,
    subject: "Antariksh Security Protocol: New Verification OTP",
  });

  return {
    status: 202,
    body: {
      success: true,
      message: "A new OTP has been queued for delivery.",
      email: pendingVerification.email,
      expiresInSeconds: OTP_TTL_MS / 1000,
    },
  };
};

export const authenticateUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return {
      status: 400,
      body: { success: false, message: "Email and password are required." },
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

  return { status: 200, user };
};
