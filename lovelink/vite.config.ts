import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        external: [
          '@prisma/client',
          '.prisma/client',
          '@prisma/client/index-browser',
          '.prisma/client/index-browser',
        ],
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'ui': ['lucide-react', 'motion/react'],
            'forms': ['react-query'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
        },
      },
      outDir: 'dist',
      emptyOutDir: false, // Don't delete server files
      assetsDir: 'assets',
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'lucide-react',
        'motion/react',
        'react-query',
        'canvas-confetti',
        'qrcode',
      ],
      exclude: [
        '@prisma/client',
        '.prisma/client',
        '@prisma/client/index-browser',
        '.prisma/client/index-browser',
      ],
    },
  };
});
