import express from "express";
import upload from "../config/cloudinary.js";
import { protect } from "../middlewares/auth.js";
import {
  listResearchPapers,
  publishResearchPaper,
} from "../controllers/researchController.js";

const router = express.Router();

router.get("/", listResearchPapers);
router.post("/publish", protect, upload.single("paper"), publishResearchPaper);

export default router;
