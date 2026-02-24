import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [".ngrok-free.dev", "gastrocolic-delois-restiform.ngrok-free.dev"],
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
});
