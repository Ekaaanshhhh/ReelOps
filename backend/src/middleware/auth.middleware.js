import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/responseHandler.js";

/**
 * Authentication Middleware
 *
 * Verifies JWT token from Authorization header or cookies.
 * Attaches decoded user to req.user for downstream handlers.
 *
 * IMPORTANT: No role checking here — roles are channel-specific
 * and handled by channel.middleware.js
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Fallback: check cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // No token found
    if (!token) {
      return sendError(res, 401, "Not authorized. No token provided.");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, "Not authorized. User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendError(res, 401, "Not authorized. Invalid token.");
    }

    if (error.name === "TokenExpiredError") {
      return sendError(res, 401, "Not authorized. Token has expired.");
    }

    return sendError(res, 500, "Authentication error.");
  }
};
