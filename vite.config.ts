import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://Albmdwapi-1889324219.us-east-1.elb.amazonaws.com',
        changeOrigin: true,
        secure: false,
        // Si tu backend espera /api/v1, no uses rewrite; si no, ajusta aquí
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
