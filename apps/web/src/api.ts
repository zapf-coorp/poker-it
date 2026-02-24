/**
 * API configuration and room socket for web app.
 * When VITE_API_URL is "" or unset in production build, uses same origin (for Ngrok single-tunnel mode).
 */

import { io } from "socket.io-client";
import { createRoomApi } from "shared";

const apiUrl =
  import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : "http://localhost:3000";

export const roomApi = createRoomApi(apiUrl);

export function createRoomSocket() {
  return io(apiUrl || undefined, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });
}
