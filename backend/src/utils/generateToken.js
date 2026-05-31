import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a user.
 *
 * IMPORTANT: No role in the payload — roles are channel-specific
 * and resolved per-request via ChannelMember lookup.
 *
 * @param {string} userId - The user's MongoDB _id
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

export default generateToken;
