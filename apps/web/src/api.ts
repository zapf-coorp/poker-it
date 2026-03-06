/**
 * API configuration and room socket for web app.
 * In dev (Vite): use "" so /api requests are proxied to the server.
 * In production: VITE_API_URL or same origin (for Ngrok single-tunnel mode).
 */

import { io } from "socket.io-client";
import { createRoomApi } from "shared";

const apiUrl =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? ""
      : window.location.origin;

export const roomApi = createRoomApi(apiUrl);

export function createRoomSocket() {
  return io(apiUrl || undefined, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });
}
