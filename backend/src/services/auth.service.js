import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * Auth Service
 *
 * Business logic for user registration and authentication.
 */

/**
 * Register a new user.
 * @param {string} name
 * @param {string} email
 * @param {string} phoneNumber
 * @returns {Promise<{user: object, token: string}>}
 */
export const signup = async (name, email, password, phoneNumber) => {
  // Validate required fields
  if (!name || !email || !password || !phoneNumber) {
    const error = new Error("Please provide name, email, password, and phone number.");
    error.statusCode = 400;
    throw error;
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("A user with this email already exists.");
    error.statusCode = 400;
    throw error;
  }

  // Create new user
  const user = await User.create({ name, email, password, phoneNumber });

  // Generate JWT token (no role — roles are channel-specific)
  const token = generateToken(user._id);

  return { user, token };
};

/**
 * Authenticate a user.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object, token: string}>}
 */
export const login = async (email, password) => {
  // Validate required fields
  if (!email || !password) {
    const error = new Error("Please provide email and password.");
    error.statusCode = 400;
    throw error;
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Compare password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = generateToken(user._id);

  return { user, token };
};
