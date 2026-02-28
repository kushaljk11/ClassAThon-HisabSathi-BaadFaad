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
  autoConnect: false, // connect manually when needed
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000, // initial delay (ms)
  reconnectionDelayMax: 30000, // max delay (ms)
  randomizationFactor: 0.5, // add jitter
  transports: ["websocket", "polling"],
});

// Debug/log reconnection lifecycle
socket.on("reconnect_attempt", (attempt) => {
  console.debug(`socket: reconnect_attempt #${attempt}`);
});
socket.on("reconnect_error", (err) => {
  console.debug("socket: reconnect_error", err);
});
socket.on("reconnect_failed", () => {
  console.debug("socket: reconnect_failed");
});
socket.on("connect_error", (err) => {
  console.debug("socket: connect_error", err?.message || err);
});

export default socket;
