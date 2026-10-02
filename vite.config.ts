import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      sourcemap: false, // Không sinh source map, ngăn xem mã nguồn trên F12
      minify: 'esbuild' as const,
      cssMinify: true,
      reportCompressedSize: false,
    },
    esbuild: {
      drop: ['console', 'debugger'] as ('console' | 'debugger')[],
      legalComments: 'none' as const,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
