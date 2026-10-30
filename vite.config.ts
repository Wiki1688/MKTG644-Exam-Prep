import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "MKTG644 Exam Prep",
        short_name: "MKTG644",
        description: "Revision slides for MKTG644 AI-Powered Marketing",
        theme_color: "#1E2761",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "./",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,json}"],
        runtimeCaching: [{ urlPattern: /\/content\/.*\.json$/, handler: "StaleWhileRevalidate", options: { cacheName: "content" } }]
      }
    })
  ],
  base: "./"
});
