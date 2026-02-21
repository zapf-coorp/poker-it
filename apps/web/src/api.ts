/**
 * API configuration and room socket for web app.
 */

import { io } from "socket.io-client";
import { createRoomApi } from "shared";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const roomApi = createRoomApi(apiUrl);

export function createRoomSocket() {
  return io(apiUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });
}
