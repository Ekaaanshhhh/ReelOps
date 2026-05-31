import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Channel Model
 *
 * Represents a collaborative workspace in ReelOps.
 * Channels contain members with channel-specific roles
 * and scoped submissions.
 */
const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      minlength: [2, "Channel name must be at least 2 characters"],
      maxlength: [100, "Channel name cannot exceed 100 characters"],
    },

    password: {
      type: String,
      required: [true, "Channel password is required"],
      minlength: [4, "Channel password must be at least 4 characters"],
      select: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Channel creator is required"],
    },

    inviteCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// ── Pre-save hook: Hash password & generate invite code ─────────────
channelSchema.pre("save", async function () {
  // Hash password if modified
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Generate unique invite code on creation
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
});

// ── Instance method: Compare channel password ───────────────────────
channelSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: Clean JSON output ──────────────────────────────
channelSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const Channel = mongoose.model("Channel", channelSchema);

export default Channel;
