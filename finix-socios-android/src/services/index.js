// Punto único de acceso a los datos del socio: API real de FINIX (producción) o datos de ejemplo (solo modo demo/pruebas).
import { DEMO } from '../lib/env';

let providerPromise;
const load = () => (providerPromise ??= DEMO ? import('./demoProvider') : import('./apiProvider'));

export function onAuthChange(cb) {
  let unsub = () => {};
  let cancelled = false;
  load().then((p) => { if (!cancelled) unsub = p.onAuthChange(cb); }).catch(() => { if (!cancelled) cb(null); });
  return () => { cancelled = true; unsub(); };
}

const call = (name) => async (...args) => (await load())[name](...args);
export const api = {
  signIn: call('signIn'),
  signOut: call('signOut'),
  getSocioOverview: call('getSocioOverview'),
  createRequest: call('createRequest'),
  markNoticeRead: call('markNoticeRead'),
  markAllNoticesRead: call('markAllNoticesRead'),
  changePassword: call('changePassword'),
};
