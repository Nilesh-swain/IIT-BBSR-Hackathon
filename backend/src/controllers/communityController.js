import Post from "../models/Post.js";

const VALID_CATEGORIES = ["THREAT_REPORTS", "INTEL_UPLINK", "CORE_ANOMALIES"];

const populatePostQueryRelations = (query) =>
  query
    .populate("user", "username name avatarUrl")
    .populate("comments.user", "username name avatarUrl");

const populatePostDocumentRelations = async (post) => {
  if (!post) return post;

  await post.populate("user", "username name avatarUrl");
  await post.populate("comments.user", "username name avatarUrl");

  return post;
};

const buildAttachmentPayload = (file) => {
  if (!file) return undefined;

  return {
    url: file.path,
    publicId: file.filename,
    resourceType: file.resource_type || file.mimetype?.split("/")[0] || "raw",
    mimeType: file.mimetype,
    originalName: file.originalname,
    format: file.format,
    bytes: file.size,
  };
};

/**
 * @desc    Create new post for a specific asteroid
 * @route   POST /api/community/:asteroidId/posts
 * @access  Private
 */
export const createPost = async (req, res, next) => {
  try {
    const { content = "", category } = req.body;
    const { asteroidId } = req.params;
    const trimmedContent = content.trim();

    if (!trimmedContent && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Post content or attachment is required",
      });
    }

    const post = await Post.create({
      user: req.user.id,
      asteroid: asteroidId,
      content: trimmedContent,
      category: VALID_CATEGORIES.includes(category) ? category : "CORE_ANOMALIES",
      attachment: buildAttachmentPayload(req.file),
    });

    const populatedPost = await populatePostDocumentRelations(post);

    res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated posts for a specific asteroid
 * @route   GET /api/community/:asteroidId/posts
 * @access  Public
 */
export const getPosts = async (req, res, next) => {
  try {
    const { asteroidId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const posts = await populatePostQueryRelations(Post.find({ asteroid: asteroidId }))
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Atomic Like/Unlike (Prevents race conditions)
 * @route   PUT /api/community/posts/:postId/like
 * @access  Private
 */
export const toggleLike = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isLiked = post.likes.some((likeId) => likeId.toString() === userId.toString());
    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.postId, update, {
      new: true,
    });

    const populatedPost = await populatePostDocumentRelations(updatedPost);

    res.status(200).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to a post
 * @route   POST /api/community/posts/:postId/comment
 * @access  Private
 */
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $push: {
          comments: {
            user: req.user.id,
            content: content.trim(),
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const populatedPost = await populatePostDocumentRelations(post);

    res.status(200).json({
      success: true,
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};
