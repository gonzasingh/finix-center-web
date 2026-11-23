// Proveedor de datos DEMO: persiste en localStorage del navegador. No requiere servidor.
import { buildDemoData, DEMO_SOCIO_PASSWORD } from './demoData';
import { newRequest } from './logic';
import { isWednesday } from '../lib/credit';

const KEY = 'finix_demo_v3';
const SESSION = 'finix_demo_session';
const wait = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const clone = (o) => JSON.parse(JSON.stringify(o));
const uid = (p) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

let db;
try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
if (!db?.clients) db = buildDemoData();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage no disponible */ } };

let session = null;
try { session = JSON.parse(sessionStorage.getItem(SESSION)); } catch { session = null; }
const listeners = new Set();
const setSession = (s) => {
  session = s;
  try { s ? sessionStorage.setItem(SESSION, JSON.stringify(s)) : sessionStorage.removeItem(SESSION); } catch { /* noop */ }
  listeners.forEach((l) => l(session));
};

export function onAuthChange(cb) {
  listeners.add(cb);
  Promise.resolve().then(() => cb(session));
  return () => listeners.delete(cb);
}

export async function signIn({ identifier, password }) {
  await wait(450);
  const dni = String(identifier).replace(/\D/g, '');
  const c = db.clients.find((x) => x.dni === dni && !x.deleted);
  if (!c || password !== DEMO_SOCIO_PASSWORD) throw new Error('Documento o contraseña incorrectos');
  setSession({ uid: `u-${c.id}`, role: 'socio', displayName: c.nombre, dni: c.dni, clientId: c.id });
}
export async function signOut() { setSession(null); }

// ---------- Socio ----------
export async function getSocioOverview(profile) {
  await wait();
  const client = db.clients.find((c) => c.id === profile.clientId);
  return clone({
    client,
    credits: db.credits.filter((c) => c.clientId === profile.clientId),
    requests: db.requests.filter((r) => r.clientId === profile.clientId),
  });
}
export async function createRequest(profile, { monto, plan, cuotas, comentario, promo, rate, tipoCredito }) {
  await wait(400);
  const client = db.clients.find((c) => c.id === profile.clientId);
  const req = { id: uid('r'), ...newRequest({ client, monto, plan, cuotas, comentario, existing: db.requests, promo: promo ?? isWednesday(), rate, tipoCredito }) };
  db.requests.push(req); save();
  return clone(req);
}

// Avisos: en el modo demo se derivan en la app (no hay servidor).
export async function markNoticeRead() {}
export async function markAllNoticesRead() {}
export async function changePassword() { await wait(300); return 'Modo demo: la contraseña no se modifica.'; }
