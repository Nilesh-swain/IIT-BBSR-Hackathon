import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = req.cookies?.token || bearerToken;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Please login to access this resource" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.id)
      .select("_id email username role isVerified")
      .lean();

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid session" });
    }

    req.user = {
      ...user,
      id: user._id?.toString?.() || String(user._id),
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid session" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: `Role ${req.user.role} not authorized` });
    }
    next();
  };
};
