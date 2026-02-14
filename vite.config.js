import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['dataset/**', 'icon-192x192.png', 'icon-512x512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,pdf,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/dataset/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'dataset-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/pdfs/') || url.pathname.includes('/infografias/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 Days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Manual Clínico 2026',
        short_name: 'Manual2026',
        description: 'Apoyo para consulta de psiquiatría y comorbilidades médicas',
        theme_color: '#0e2f56',
        background_color: '#FFF8E7',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })

  ]
});
