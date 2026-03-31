import User from "../models/userModel.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../services/emailService.js";

/**
 * @desc    Get Current User Profile
 * @route   GET /api/auth/profile
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpire",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Node not found in registry." });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Profile Text Data
 * @route   PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { username, name, bio, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username, name: name || username, bio, address } },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpire");

    res.status(200).json({
      success: true,
      data: user,
      message: "System records updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload Avatar to Cloudinary
 * @route   POST /api/auth/upload-avatar
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image payload detected." });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid file type. Only images are allowed.",
        });
    }

    // req.file.path is the secure URL provided by the Cloudinary storage engine
    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatarUrl } },
      { new: true },
    ).select("-password -otp -otpExpire");

    res.status(200).json({
      success: true,
      data: { avatarUrl },
      message: "Avatar synchronized with Cloudinary.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Archive New Research Paper (Document)
 * @route   POST /api/auth/upload-paper
 */
export const uploadPaper = async (req, res, next) => {
  try {
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
      url: req.file.path, // Cloudinary PDF/Raw URL
      year: new Date().getFullYear().toString(),
    };

    // $push with $position: 0 ensures the newest paper appears at the top of the UI list
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          papers: {
            $each: [newPaper],
            $position: 0,
          },
        },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      data: user.papers[0],
      message: "Document archived successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register New User (Identity Protocol)
 */
export const registerUser = async (req, res, next) => {
  try {
    const { username, name, email, password } = req.body;
    console.log(">> Incoming Registration Uplink:", { username, email });

    if (!username || !email || !password) {
      console.warn(">> Registration Failed: Incomplete Payload");
      return res.status(400).json({ success: false, message: "Incomplete credentials." });
    }

    let user = await User.findOne({ email });
    if (user) {
      console.warn(">> Registration Failed: Duplicate Email", email);
      return res.status(409).json({ success: false, message: "Identity already registered. Please login." });
    }

    user = new User({ username, name: name || username, email, password });
    const otp = user.generateOTP();
    
    console.log(">> Attempting Database Persistence for:", email);
    await user.save();
    console.log(">> Database Persistence Successful:", email);

    // Respond IMMEDIATELY — don't wait for email
    res.status(201).json({ success: true, message: "Identity registered. OTP dispatched." });

    // Fire-and-forget: send OTP email in the background
    sendEmail({
      email: user.email,
      subject: "Antariksh Security Protocol: Verification OTP",
      otp,
    }).then(() => {
      console.log(">> OTP Email sent successfully to:", email);
    }).catch((err) => {
      console.error(">> Mail Relay Failure (background):", err.message);
    });
  } catch (error) {
    console.error(">> Registration Exception:", error.message);
    next(error);
  }
};

/**
 * @desc    Verify OTP and Issue Token
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired key." });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login Operator
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // select("+password") is required because password is set to select: false in schema
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Access Denied: Invalid Credentials.",
        });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Account pending verification." });
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout and Terminate Session
 */
export const logout = (req, res) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({ success: true, message: "Session Terminated." });
};

/**
 * @desc    Resend OTP to Pending User
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "Identity not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Identity already verified. Please login." });
    }

    const otp = user.generateOTP();
    await user.save();

    // Respond IMMEDIATELY
    res.status(200).json({ success: true, message: "New OTP dispatched." });

    // Fire-and-forget: send email in background
    sendEmail({
      email: user.email,
      subject: "Antariksh Security Protocol: New Verification OTP",
      otp,
    }).then(() => {
      console.log(">> Resend OTP Email sent to:", email);
    }).catch((err) => {
      console.error(">> Mail Relay Failure (Resend):", err.message);
    });
  } catch (error) {
    next(error);
  }
};
