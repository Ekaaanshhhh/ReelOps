import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/responseHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Auth Controller
 *
 * Thin controller — delegates all business logic to auth.service.js
 */

// ── Cookie options ──────────────────────────────────────────────────
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── POST /api/v1/auth/signup ────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  const { user, token } = await authService.signup(name, email, password, phoneNumber);

  res.cookie("token", token, cookieOptions);

  sendSuccess(res, 201, "Account created successfully.", { user, token });
});

// ── POST /api/v1/auth/login ─────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login(email, password);

  res.cookie("token", token, cookieOptions);

  sendSuccess(res, 200, "Logged in successfully.", { user, token });
});

// ── POST /api/v1/auth/logout ────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  sendSuccess(res, 200, "Logged out successfully.");
});
