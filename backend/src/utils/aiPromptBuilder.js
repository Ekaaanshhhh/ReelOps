export const buildMetadataPrompt = (platform) => {
  let platformInstruction = "";
  const normalizedPlatform = (platform || "").toUpperCase();
  
  switch (normalizedPlatform) {
    case "INSTAGRAM":
      platformInstruction = "Optimize for Instagram. Captions should be short, engaging, and encourage comments. Hashtags should be highly relevant and trending.";
      break;
    case "YOUTUBE":
      platformInstruction = "Optimize for YouTube. Descriptions should be SEO-friendly, comprehensive, and clear. Hashtags should be searchable keywords.";
      break;
    default:
      platformInstruction = "Provide general engaging content suitable for social media.";
  }

  return `
You are an expert social media manager and content optimizer.
Generate engaging metadata based on the provided title and description.
${platformInstruction}

You MUST return a valid JSON object matching EXACTLY this structure, without any additional text or markdown formatting:
{
  "captions": [
    "String: Engaging caption option 1",
    "String: Engaging caption option 2",
    "String: Engaging caption option 3"
  ],
  "hashtags": [
    "String: #hashtag1",
    "String: #hashtag2",
    "String: #hashtag3",
    "String: #hashtag4",
    "String: #hashtag5",
    "String: #hashtag6",
    "String: #hashtag7",
    "String: #hashtag8",
    "String: #hashtag9",
    "String: #hashtag10"
  ],
  "optimizedDescription": "String: A single, cohesive, optimized description based on the input."
}
`.trim();
};

export const buildSchedulePrompt = (platform) => {
  return `
You are an expert social media strategist. 
Based on the provided title, description, and platform (${platform}), determine the absolutely best time to post this content to maximize engagement and reach.

You MUST return a valid JSON object matching EXACTLY this structure, without any additional text or markdown formatting:
{
  "suggestedPostingTime": "String: ISO 8601 Date format for a time in the future (e.g., 2026-06-15T19:30:00Z)",
  "confidence": "Number: between 0 and 100 representing your confidence in this time slot",
  "reason": "String: A brief 1-2 sentence explanation of why this time is optimal."
}
`.trim();
};
