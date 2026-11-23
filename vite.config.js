import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run dev`           -> desarrollo con datos de ejemplo (modo demo, sin servidor)
// `npm run dev:real`      -> desarrollo contra el servidor real de FINIX (usa el proxy de abajo)
// `npm run build`         -> build de producción para Vercel (carpeta dist, datos reales)
// `npm run build:preview` -> un único .html autocontenido en modo demo (para compartir una vista previa)

// El servidor de FINIX (AdmCloud) no habilita CORS, por eso el sitio lo consulta por la ruta propia /admcloud-api/ y
// este proxy (desarrollo) o vercel.json (producción) reenvía la llamada al servidor real.
const apiProxy = { '/admcloud-api': { target: process.env.API_PROXY_TARGET || 'https://nuevo.mine.nu', changeOrigin: true, secure: true } };

export default defineConfig(({ mode }) => ({
  // GitHub Pages sirve el sitio en /nombre-del-repo/. El workflow define VITE_BASE=/finix-center-web/ (en Vercel queda '/').
  base: process.env.VITE_BASE || '/',
  plugins: [react(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  // En la vista previa (modo demo) no se incluye el SDK de Firebase para que el archivo sea liviano.
  resolve: mode === 'preview' ? { alias: [{ find: /^\.\/firebaseProvider$/, replacement: fileURLToPath(new URL('./src/services/firebaseStub.js', import.meta.url)) }] } : {},
  build:
    mode === 'preview'
      ? { outDir: 'dist-preview', assetsInlineLimit: 100000000, cssCodeSplit: false }
      : { outDir: 'dist', sourcemap: false },
  server: { port: 5173, proxy: apiProxy },
  preview: { proxy: apiProxy },
}));
