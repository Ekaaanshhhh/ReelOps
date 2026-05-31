import User from "../models/User.js";
import ChannelPlatform from "../models/channelPlatform.model.js";

/**
 * Get the current user profile including connected platforms.
 * 
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password -__v");
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const connectedPlatforms = await ChannelPlatform.find({ connectedBy: userId })
    .populate("channel", "name")
    .sort({ createdAt: -1 });

  const mappedPlatforms = connectedPlatforms.map(p => ({
    _id: p._id,
    platform: p.platform,
    isConnected: p.oauthStatus === 'CONNECTED',
    username: p.youtubeChannelName || p.googleAccountName || p.channel?.name || 'Channel Connection',
    channelName: p.channel?.name
  }));

  return {
    user,
    connectedPlatforms: mappedPlatforms,
  };
};

/**
 * Update the user's profile details.
 * 
 * @param {string} userId 
 * @param {object} updateData 
 * @returns {Promise<object>}
 */
export const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only allow updating specific fields
  const { name, phoneNumber, profilePicture } = updateData;

  if (name) user.name = name;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;

  await user.save();

  // Return clean user object
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.__v;

  return userObj;
};
