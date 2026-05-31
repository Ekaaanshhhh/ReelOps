import multer from "multer";
import path from "path";

/**
 * Multer Upload Middleware
 *
 * Configures file upload with:
 * - Disk storage to /uploads directory
 * - File type validation (video formats only)
 * - File size limit (100MB)
 */

// ── Allowed video MIME types ────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",   // .mov
  "video/x-msvideo",   // .avi
  "video/webm",
  "video/x-matroska",  // .mkv
];

// ── Max file size: 100MB ────────────────────────────────────────────
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// ── Storage configuration ───────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/");
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp-originalname
    const uniqueSuffix = `${req.user?._id || "anon"}-${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ── File filter: validate MIME type ─────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type: ${file.mimetype}. Allowed types: MP4, MPEG, MOV, AVI, WebM, MKV.`
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

// ── Multer instance ─────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export default upload;
