import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // Ruta base apropiada
  build: {
    outDir: 'dist',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Actualización automática del Service Worker
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'apple-touch-icon.png',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png'
      ],
      manifest: {
        name: 'Gerstion de Prestamos PlanCor',
        short_name: 'PlanCor',
        description: 'Sistema de gestión para empleados y administradores',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});
