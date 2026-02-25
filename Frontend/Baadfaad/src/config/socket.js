import { io } from "socket.io-client";
import { BASE_URL } from "../config/config";

// Single shared socket instance
const socket = io(BASE_URL, {
  autoConnect: false,       // connect manually when needed
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
