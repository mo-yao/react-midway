import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import WindiCSS from "vite-plugin-windicss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), WindiCSS()],
  resolve: {
    alias: {
      "@": "/src/"
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:7001",
        changeOrigin: true,
        rewrite:  (path) => path.replace(/^\/api/, "")
      },
      "/file": {
        target: "http://localhost:9002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/file/, "")
      },
      "/ws": {
        target: "ws://localhost:7001",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, "")
      }
    }
  }
});
