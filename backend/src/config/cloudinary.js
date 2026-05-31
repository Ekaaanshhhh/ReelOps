import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary SDK with environment credentials.
 * Must be called before any upload operations.
 */
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log("☁️  Cloudinary configured");
};

export default configureCloudinary;
