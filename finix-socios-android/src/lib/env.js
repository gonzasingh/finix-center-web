const e = import.meta.env;
// MODO DEMO: solo para desarrollo/pruebas (npm run dev / npm run build:demo). Los AAB de producción nunca lo usan.
export const DEMO = e.MODE === 'demo';

// Servidor real de FINIX (API AdmCloud). Es el mismo que usa la app anterior (com.finix.center).
// Para pasar a HTTPS cuando el servidor lo tenga, definí VITE_API_BASE_URL (ej.: https://nuevo.mine.nu/admcloud-api/api/).
const rawBase = e.VITE_API_BASE_URL || 'http://nuevo.mine.nu/admcloud-api/api/';
export const API_BASE_URL = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
// Código de empresa con el que se identifica el socio al iniciar sesión.
export const EMPRESA_CODIGO = e.VITE_EMPRESA_CODIGO || 'FINIX';

// Credenciales del modo demo (solo pruebas locales)
export const DEMO_SOCIO_DNI = '38492615';
export const DEMO_SOCIO_PASSWORD = 'demo1234';
