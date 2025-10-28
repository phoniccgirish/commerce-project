import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // <-- Re-add the path module import
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },

  optimizeDeps: {
    include: ["firebase/app", "firebase/auth"],
  },

  // --- CRITICAL FINAL FIX: EXPLICIT ALIASES ---
  resolve: {
    alias: [
      // Use path.resolve to get the absolute path to node_modules/firebase
      // This bypasses Vite's confused internal module scanning logic.
      {
        find: /^firebase\/app$/,
        replacement: path.resolve(__dirname, "node_modules/firebase/app"),
      },
      {
        find: /^firebase\/auth$/,
        replacement: path.resolve(__dirname, "node_modules/firebase/auth"),
      },
    ],
  },
  // --- END CRITICAL FINAL FIX ---
});
