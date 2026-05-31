import dotenv from "dotenv";
import { generateAuthUrl, exchangeCodeForTokens, fetchYouTubeAndGoogleProfile } from "../src/services/googleOAuth.service.js";

dotenv.config();

console.log("=== ReelOps YouTube OAuth Verification Script ===");

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log("Usage:");
  console.log("  node test-youtube-oauth.js generate");
  console.log("  node test-youtube-oauth.js exchange <code>");
  process.exit(1);
}

if (command === "generate") {
  const channelId = "test_channel_id_123";
  const url = generateAuthUrl(channelId);
  console.log("Generated OAuth URL for test channel:");
  console.log(url);
  console.log("\nOpen this URL in your browser, complete the flow, and copy the 'code' parameter from the redirect URL.");
} else if (command === "exchange") {
  const code = args[1];
  if (!code) {
    console.error("Please provide the authorization code.");
    process.exit(1);
  }

  console.log("Exchanging code for tokens...");
  exchangeCodeForTokens(code)
    .then(async (tokens) => {
      console.log("Tokens received:");
      console.log("- Access Token:", tokens.access_token ? "PRESENT" : "MISSING");
      console.log("- Refresh Token:", tokens.refresh_token ? "PRESENT" : "MISSING");
      console.log("- Expiry Date:", new Date(tokens.expiry_date));

      console.log("\nFetching YouTube & Google Profile...");
      const profile = await fetchYouTubeAndGoogleProfile(tokens);
      console.log("Profile Data:", profile);
    })
    .catch((err) => {
      console.error("Error exchanging code:", err.message);
    });
} else {
  console.log("Unknown command.");
}
