import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// npm run build       -> producción (conecta con la API real de FINIX)
// npm run build:demo  -> modo demo con datos de ejemplo (solo para pruebas en el navegador)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false, target: 'es2020' },
  server: { port: 5173, host: true },
});
