import Groq from "groq-sdk";

// We instantiate the client lazily to ensure dotenv has time to load 
// environment variables in an ES module environment before this runs.
let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
};

/**
 * Execute a prompt against the Groq API
 * 
 * @param {string} prompt - The system prompt/instructions
 * @param {string} userMessage - The user input to process
 * @param {boolean} jsonMode - Whether to force JSON output
 * @returns {Promise<any>} The parsed response or raw string
 */
export const executeGroqPrompt = async (prompt, userMessage, jsonMode = true) => {
  try {
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const client = getGroqClient();
    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: model,
      response_format: jsonMode ? { type: "json_object" } : { type: "text" },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const resultText = response.choices[0]?.message?.content || "";

    if (jsonMode) {
      try {
        return JSON.parse(resultText);
      } catch (parseError) {
        console.error("Groq JSON Parse Error:", parseError);
        throw new Error("Failed to parse JSON response from Groq");
      }
    }

    return resultText;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate content from AI provider");
  }
};
