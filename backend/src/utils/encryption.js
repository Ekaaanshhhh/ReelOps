import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Get the encryption key from environment variables.
 * Ensures the key is exactly 32 bytes for aes-256-cbc.
 */
const getKey = () => {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("TOKEN_ENCRYPTION_KEY is not defined in environment variables");
  }
  // If key is exactly 32 chars, use it. Otherwise, hash it to get 32 bytes.
  if (key.length === 32) {
    return Buffer.from(key);
  }
  return crypto.createHash("sha256").update(String(key)).digest("base64").substring(0, 32);
};

/**
 * Encrypt a text string.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} The encrypted text in format: iv:encryptedData
 */
export const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * Decrypt an encrypted text string.
 * @param {string} text - The encrypted text in format: iv:encryptedData
 * @returns {string} The original plain text.
 */
export const decrypt = (text) => {
  if (!text) return null;
  const textParts = text.split(":");
  if (textParts.length !== 2) throw new Error("Invalid encrypted text format");

  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
