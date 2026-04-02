import mongoose from "mongoose";

const authChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["login_otp", "password_reset"],
      index: true,
    },
    otp: {
      type: String,
      required: true,
      match: /^\d{6}$/,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

authChallengeSchema.index({ email: 1, purpose: 1 }, { unique: true });

const AuthChallenge =
  mongoose.models.AuthChallenge ||
  mongoose.model("AuthChallenge", authChallengeSchema);

export default AuthChallenge;
