/**
 * @fileoverview Socket.IO Client Instance
 * @description Creates a singleton Socket.IO client connected to the backend.
 *              Uses manual connection (autoConnect: false) so sockets only
 *              activate when a session page mounts. Supports up to 10
 *              reconnection attempts with 1 s delay between retries.
 *
 * @module config/socket
 */
import { io } from "socket.io-client";
import { BASE_URL } from "../config/config";

// Single shared socket instance
const socket = io(BASE_URL, {
  autoConnect: false,       // connect manually when needed
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
