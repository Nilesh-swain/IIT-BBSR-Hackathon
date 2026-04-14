import User from "../models/userModel.js";
import { sendToken } from "../utils/jwtToken.js";
import {
  authenticateUser,
  clearTrustedDeviceCookie,
  completePasswordReset,
  createRegistrationOtp,
  getUserSettings,
  issueCaptchaChallenge,
  requestPasswordReset,
  requestLoginOtp,
  resendRegistrationOtp,
  updateUserSettings,
  verifyLoginOtp,
  verifyPasswordResetOtp,
  verifyRegistrationOtp,
} from "../services/authService.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const user = await User.findById(currentUserId).select("-password").lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Node not found in registry." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, name, bio, address } = req.body;
    const currentUserId = req.user._id || req.user.id;

    const user = await User.findByIdAndUpdate(
      currentUserId,
      { $set: { username, name: name || username, bio, address } },
      { new: true, runValidators: true, context: "query" },
    ).select("-password");

    return res.status(200).json({
      success: true,
      data: user,
      message: "System records updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const currentUserId = req.user._id || req.user.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image payload detected." });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images are allowed.",
      });
    }

    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      currentUserId,
      { $set: { avatarUrl } },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      data: { avatarUrl, user },
      message: "Avatar synchronized with Cloudinary.",
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPaper = async (req, res, next) => {
  try {
    const currentUserId = req.user._id || req.user.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No document payload detected." });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF documents are allowed in the research archive.",
      });
    }

    const newPaper = {
      title: req.body.title || req.file.originalname.replace(/\.[^/.]+$/, ""),
      url: req.file.path,
      year: new Date().getFullYear().toString(),
    };

    const user = await User.findByIdAndUpdate(
      currentUserId,
      {
        $push: {
          papers: {
            $each: [newPaper],
            $position: 0,
          },
        },
      },
      { new: true },
    ).lean();

    return res.status(200).json({
      success: true,
      data: user.papers[0],
      message: "Document archived successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const result = await createRegistrationOtp(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Registration Exception:", error.message);
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const result = await verifyRegistrationOtp(req.body);
    if (!result.user) {
      return res.status(result.status).json(result.body);
    }

    return sendToken(result.user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const result = await authenticateUser({
      ...req.body,
      trustedDeviceToken: req.cookies?.trusted_device,
    });
    if (!result.user) {
      return res.status(result.status).json(result.body);
    }

    return sendToken(result.user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  return res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    })
    .cookie("trusted_device", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    })
    .json({ success: true, message: "Session Terminated." });
};

export const requestLoginOtpController = async (req, res, next) => {
  try {
    const result = await requestLoginOtp(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOtpController = async (req, res, next) => {
  try {
    const result = await verifyLoginOtp({
      ...req.body,
      trustDevice: req.body?.trustDevice === true || req.body?.trustDevice === "true",
      deviceLabel: req.body?.deviceLabel || "Trusted device",
    });
    if (!result.user) {
      return res.status(result.status).json(result.body);
    }

    if (result.trustedDeviceCookie) {
      const isProd = process.env.NODE_ENV === "production";
      res.cookie(result.trustedDeviceCookie.name, result.trustedDeviceCookie.value, {
        ...result.trustedDeviceCookie.options,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
      });
    }

    return sendToken(result.user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (req, res, next) => {
  try {
    const result = await resendRegistrationOtp(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getCaptchaChallenge = async (req, res, next) => {
  try {
    const result = await issueCaptchaChallenge(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await requestPasswordReset(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (req, res, next) => {
  try {
    const result = await verifyPasswordResetOtp(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await completePasswordReset(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const result = await getUserSettings(currentUserId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const result = await updateUserSettings(currentUserId, req.body);

    if (
      req.body?.security?.twoFactor?.enabled === false ||
      result.body?.data?.security?.twoFactor?.enabled === false
    ) {
      const trustedCookie = clearTrustedDeviceCookie();
      res.cookie(trustedCookie.name, trustedCookie.value, trustedCookie.options);
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
};
