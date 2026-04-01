import Asteroid from "../models/Asteroid.js";
import ResearchPaper from "../models/ResearchPaper.js";
import User from "../models/userModel.js";
import { sendResearchPublicationNotice } from "../services/emailService.js";

const buildKeywords = (input = "") =>
  input
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 8);

export const listResearchPapers = async (req, res, next) => {
  try {
    const { asteroidId, search = "", limit = 20 } = req.query;
    const query = {};

    if (asteroidId) {
      query["asteroid.id"] = asteroidId;
    }

    if (search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const papers = await ResearchPaper.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10) || 20)
      .lean();

    res.status(200).json({
      success: true,
      count: papers.length,
      papers,
    });
  } catch (error) {
    next(error);
  }
};

export const publishResearchPaper = async (req, res, next) => {
  try {
    const { title, abstract, asteroidId, keywords = "", institution = "" } = req.body;
    const currentUserId = req.user?._id || req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF document is required for publication.",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF research papers can be published.",
      });
    }

    if (!title?.trim() || !abstract?.trim() || !asteroidId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, abstract, and asteroid are required.",
      });
    }

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to publish research.",
      });
    }

    const author = await User.findById(currentUserId).select(
      "name username email address papers",
    );

    if (!author) {
      return res.status(404).json({ success: false, message: "Author not found." });
    }

    const asteroid =
      (await Asteroid.findOne({ neo_reference_id: asteroidId }).lean()) ||
      (await Asteroid.findOne({ name: asteroidId }).lean());

    if (!asteroid) {
      return res.status(404).json({
        success: false,
        message: "Asteroid record not found. Refresh the asteroid registry first.",
      });
    }

    const paper = await ResearchPaper.create({
      title: title.trim(),
      abstract: abstract.trim(),
      asteroid: {
        id: asteroid.neo_reference_id,
        name: asteroid.name,
        isHazardous: asteroid.is_potentially_hazardous_asteroid,
      },
      keywords: buildKeywords(keywords),
      pdfUrl: req.file.path,
      pdfPublicId: req.file.filename,
      fileName: req.file.originalname,
      publishedBy: author._id,
      authorName: author.name || author.username,
      authorUsername: author.username,
      contactEmail: author.email,
      contactAddress: author.address || "",
      institution: institution.trim(),
    });

    const archiveEntry = {
      paperId: paper._id,
      title: paper.title,
      url: paper.pdfUrl,
      asteroidId: paper.asteroid.id,
      asteroidName: paper.asteroid.name,
      abstract: paper.abstract,
      contactEmail: paper.contactEmail,
      institution: paper.institution,
      year: paper.year,
      uploadedAt: paper.createdAt,
    };

    await User.findByIdAndUpdate(author._id, {
      $push: {
        papers: {
          $each: [archiveEntry],
          $position: 0,
        },
      },
    });

    const recipients = await User.find({
      isVerified: true,
      email: { $exists: true, $ne: null },
    })
      .select("email")
      .lean();

    sendResearchPublicationNotice({
      recipients: recipients.map((user) => user.email).filter(Boolean),
      paperTitle: paper.title,
      asteroidName: paper.asteroid.name,
      authorName: paper.authorName,
      contactEmail: paper.contactEmail,
    }).catch(() => null);

    res.status(201).json({
      success: true,
      paper,
      message: "Research paper published successfully.",
    });
  } catch (error) {
    next(error);
  }
};
