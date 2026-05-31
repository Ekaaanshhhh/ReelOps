import { Router } from "express";
import { generateMetadata } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * AI Routes
 *
 * All routes are protected.
 *
 * POST /api/v1/ai/generate-metadata - Generate AI captions, hashtags, and optimized description
 */

router.post("/generate-metadata", protect, generateMetadata);

export default router;
