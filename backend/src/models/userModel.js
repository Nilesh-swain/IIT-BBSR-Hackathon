import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=ANON" },
    bio: { type: String, default: "Explorer of the vast cosmos." },
    address: { type: String, default: "Odisha, India" },
    role: { type: String, default: "Architect" },
    isVerified: { type: Boolean, default: true },
    papers: [
      {
        title: String,
        url: String,
        asteroidId: String,
        asteroidName: String,
        abstract: String,
        contactEmail: String,
        institution: String,
        paperId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ResearchPaper",
        },
        year: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });

// --- Secure Password Hashing (REFINED) ---
userSchema.pre("save", async function () {
  // If password isn't modified, just exit the function
  if (!this.isModified("password")) return;

  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$")) {
    return;
  }

  // Hash the password - No 'next' needed when using async return
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- Instance Methods ---

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "5d",
  });
};

export default mongoose.model("User", userSchema);
