/**
 * Submission Status Constants
 *
 * Tracks the lifecycle: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED → POSTED
 */
export const STATUSES = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  SCHEDULED: "SCHEDULED",
  REJECTED: "REJECTED",
  POSTED: "POSTED",
};

export const ALL_STATUSES = Object.values(STATUSES);
