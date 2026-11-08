// Punto único de acceso a los datos. Elige el proveedor (Firebase o demo) según las variables de entorno.
// Los proveedores se cargan de forma diferida: en modo demo el SDK de Firebase no se descarga.
import { USE_FIREBASE } from '../lib/env';

let providerPromise;
const load = () => (providerPromise ??= USE_FIREBASE ? import('./firebaseProvider') : import('./demoProvider'));

export function onAuthChange(cb) {
  let unsub = () => {};
  let cancelled = false;
  load().then((p) => { if (!cancelled) unsub = p.onAuthChange(cb); });
  return () => { cancelled = true; unsub(); };
}

const call = (name) => async (...args) => (await load())[name](...args);
export const api = {
  signIn: call('signIn'),
  signOut: call('signOut'),
  getSocioOverview: call('getSocioOverview'),
  createRequest: call('createRequest'),
  listClients: call('listClients'),
  listCredits: call('listCredits'),
  listRequests: call('listRequests'),
  listAudit: call('listAudit'),
  createClient: call('createClient'),
  updateClient: call('updateClient'),
  deleteClient: call('deleteClient'),
  reviewRequest: call('reviewRequest'),
  resetDemo: call('resetDemo'),
};
