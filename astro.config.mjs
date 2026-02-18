import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  site: 'https://carniapp.com',
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      // Mejorar tree-shaking y code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar react-markdown en su propio chunk (solo se usa en ChatWidget)
            'react-markdown': ['react-markdown'],
            // Agrupar React core
            'react-vendor': ['react', 'react-dom'],
          },
        },
      },
      // Optimizar minificación
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Eliminar console.logs en producción
          passes: 2,
        },
      },
      // Aumentar el límite para inline de assets pequeños
      assetsInlineLimit: 4096, // 4kb (default es 4096)
    },
    // Optimizar el servidor de desarrollo
    server: {
      warmup: {
        clientFiles: ['./src/components/ChatWidget.tsx'],
      },
    },
  },
});
