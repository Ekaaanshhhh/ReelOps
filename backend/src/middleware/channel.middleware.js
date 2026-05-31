import ChannelMember from "../models/ChannelMember.js";
import { sendError } from "../utils/responseHandler.js";

/**
 * Channel Membership Middleware
 *
 * Verifies that the authenticated user belongs to the requested channel
 * and optionally checks for specific roles.
 *
 * Must be used AFTER auth.middleware.js (protect)
 */

/**
 * Verify the user is a member of the channel.
 * Reads channelId from req.params.channelId.
 * Attaches the membership record to req.membership.
 */
export const requireChannelMember = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      return sendError(res, 400, "Channel ID is required.");
    }

    const membership = await ChannelMember.findOne({
      user: req.user._id,
      channel: channelId,
    });

    if (!membership) {
      return sendError(res, 403, "You are not a member of this channel.");
    }

    req.membership = membership;
    next();
  } catch (error) {
    return sendError(res, 500, "Error verifying channel membership.");
  }
};

/**
 * Verify the user has one of the specified roles in the channel.
 * Must be used AFTER requireChannelMember.
 *
 * @param  {...string} roles - Allowed roles (e.g., "OWNER", "EDITOR")
 * @returns {Function} Express middleware
 */
export const requireChannelRole = (...roles) => {
  return (req, res, next) => {
    if (!req.membership) {
      return sendError(res, 500, "Channel membership not verified. Use requireChannelMember first.");
    }

    if (!roles.includes(req.membership.role)) {
      return sendError(
        res,
        403,
        `Role '${req.membership.role}' is not authorized for this action. Required: ${roles.join(" or ")}.`
      );
    }

    next();
  };
};
