import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // The author of the post
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "Post must have an author"],
      index: true // Optimized for fetching "My Posts"
    },

    // Reference to the NASA Asteroid ID
    // We keep this as a String since NASA IDs are not ObjectIds
    asteroid: { 
      type: String, 
      required: [true, "Asteroid ID is required for community posts"],
      index: true // Optimized for fetching the "Asteroid Feed"
    },

    content: { 
      type: String, 
      maxlength: [500, "Post exceeds 500 character limit"],
      trim: true,
      default: ""
    },

    category: {
      type: String,
      enum: ["THREAT_REPORTS", "INTEL_UPLINK", "CORE_ANOMALIES"],
      default: "CORE_ANOMALIES",
      index: true
    },

    attachment: {
      url: String,
      publicId: String,
      resourceType: {
        type: String,
        enum: ["image", "video", "raw"]
      },
      mimeType: String,
      originalName: String,
      format: String,
      bytes: Number
    },

    // Array of User IDs who liked the post
    likes: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ],

    comments: [
      {
        user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User",
          required: true 
        },
        content: { 
          type: String, 
          required: true,
          trim: true 
        },
        createdAt: { 
          type: Date, 
          default: Date.now 
        },
      },
    ],
  },
  { 
    timestamps: true,
    // This allows us to calculate virtuals like 'likeCount' if needed
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * INDEXING: 
 * Ensures that when you fetch posts for a specific asteroid, 
 * the database doesn't have to scan every single post.
 */
postSchema.index({ asteroid: 1, createdAt: -1 });
postSchema.index({ asteroid: 1, category: 1, createdAt: -1 });

// Virtual for getting the number of likes without sending the whole array
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

postSchema.pre("validate", function () {
  const hasContent = Boolean(this.content && this.content.trim().length > 0);
  const hasAttachment = Boolean(this.attachment?.url);

  if (!hasContent && !hasAttachment) {
    this.invalidate("content", "Post content or attachment is required");
  }
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
