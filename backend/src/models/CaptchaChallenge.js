import mongoose from "mongoose";

const captchaChallengeSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    scope: {
      type: String,
      required: true,
      enum: ["signup", "login"],
      index: true,
    },
    answerHash: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true },
);

const CaptchaChallenge =
  mongoose.models.CaptchaChallenge ||
  mongoose.model("CaptchaChallenge", captchaChallengeSchema);

export default CaptchaChallenge;
