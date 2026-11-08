// GitHub Pages no sabe de rutas de React (/portal, /panel). Si alguien recarga esa URL, Pages sirve 404.html;
// al ser una copia de index.html, la app se carga igual y React Router resuelve la ruta.
import { copyFileSync, existsSync } from 'node:fs';
if (existsSync('dist/index.html')) { copyFileSync('dist/index.html', 'dist/404.html'); console.log('✔ dist/404.html generado (fallback SPA)'); }
