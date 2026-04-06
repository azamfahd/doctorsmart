import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['app_icon.svg'],
          manifest: {
            name: 'الحكيم الذكي Pro AI Doctor',
            short_name: 'الحكيم Pro',
            description: 'استشاري طب رقمي متقدم مدعوم بالذكاء الاصطناعي',
            theme_color: '#0F172A',
            icons: [
              {
                src: '/app_icon.svg',
                sizes: '192x192',
                type: 'image/svg+xml'
              },
              {
                src: '/app_icon.svg',
                sizes: '512x512',
                type: 'image/svg+xml'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
