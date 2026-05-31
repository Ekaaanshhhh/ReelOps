import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/**
 * Upload Service
 *
 * Handles file uploads to Cloudinary and cleanup.
 */

/**
 * Upload a file to Cloudinary.
 * @param {string} filePath - Local path to the file
 * @returns {Promise<object>} Cloudinary upload result
 */
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "reelops/videos",
    });

    // Generate thumbnail URL from Cloudinary video
    const thumbnailUrl = result.secure_url.replace(/\.\w+$/, ".jpg");

    return {
      url: result.secure_url,
      publicId: result.public_id,
      thumbnailUrl,
      format: result.format,
      duration: result.duration || null,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    const err = new Error("Failed to upload file to cloud storage.");
    err.statusCode = 500;
    throw err;
  }
};

/**
 * Delete a file from Cloudinary.
 * @param {string} publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

/**
 * Clean up a local file after upload.
 * @param {string} filePath - Path to the local file
 */
export const cleanupLocalFile = (filePath) => {
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete local file:", err.message);
    });
  }
};
