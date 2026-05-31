import { Router } from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = Router();

/**
 * Auth Routes
 *
 * POST   /api/v1/auth/signup  — Register a new user
 * POST   /api/v1/auth/login   — Login with email & password
 * POST   /api/v1/auth/logout  — Logout and clear cookie
 */

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
