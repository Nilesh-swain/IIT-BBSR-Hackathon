import express from "express";
import { protect } from "../middlewares/auth.js";
import upload from "../config/cloudinary.js";
import {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} from "../controllers/communityController.js";

// mergeParams: true is excellent for nested asteroid routes
const router = express.Router({ mergeParams: true });

/**
 * ASTEROID SPECIFIC FEED
 * GET  /api/community/:asteroidId/posts -> Publicly viewable
 * POST /api/community/:asteroidId/posts -> Protected (Must be logged in)
 */
router
  .route("/:asteroidId/posts")
  .get(getPosts) 
  .post(protect, upload.single("attachment"), createPost);

/**
 * INTERACTION ROUTES
 * These focus on a specific Post ID.
 * We apply 'protect' at the route level to keep the code DRY (Don't Repeat Yourself).
 */
router.use(protect); // All routes below this line will now require authentication

router.put("/posts/:postId/like", toggleLike);
router.post("/posts/:postId/comment", addComment);

export default router;
