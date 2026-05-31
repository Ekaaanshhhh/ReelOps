import * as profileService from "../services/profile.service.js";
import { sendSuccess } from "../utils/responseHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Get the current user's profile and connected platforms
 */
export const getCurrentProfile = asyncHandler(async (req, res) => {
  const data = await profileService.getProfile(req.user._id);
  sendSuccess(res, 200, "Profile retrieved successfully", data);
});

/**
 * Update the current user's profile
 */
export const updateCurrentProfile = asyncHandler(async (req, res) => {
  const updatedUser = await profileService.updateProfile(req.user._id, req.body);
  sendSuccess(res, 200, "Profile updated successfully", { user: updatedUser });
});
