import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';
import tailwindcss from 'tailwindcss';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

const ANALYZE = process.env.ANALYZE === 'true';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    ANALYZE &&
      (visualizer({
        open: true,
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true
      }) as PluginOption)
  ].filter(Boolean) as PluginOption[],
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  },
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'formik',
      'yup',
      'react-intl',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'lucide-react'
    ]
  },
  build: {
    chunkSizeWarningLimit: 800,
    sourcemap: false,
    cssCodeSplit: true,
    commonjsOptions: {
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto'
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;

          // Keep React-dependent libraries in one vendor chunk. Splitting
          // packages such as react-helmet-async can trigger CJS/ESM
          // initialization-order errors in production.
          if (id.includes('leaflet')) return 'leaflet';
          if (id.includes('date-fns')) return 'date-fns';
          if (id.includes('lucide-react')) return 'icons';

          return 'vendor';
        }
      }
    }
  }
});
