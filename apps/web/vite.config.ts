import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [".ngrok-free.dev", "gastrocolic-delois-restiform.ngrok-free.dev"],
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/socket.io": { target: "http://localhost:3000", ws: true },
    },
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
});
