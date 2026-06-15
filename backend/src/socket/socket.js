import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ChannelMember from "../models/ChannelMember.js";
import { createMessage } from "../services/chat.service.js";

let io;

/**
 * Initialize Socket.IO Server
 *
 * Configures CORS, authentication middleware, and sets up
 * channel-based real-time event handlers.
 */
export const initSocketServer = (httpServer) => {
  const allowedOrigins = process.env.CLIENT_URLS
    ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
    : ["https://reel-ops.vercel.app"];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // ── Authentication Middleware ───────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      // Allow passing token via auth object or Authorization header
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket instance for downstream events
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // ── Socket Connection Handling ────────────────────────────────────
  io.on("connection", (socket) => {
    console.log(`🔌 [Socket] User connected: ${socket.user.name} (${socket.id})`);

    // Handle joining a channel room
    socket.on("join_channel", async ({ channelId }, callback) => {
      try {
        if (!channelId) throw new Error("Channel ID is required");

        // Strict membership validation before allowing room join
        const membership = await ChannelMember.findOne({
          user: socket.user._id,
          channel: channelId,
        });

        if (!membership) {
          throw new Error("You are not a member of this channel.");
        }

        const roomName = `channel:${channelId}`;
        socket.join(roomName);
        console.log(`🚪 [Socket] User ${socket.user.name} joined room: ${roomName}`);
        
        // Acknowledge success to client
        if (callback) callback({ success: true, room: roomName });
      } catch (err) {
        console.error("[Socket] Join Channel Error:", err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Handle sending a message
    socket.on("send_message", async ({ channelId, content }, callback) => {
      try {
        if (!channelId || !content) throw new Error("Channel ID and content are required");

        // createMessage validates membership internally before saving
        const message = await createMessage(channelId, socket.user._id, content, "TEXT");

        const roomName = `channel:${channelId}`;
        
        // Broadcast the fully populated message to everyone in the room (including sender)
        io.to(roomName).emit("message_received", message);
        
        if (callback) callback({ success: true, messageId: message._id });
      } catch (err) {
        console.error("[Socket] Send Message Error:", err.message);
        if (callback) callback({ success: false, error: err.message });
      }
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log(`🔌 [Socket] User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });

  return io;
};

/**
 * Get IO Instance
 *
 * Allows emitting events from other parts of the backend if needed in the future.
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
