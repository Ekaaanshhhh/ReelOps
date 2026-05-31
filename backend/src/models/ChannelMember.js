import mongoose from "mongoose";
import { ALL_ROLES, ROLES } from "../constants/roles.js";

/**
 * ChannelMember Model
 *
 * The CORE of the workspace architecture.
 * Links a User to a Channel with a channel-specific role.
 *
 * A user can belong to many channels with different roles:
 *   - OWNER in Channel A
 *   - EDITOR in Channel B
 *
 * This replaces the old global role field on the User model.
 */
const channelMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel is required"],
    },

    role: {
      type: String,
      enum: {
        values: ALL_ROLES,
        message: `Role must be one of: ${ALL_ROLES.join(", ")}`,
      },
      default: ROLES.EDITOR,
    },
  },
  {
    timestamps: true,
  }
);

// ── Compound unique index: one membership per user per channel ──────
channelMemberSchema.index({ user: 1, channel: 1 }, { unique: true });

// ── Query indexes ───────────────────────────────────────────────────
channelMemberSchema.index({ channel: 1, role: 1 });
channelMemberSchema.index({ user: 1 });

// ── Clean JSON output ───────────────────────────────────────────────
channelMemberSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const ChannelMember = mongoose.model("ChannelMember", channelMemberSchema);

export default ChannelMember;
