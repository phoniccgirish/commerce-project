import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
  resolve: {
    alias: [
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
  base: "./", // ✅ ensures assets load correctly on Vercel
});
