import { Router } from "express";
import { getExecutionHistory } from "../controllers/execution.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/v1/automation/:id/executions
router.get("/:id/executions", protect, getExecutionHistory);

export default router;
