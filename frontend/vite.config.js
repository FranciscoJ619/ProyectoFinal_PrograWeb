import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, /api se redirige al backend Spring Boot (puerto 8010, ver server.port).
// En producción, Nginx sirve el build estático y hace proxy de /api al JAR.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8010',
        changeOrigin: true,
        // El navegador ve /api como mismo origen; se quita Origin para que el backend
        // no aplique CORS sin importar en qué puerto corra Vite (5173, 5174...).
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'));
        },
      },
    },
  },
});
