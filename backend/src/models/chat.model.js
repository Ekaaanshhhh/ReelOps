import mongoose from "mongoose";

/**
 * Chat Model
 *
 * Represents a private chat room strictly tied to a Channel.
 */
const chatSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel is required"],
      unique: true, // One chat per channel
    },
  },
  {
    timestamps: true,
  }
);

// Clean JSON output
chatSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
