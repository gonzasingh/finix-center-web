import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`         -> build normal para Vercel (carpeta dist)
// `npm run build:preview` -> un único .html autocontenido en modo demo (para compartir una vista previa)
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  // En la vista previa (modo demo) no se incluye el SDK de Firebase para que el archivo sea liviano.
  resolve: mode === 'preview' ? { alias: [{ find: /^\.\/firebaseProvider$/, replacement: fileURLToPath(new URL('./src/services/firebaseStub.js', import.meta.url)) }] } : {},
  build:
    mode === 'preview'
      ? { outDir: 'dist-preview', assetsInlineLimit: 100000000, cssCodeSplit: false }
      : { outDir: 'dist', sourcemap: false },
  server: { port: 5173 },
}));
