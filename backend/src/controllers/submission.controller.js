import * as submissionService from "../services/submission.service.js";
import { sendSuccess } from "../utils/responseHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Submission Controller
 *
 * Thin controller — delegates all business logic to submission.service.js
 */

// ── POST /api/v1/channel/:channelId/submission/upload ───────────────
export const uploadSubmission = asyncHandler(async (req, res) => {
  const { title, description, platform } = req.body;

  const submission = await submissionService.createSubmission({
    title,
    description,
    platform,
    channelId: req.params.channelId,
    userId: req.user._id,
    file: req.file,
  });

  sendSuccess(res, 201, "Submission uploaded successfully.", { submission });
});

// ── GET /api/v1/channel/:channelId/submission/all ───────────────────
export const getAllSubmissions = asyncHandler(async (req, res) => {
  const result = await submissionService.getChannelSubmissions(
    req.params.channelId,
    req.query
  );

  sendSuccess(res, 200, "Submissions retrieved successfully.", result);
});

// ── GET /api/v1/submission/:id ──────────────────────────────────────
export const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await submissionService.getSubmissionById(req.params.id);

  sendSuccess(res, 200, "Submission retrieved successfully.", { submission });
});

// ── PUT /api/v1/submission/:id ──────────────────────────────────────
export const updateSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.updateSubmission(
    req.params.id,
    req.user._id,
    req.body
  );

  sendSuccess(res, 200, "Submission updated successfully.", { submission });
});

// ── DELETE /api/v1/submission/:id ───────────────────────────────────
export const deleteSubmission = asyncHandler(async (req, res) => {
  await submissionService.deleteSubmission(req.params.id, req.user._id);

  sendSuccess(res, 200, "Submission deleted successfully.");
});

// ── PUT /api/v1/submission/:id/approve ──────────────────────────────
export const approveSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.approveSubmission(
    req.params.id,
    req.user._id
  );

  sendSuccess(res, 200, "Submission approved successfully.", { submission });
});

// ── PUT /api/v1/submission/:id/reject ───────────────────────────────
export const rejectSubmission = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const submission = await submissionService.rejectSubmission(
    req.params.id,
    req.user._id,
    reason
  );

  sendSuccess(res, 200, "Submission rejected successfully.", { submission });
});

// ── POST /api/v1/channel/:channelId/submission/:id/status ───────────
export const changeSubmissionStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  let submission;
  
  if (status === "APPROVED") {
    submission = await submissionService.approveSubmission(req.params.id, req.user._id);
  } else if (status === "REJECTED") {
    submission = await submissionService.rejectSubmission(req.params.id, req.user._id, reason);
  } else {
    const error = new Error("Invalid status. Must be APPROVED or REJECTED.");
    error.statusCode = 400;
    throw error;
  }

  sendSuccess(res, 200, `Submission ${status.toLowerCase()} successfully.`, { submission });
});

