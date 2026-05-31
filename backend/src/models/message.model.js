import mongoose from "mongoose";

/**
 * Message Model
 *
 * Represents a single message inside a channel's chat.
 */
const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Chat reference is required"],
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel reference is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["TEXT"],
      default: "TEXT",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient pagination
messageSchema.index({ channel: 1, chat: 1, createdAt: 1 });

// Clean JSON output
messageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
