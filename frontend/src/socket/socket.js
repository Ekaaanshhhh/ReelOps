import { io } from "socket.io-client";

let socket;

/**
 * Strips out the /api/vX from the VITE_API_URL to get the root domain for Socket.IO.
 */
const getSocketUrl = () => {
  const SOCKET_URL = 
    import.meta.env.VITE_SOCKET_URL || 
    'http://localhost:5005';
  return SOCKET_URL;
};

export const connectSocket = (token) => {
  if (!token) return null;

  // If the user changed (e.g. logged out and logged in), destroy the old socket
  if (socket && socket.io.opts.auth.token !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};
