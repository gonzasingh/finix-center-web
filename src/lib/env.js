const e = import.meta.env;

// MODO DEMO: datos de ejemplo guardados en el navegador, sin servidor. Solo para desarrollo y vistas previas
// (`npm run dev`, `npm run build:demo`, `npm run build:preview`). El build de producción (`npm run build`) NUNCA lo usa:
// ahí el sitio trabaja con los datos reales de FINIX y no incluye ni el acceso de colaboradores ni los datos de ejemplo.
export const DEMO = e.MODE === 'demo' || e.MODE === 'preview';
export const ROUTER_MODE = e.VITE_ROUTER === 'memory' ? 'memory' : 'browser';

// API real de FINIX (AdmCloud): la misma que usa la app Android de socios. Los navegadores no pueden llamarla directo
// (el servidor no habilita CORS), así que el sitio la consulta por la ruta propia /admcloud-api/, que reenvía al servidor
// (vercel.json en producción, proxy de Vite en desarrollo). Si algún día el servidor habilita CORS, se puede apuntar
// directo con VITE_API_BASE_URL (ej.: https://nuevo.mine.nu/admcloud-api/api/).
const rawBase = e.VITE_API_BASE_URL || '/admcloud-api/api/';
export const API_BASE_URL = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
// Código de empresa con el que se identifica el socio al iniciar sesión.
export const EMPRESA_CODIGO = e.VITE_EMPRESA_CODIGO || 'FINIX';

// Legado: Firebase ya no se usa (src/services/firebaseProvider.js quedó sin conectar). Se conservan estas variables solo para que ese archivo compile.
export const SOCIO_EMAIL_DOMAIN = e.VITE_SOCIO_EMAIL_DOMAIN || 'socios.finixcenter.app';
export const firebaseConfig = {
  apiKey: e.VITE_FIREBASE_API_KEY,
  authDomain: e.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: e.VITE_FIREBASE_PROJECT_ID,
  storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: e.VITE_FIREBASE_APP_ID,
};
