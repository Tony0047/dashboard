   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           name: 'Painel de Cotação',
           short_name: 'Cotação',
           lang: 'pt-BR',
           start_url: '/',
           scope: '/',
           display: 'standalone',
           background_color: '#eef2f6',
           theme_color: '#0b5c7a',
           icons: [
             { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
             { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
             { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
           ],
         },
       }),
     ],
   })