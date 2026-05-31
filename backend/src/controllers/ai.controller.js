import { generateMetadataService } from "../services/ai.service.js";

/**
 * Generate AI metadata for an upload (captions, hashtags, description)
 * POST /api/v1/ai/generate-metadata
 */
export const generateMetadata = async (req, res, next) => {
  try {
    const { title, description, platform } = req.body;

    // Validate input
    if (!title || !platform) {
      return res.status(400).json({
        success: false,
        message: "Title and platform are required for AI generation.",
      });
    }

    const aiData = await generateMetadataService({
      title,
      description: description || "",
      platform,
    });

    res.status(200).json({
      success: true,
      data: aiData,
    });
  } catch (error) {
    console.error("Generate Metadata Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate AI metadata.",
      error: error.message,
    });
  }
};
