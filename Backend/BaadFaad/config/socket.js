/**
 * @file config/socket.js
 * @description Socket.IO server setup and event handlers.
 *
 * Events:
 *  - join-session-room / leave-session-room — room management
 *  - host-navigate — host redirects all participants to a new page
 *  - items-update  — host broadcasts live bill item changes
 */
import { Server } from "socket.io";

let io = null;

/**
 * Initialize Socket.IO with the HTTP server
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Client joins a session room to receive real-time updates
    socket.on("join-session-room", (sessionId) => {
      if (sessionId) {
        socket.join(sessionId);
      }
    });

    socket.on("leave-session-room", (sessionId) => {
      if (sessionId) {
        socket.leave(sessionId);
      }
    });

    // Host tells everyone in the room to navigate to a new page
    socket.on("host-navigate", ({ sessionId, path }) => {
      if (sessionId && path) {
        socket.to(sessionId).emit("host-navigate", { path });
      }
    });

    // Host broadcasts bill items to all participants in real time
    socket.on("items-update", ({ sessionId, scannedData, manualItems }) => {
      if (sessionId) {
        socket.to(sessionId).emit("items-update", { scannedData, manualItems });
      }
    });
  });

  return io;
};

/**
 * Get the current Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized — call initSocket(server) first");
  }
  return io;
};
