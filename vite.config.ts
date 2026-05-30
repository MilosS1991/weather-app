/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Weather Dashboard',
        short_name: 'Weather',
        description: 'Personal weather dashboard — Open-Meteo + Air Quality',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache Open-Meteo and air quality API responses for 15 minutes
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'open-meteo-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 15 },
            },
          },
          {
            urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'air-quality-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 15 },
            },
          },
          {
            urlPattern: /^https:\/\/geocoding-api\.open-meteo\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'geocoding-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
})
