// Novedades del carrusel "Novedades para vos": se descargan de un archivo novedades.json alojado en internet,
// así se pueden cambiar cuando quieras SIN volver a publicar el sitio ni tocar el código (es el mismo archivo que usa la app Android). Instrucciones: LEEME-NOVEDADES.md.
//
// Dirección del archivo (GitHub Pages u otro hosting). Si usás otra, cambiá solo esta línea (o definí VITE_NEWS_URL) y volvé a publicar el sitio una vez.
// Para desactivar las novedades remotas: VITE_NEWS_URL='' (queda el kit de ejemplo en public/novedades).
export const NEWS_URL = import.meta.env.VITE_NEWS_URL ?? 'https://gonzasingh.github.io/finix-novedades/novedades.json';
