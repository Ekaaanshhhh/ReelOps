import Submission from "../models/Submission.js";
import ChannelMember from "../models/ChannelMember.js";
import { STATUSES } from "../constants/statuses.js";
import { ROLES } from "../constants/roles.js";
import { uploadToCloudinary, deleteFromCloudinary, cleanupLocalFile } from "./upload.service.js";
import { sendSubmissionNotification } from "./email.service.js";
import { generateScheduleService } from "./ai.service.js";

/**
 * Submission Service
 *
 * Business logic for submission CRUD, uploads, and approval workflow.
 */

/**
 * Upload a new submission.
 * Uploads video to Cloudinary and creates a database record.
 *
 * @param {object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} params.platform
 * @param {string} params.channelId
 * @param {string} params.userId
 * @param {object} params.file - Multer file object
 * @returns {Promise<object>} Created submission
 */
export const createSubmission = async ({ title, description, platform, channelId, userId, file }) => {
  if (!title || !platform) {
    const error = new Error("Title and platform are required.");
    error.statusCode = 400;
    throw error;
  }

  if (!file) {
    const error = new Error("Video file is required.");
    error.statusCode = 400;
    throw error;
  }

  try {
    // Upload video to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(file.path);

    // Create submission in database
    const submission = await Submission.create({
      title,
      description: description || "",
      videoUrl: cloudinaryResult.url,
      videoPublicId: cloudinaryResult.publicId,
      thumbnailUrl: cloudinaryResult.thumbnailUrl,
      platform: platform.toUpperCase(),
      status: STATUSES.PENDING_APPROVAL,
      uploadedBy: userId,
      channel: channelId,
    });

    // Clean up local file
    cleanupLocalFile(file.path);

    // Generate AI schedule recommendation asynchronously
    generateScheduleService({ title, description: description || "", platform: platform.toUpperCase() })
      .then(async (aiResult) => {
        if (aiResult?.suggestedPostingTime) {
          submission.aiSuggestedPostTime = new Date(aiResult.suggestedPostingTime);
          submission.aiTimeConfidence = aiResult.confidence || null;
          submission.aiTimeReason = aiResult.reason || "";
          await submission.save();
        }
      })
      .catch((err) => console.error("Error generating AI schedule:", err));

    // Populate uploader info
    await submission.populate("uploadedBy", "name email");

    // Fetch channel owners and send email
    try {
      const owners = await ChannelMember.find({
        channel: channelId,
        role: ROLES.OWNER
      }).populate("user", "email");
      
      const ownerEmails = owners
        .map(owner => owner.user?.email)
        .filter(email => email);

      if (ownerEmails.length > 0) {
        // Fire and forget
        sendSubmissionNotification(submission, submission.uploadedBy.name, ownerEmails).catch(console.error);
      }
    } catch (emailErr) {
      console.error("Error fetching owners for email notification:", emailErr);
    }

    return submission;
  } catch (error) {
    // Clean up local file on error
    cleanupLocalFile(file?.path);
    throw error;
  }
};

/**
 * Get all submissions for a channel with optional filters.
 *
 * @param {string} channelId
 * @param {object} [filters] - Optional status, platform, page, limit
 * @returns {Promise<{submissions: Array, total: number, page: number, totalPages: number}>}
 */
