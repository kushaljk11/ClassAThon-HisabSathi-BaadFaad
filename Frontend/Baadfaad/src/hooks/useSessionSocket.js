import { useEffect } from "react";
import socket from "../config/socket";

/**
 * Hook to subscribe to real-time session updates via Socket.IO.
 *
 * @param {string|null} sessionId  - the session room to join
 * @param {(data: object) => void} onParticipantJoined - called when a new participant joins
 * @param {(data: { path: string }) => void} [onHostNavigate] - called when the host redirects everyone
 * @param {(data: object) => void} [onItemsUpdate] - called when the host updates bill items
 */
export default function useSessionSocket(sessionId, onParticipantJoined, onHostNavigate, onItemsUpdate) {
  useEffect(() => {
    if (!sessionId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join-session-room", sessionId);

    const joinHandler = (data) => {
      if (onParticipantJoined) onParticipantJoined(data);
    };
    socket.on("participant-joined", joinHandler);

    const navHandler = (data) => {
      if (onHostNavigate) onHostNavigate(data);
    };
    socket.on("host-navigate", navHandler);

    const itemsHandler = (data) => {
      if (onItemsUpdate) onItemsUpdate(data);
    };
    socket.on("items-update", itemsHandler);

    return () => {
      socket.off("participant-joined", joinHandler);
      socket.off("host-navigate", navHandler);
      socket.off("items-update", itemsHandler);
      socket.emit("leave-session-room", sessionId);
    };
  }, [sessionId, onParticipantJoined, onHostNavigate, onItemsUpdate]);
}

/**
 * Emit a host-navigate event to move all participants to a new page.
 */
export function emitHostNavigate(sessionId, path) {
  if (!socket.connected) socket.connect();
  socket.emit("host-navigate", { sessionId, path });
}

/**
 * Emit bill items update so participants see live changes.
 */
export function emitItemsUpdate(sessionId, scannedData, manualItems) {
  if (!socket.connected) socket.connect();
  socket.emit("items-update", { sessionId, scannedData, manualItems });
}
