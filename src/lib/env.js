const e = import.meta.env;
export const USE_FIREBASE = !!e.VITE_FIREBASE_API_KEY;
export const ROUTER_MODE = e.VITE_ROUTER === 'memory' ? 'memory' : 'browser';
export const DEMO_BANNER = e.VITE_DEMO_BANNER === 'true';
export const SOCIO_EMAIL_DOMAIN = e.VITE_SOCIO_EMAIL_DOMAIN || 'socios.finixcenter.app';
export const firebaseConfig = {
  apiKey: e.VITE_FIREBASE_API_KEY,
  authDomain: e.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: e.VITE_FIREBASE_PROJECT_ID,
  storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: e.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: e.VITE_FIREBASE_APP_ID,
};