export const getChannelSubmissions = async (channelId, filters = {}) => {
  const { status, platform, page = 1, limit = 20 } = filters;

  const filter = { channel: channelId };

  if (status) filter.status = status.toUpperCase();
  if (platform) filter.platform = platform.toUpperCase();

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate("uploadedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Submission.countDocuments(filter),
  ]);

  return {
    submissions,
    count: submissions.length,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

/**
 * Get a single submission by ID.
 *
 * @param {string} submissionId
 * @returns {Promise<object>}
 */
export const getSubmissionById = async (submissionId) => {
  const submission = await Submission.findById(submissionId)
    .populate("uploadedBy", "name email")
    .populate("approvedBy", "name email")
    .populate("channel", "name");

  if (!submission) {
    const error = new Error("Submission not found.");
    error.statusCode = 404;
    throw error;
  }

  return submission;
};

/**
 * Update a submission.
 * Only the uploader can update their own submissions.
 *
 * @param {string} submissionId
 * @param {string} userId - ID of the user making the update
 * @param {object} data - Fields to update (title, description, platform)
 * @returns {Promise<object>}
 */
export const updateSubmission = async (submissionId, userId, data) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    const error = new Error("Submission not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only the uploader can update their submission
  if (submission.uploadedBy.toString() !== userId.toString()) {
    const error = new Error("You can only update your own submissions.");
    error.statusCode = 403;
    throw error;
  }

  // Only allow updates on non-final statuses
  if ([STATUSES.POSTED].includes(submission.status)) {
    const error = new Error("Cannot update a posted submission.");
    error.statusCode = 400;
    throw error;
  }

  // Update allowed fields
  const { title, description, platform } = data;
  if (title) submission.title = title;
  if (description !== undefined) submission.description = description;
  if (platform) submission.platform = platform.toUpperCase();

  await submission.save();

  await submission.populate("uploadedBy", "name email");
  await submission.populate("approvedBy", "name email");

  return submission;
};

/**
 * Delete a submission.
 * Only the uploader or a channel OWNER can delete.
 *
 * @param {string} submissionId
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const deleteSubmission = async (submissionId, userId) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    const error = new Error("Submission not found.");
    error.statusCode = 404;
    throw error;
  }

  // Check if user is the uploader or a channel OWNER
  const isUploader = submission.uploadedBy.toString() === userId.toString();
  const membership = await ChannelMember.findOne({
    user: userId,
    channel: submission.channel,
  });

  const isOwner = membership && membership.role === ROLES.OWNER;

  if (!isUploader && !isOwner) {
    const error = new Error("You are not authorized to delete this submission.");
    error.statusCode = 403;
    throw error;
  }

  // Delete video from Cloudinary
  if (submission.videoPublicId) {
    await deleteFromCloudinary(submission.videoPublicId);
  }

  await Submission.findByIdAndDelete(submissionId);
};

/**
 * Approve a submission.
 * Only a channel OWNER can approve.
 *
 * @param {string} submissionId
 * @param {string} userId - ID of the approving OWNER
 * @returns {Promise<object>}
 */
export const approveSubmission = async (submissionId, userId) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    const error = new Error("Submission not found.");
    error.statusCode = 404;
    throw error;
  }

  // Verify user is OWNER of the submission's channel
  const membership = await ChannelMember.findOne({
    user: userId,
    channel: submission.channel,
  });

  if (!membership || membership.role !== ROLES.OWNER) {
    const error = new Error("Only channel owners can approve submissions.");
    error.statusCode = 403;
    throw error;
  }

  // Only PENDING_APPROVAL submissions can be approved
  if (submission.status !== STATUSES.PENDING_APPROVAL) {
    const error = new Error(`Cannot approve a submission with status '${submission.status}'. Only PENDING_APPROVAL submissions can be approved.`);
    error.statusCode = 400;
    throw error;
  }

  submission.status = STATUSES.APPROVED;
  submission.approvedBy = userId;
  await submission.save();

  await submission.populate("uploadedBy", "name email");
  await submission.populate("approvedBy", "name email");

  return submission;
};

/**
 * Reject a submission.
 * Only a channel OWNER can reject.
 *
 * @param {string} submissionId
 * @param {string} userId - ID of the rejecting OWNER
 * @param {string} [reason] - Rejection reason
 * @returns {Promise<object>}
 */
export const rejectSubmission = async (submissionId, userId, reason = "") => {
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    const error = new Error("Submission not found.");
    error.statusCode = 404;
    throw error;
  }

  // Verify user is OWNER of the submission's channel
  const membership = await ChannelMember.findOne({
    user: userId,
    channel: submission.channel,
  });

  if (!membership || membership.role !== ROLES.OWNER) {
    const error = new Error("Only channel owners can reject submissions.");
    error.statusCode = 403;
    throw error;
  }

  // Only PENDING_APPROVAL submissions can be rejected
  if (submission.status !== STATUSES.PENDING_APPROVAL) {
    const error = new Error(`Cannot reject a submission with status '${submission.status}'. Only PENDING_APPROVAL submissions can be rejected.`);
    error.statusCode = 400;
    throw error;
  }

  submission.status = STATUSES.REJECTED;
  submission.rejectionReason = reason;
  await submission.save();

  await submission.populate("uploadedBy", "name email");
  await submission.populate("approvedBy", "name email");

  return submission;
};
