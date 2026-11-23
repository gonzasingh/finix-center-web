// Puente con Android (Capacitor). En el navegador (modo demo / pruebas) todas estas funciones son inocuas.
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

// ---- Botón "atrás" de Android ----
// Cada pantalla/modal registra un manejador; se prueba del último al primero. Si ninguno lo resuelve, la app se cierra.
const backHandlers = [];
export function onHardwareBack(fn) {
  backHandlers.push(fn);
  return () => { const i = backHandlers.indexOf(fn); if (i >= 0) backHandlers.splice(i, 1); };
}

// ---- Volver a primer plano (para refrescar datos) ----
const resumeHandlers = new Set();
export function onAppResume(fn) { resumeHandlers.add(fn); return () => resumeHandlers.delete(fn); }

// Devuelve true si alguna pantalla/modal resolvió el "atrás".
export function handleBack() {
  for (let i = backHandlers.length - 1; i >= 0; i--) if (backHandlers[i]() === true) return true;
  return false;
}

export async function initNative() {
  if (import.meta.env.MODE === 'demo') window.__finixBack = handleBack; // gancho solo para pruebas en el navegador
  if (!isNative) return;
  const { App } = await import('@capacitor/app');
  App.addListener('backButton', () => { if (!handleBack()) App.exitApp(); });
  App.addListener('appStateChange', ({ isActive }) => { if (isActive) resumeHandlers.forEach((fn) => fn()); });
  setTimeout(hideSplash, 4000); // red de seguridad: nunca dejar el splash colgado
}

export async function hideSplash() {
  if (!isNative) return;
  try { const { SplashScreen } = await import('@capacitor/splash-screen'); await SplashScreen.hide({ fadeOutDuration: 250 }); } catch { /* noop */ }
}

// Íconos de la barra de estado/navegación: claros sobre tema oscuro, oscuros sobre tema claro.
export function setSystemBarsTheme(theme) {
  if (!isNative) return;
  SystemBars.setStyle({ style: theme === 'dark' ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(() => {});
}
