import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const cloudinaryUrl =
  process.env.CLOUDINARY_URL?.trim() || process.env.VITE_CLOUDINARY_URL?.trim();

if (cloudinaryUrl) {
  process.env.CLOUDINARY_URL = cloudinaryUrl;
}

if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  cloudinary.config(true);
}

const isCloudinaryConfigured = () => {
  const cloudinaryConfig = cloudinary.config();
  return Boolean(
    cloudinaryConfig.cloud_name && cloudinaryConfig.api_key && cloudinaryConfig.api_secret,
  );
};

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

const resolveFolder = (fieldName = "file") => {
  if (fieldName === "avatar") return "antariksh_archive/avatars";
  if (fieldName === "paper") return "antariksh_archive/papers";
  if (fieldName === "attachment") return "antariksh_archive/community";
  return "antariksh_archive/misc";
};

const resolveResourceType = (mimetype = "") => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: resolveFolder(file.fieldname),
      resource_type: resolveResourceType(file.mimetype),
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      use_filename: true,
      unique_filename: true,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!isCloudinaryConfigured()) {
      return cb(
        new Error(
          "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env.",
        ),
      );
    }

    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Unsupported file type. Upload image, video, or PDF only."));
    }

    cb(null, true);
  },
});

export default upload;
