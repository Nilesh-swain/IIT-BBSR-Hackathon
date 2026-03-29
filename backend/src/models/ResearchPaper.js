import mongoose from "mongoose";

const researchPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    abstract: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    asteroid: {
      id: {
        type: String,
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      isHazardous: {
        type: Boolean,
        default: false,
      },
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    pdfUrl: {
      type: String,
      required: true,
    },
    pdfPublicId: {
      type: String,
      required: true,
    },
    fileName: String,
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorUsername: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactAddress: {
      type: String,
      trim: true,
      default: "",
    },
    institution: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["published"],
      default: "published",
    },
    year: {
      type: String,
      default: () => new Date().getFullYear().toString(),
    },
  },
  { timestamps: true },
);

researchPaperSchema.index({ "asteroid.id": 1, createdAt: -1 });
researchPaperSchema.index({ title: "text", abstract: "text", keywords: "text", "asteroid.name": "text" });

export default mongoose.models.ResearchPaper ||
  mongoose.model("ResearchPaper", researchPaperSchema);
