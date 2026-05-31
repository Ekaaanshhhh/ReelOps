import { Router } from "express";
import {
  getCurrentProfile,
  updateCurrentProfile,
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

/**
 * Profile Routes
 * 
 * All routes are protected.
 * 
 * GET /api/v1/profile        - Get current profile and connected platforms
 * PUT /api/v1/profile/update - Update current profile
 */

router.get("/", protect, getCurrentProfile);
router.put("/update", protect, updateCurrentProfile);

export default router;
