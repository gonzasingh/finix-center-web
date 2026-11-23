// Punto único de acceso a los datos. Hay dos "mundos" de usuarios:
//  - SOCIOS: API real de FINIX (producción) o datos de ejemplo (solo modo demo / vistas previas).
//  - COLABORADORES (panel de gestión): Firebase si está configurado (VITE_FIREBASE_*); si no, datos de ejemplo guardados en el navegador.
// Los proveedores se cargan de forma diferida: un socio nunca descarga el código del panel ni el de Firebase.
import { DEMO, USE_FIREBASE } from '../lib/env';

const memo = (fn) => { let p; return () => (p ??= fn()); };
const loadSocio = memo(() => (DEMO ? import('./demoProvider') : import('./apiProvider')));
const loadStaff = memo(() => (!DEMO && USE_FIREBASE ? import('./firebaseProvider') : import('./demoProvider')));

// ---------------------------------------------------------------- sesión (une las dos fuentes)
// Para no descargar el proveedor del panel en cada visita, solo se consulta si este navegador tuvo una sesión de colaborador.
const STAFF_HINT = 'finix_staff_session';
const hasStaffHint = () => { try { return localStorage.getItem(STAFF_HINT) === '1'; } catch { return false; } };
const setStaffHint = (on) => { try { if (on) localStorage.setItem(STAFF_HINT, '1'); else localStorage.removeItem(STAFF_HINT); } catch { /* noop */ } };

let socio; // undefined = el proveedor todavía no informó; null = sin sesión
let staff;
let socioOn = false;
let staffOn = false;
const listeners = new Set();
const current = () => socio || staff || null;
const emit = () => { if (socio === undefined || staff === undefined) return; const u = current(); listeners.forEach((l) => l(u)); };

function watchSocio() {
  if (socioOn) return;
  socioOn = true;
  loadSocio().then((p) => p.onAuthChange((profile) => { socio = profile?.role === 'socio' ? profile : null; emit(); })).catch(() => { socio = null; emit(); });
}
function watchStaff() {
  if (staffOn) return;
  staffOn = true;
  loadStaff().then((p) => p.onAuthChange((profile) => { staff = profile?.role === 'colaborador' ? profile : null; emit(); })).catch(() => { staff = null; emit(); });
}

export function onAuthChange(cb) {
  listeners.add(cb);
  watchSocio();
  if (DEMO || hasStaffHint()) watchStaff();
  else if (staff === undefined) staff = null;
  // Si el estado ya se conoce (por ej. la app se vuelve a montar) se informa enseguida.
  Promise.resolve().then(() => { if (listeners.has(cb) && socio !== undefined && staff !== undefined) cb(current()); });
  return () => listeners.delete(cb);
}

async function signIn(args) {
  if (args.mode === 'colaborador') {
    if (socio) await (await loadSocio()).signOut(); // una sola sesión a la vez
    await (await loadStaff()).signIn(args);
    setStaffHint(true);
    watchStaff();
  } else {
    if (staff) { setStaffHint(false); await (await loadStaff()).signOut(); }
    await (await loadSocio()).signIn(args);
  }
}

async function signOut() {
  setStaffHint(false);
  const jobs = [loadSocio().then((p) => p.signOut())];
  if (staffOn) jobs.push(loadStaff().then((p) => p.signOut()));
  await Promise.all(jobs);
}

// ---------------------------------------------------------------- datos
const socioCall = (name) => async (...args) => (await loadSocio())[name](...args);
const staffCall = (name) => async (...args) => (await loadStaff())[name](...args);

export const api = {
  signIn,
  signOut,
  // Socio
  getSocioOverview: socioCall('getSocioOverview'),
  createRequest: socioCall('createRequest'),
  markNoticeRead: socioCall('markNoticeRead'),
  markAllNoticesRead: socioCall('markAllNoticesRead'),
  changePassword: socioCall('changePassword'),
  // Colaborador (panel de gestión)
  listClients: staffCall('listClients'),
  listCredits: staffCall('listCredits'),
  listRequests: staffCall('listRequests'),
  listAudit: staffCall('listAudit'),
  createClient: staffCall('createClient'),
  updateClient: staffCall('updateClient'),
  deleteClient: staffCall('deleteClient'),
  reviewRequest: staffCall('reviewRequest'),
  resetDemo: staffCall('resetDemo'),
};
