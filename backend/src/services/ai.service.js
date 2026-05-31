import { executeGroqPrompt } from "../providers/groq.provider.js";
import { buildMetadataPrompt, buildSchedulePrompt } from "../utils/aiPromptBuilder.js";

/**
 * Service to orchestrate AI generation
 * 
 * @param {Object} data 
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} data.platform
 * @returns {Promise<Object>} generated metadata
 */
export const generateMetadataService = async ({ title, description, platform }) => {
  const prompt = buildMetadataPrompt(platform);
  
  const userMessage = `Title: ${title}\nDescription: ${description}\nPlatform: ${platform}`;

  const generatedMetadata = await executeGroqPrompt(prompt, userMessage, true);
  
  // Attach the platform for reference in the response as requested
  generatedMetadata.platform = platform;
  
  return generatedMetadata;
};

/**
 * Service to generate AI suggested posting time
 * 
 * @param {Object} data 
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} data.platform
 * @returns {Promise<Object>} { suggestedPostingTime, confidence }
 */
export const generateScheduleService = async ({ title, description, platform }) => {
  const prompt = buildSchedulePrompt(platform);
  const userMessage = `Title: ${title}\nDescription: ${description}\nPlatform: ${platform}`;

  const result = await executeGroqPrompt(prompt, userMessage, true);
  return result;
};
