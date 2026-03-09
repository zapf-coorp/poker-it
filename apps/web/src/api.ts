/**
 * API configuration and room socket for web app.
 * In dev: use http://localhost:3033 directly (server must run on 3033).
 * In production: VITE_API_URL or same origin (for Ngrok single-tunnel mode).
 */

import { io } from "socket.io-client";
import { createRoomApi } from "shared";

const DEFAULT_DEV_API = "http://localhost:3033";

const apiUrl =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ""
    ? import.meta.env.VITE_API_URL
    : import.meta.env.DEV
      ? DEFAULT_DEV_API
      : window.location.origin;

export const roomApi = createRoomApi(apiUrl);

export function createRoomSocket() {
  return io(apiUrl || undefined, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
  });
}
