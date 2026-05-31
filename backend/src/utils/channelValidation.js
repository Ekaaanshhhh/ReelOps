import ChannelMember from "../models/ChannelMember.js";

/**
 * Verify if a user is the OWNER of a given channel.
 * @param {string} userId - The ID of the user
 * @param {string} channelId - The ID of the channel
 * @returns {Promise<boolean>} True if the user is the owner, false otherwise.
 */
export const verifyChannelOwner = async (userId, channelId) => {
  if (!userId || !channelId) return false;

  const membership = await ChannelMember.findOne({
    user: userId,
    channel: channelId,
  });

  if (!membership) return false;
  
  return membership.role === "OWNER";
};
