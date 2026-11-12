// Proveedor de datos DEMO: persiste en localStorage del navegador. No requiere Firebase.
import { buildDemoData, DEMO_STAFF, DEMO_SOCIO_PASSWORD } from './demoData';
import { validateClient, cleanClient, auditEntry, applyReview, newRequest } from './logic';
import { diff, CLIENT_LABELS, isWednesday } from '../lib/credit';

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

export async function signIn({ mode, identifier, password }) {
  await wait(450);
  if (mode === 'socio') {
    const dni = String(identifier).replace(/\D/g, '');
    const c = db.clients.find((x) => x.dni === dni && !x.deleted);
    if (!c || password !== DEMO_SOCIO_PASSWORD) throw new Error('Documento o contraseña incorrectos');
    return setSession({ uid: `u-${c.id}`, role: 'socio', displayName: c.nombre, dni: c.dni, clientId: c.id });
  }
  const u = DEMO_STAFF.find((x) => x.email === String(identifier).trim().toLowerCase());
  if (!u || u.password !== password) throw new Error('Email o contraseña incorrectos');
  const { password: _p, ...profile } = u;
  setSession(profile);
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

// ---------- Colaborador ----------
export async function listClients() { await wait(); return clone(db.clients.filter((c) => !c.deleted)); }
export async function listCredits() { await wait(); return clone(db.credits); }
export async function listRequests() { await wait(); return clone(db.requests); }
export async function listAudit() { await wait(); return clone([...db.audit].sort((a, b) => b.ts.localeCompare(a.ts))); }

function log(entry) { db.audit.push({ id: uid('a'), ts: new Date().toISOString(), ...entry }); }

export async function createClient(actor, data) {
  await wait(350);
  const errors = validateClient(data, db.clients);
  if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos'), { fields: errors });
  const now = new Date().toISOString();
  const legajo = Math.max(100, ...db.clients.map((c) => c.legajo || 0)) + 1;
  const c = { id: uid('c'), legajo, ...cleanClient(data), score: 60, createdAt: now, updatedAt: now, updatedByName: actor.displayName, deleted: false };
  db.clients.push(c);
  log(auditEntry({ actor, action: 'cliente.crear', entityType: 'cliente', entityId: c.id, entityLabel: c.nombre, summary: `Dio de alta al socio (DNI ${c.dni})`, clientId: c.id }));
  save(); return clone(c);
}
export async function updateClient(actor, id, patch) {
  await wait(350);
  const c = db.clients.find((x) => x.id === id);
  const errors = validateClient(patch, db.clients, id);
  if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos'), { fields: errors });
  const next = cleanClient(patch);
  const changes = diff(c, next, CLIENT_LABELS);
  if (!changes.length) return clone(c);
  Object.assign(c, next, { updatedAt: new Date().toISOString(), updatedByName: actor.displayName });
  log(auditEntry({ actor, action: 'cliente.editar', entityType: 'cliente', entityId: id, entityLabel: c.nombre, summary: 'Actualizó datos del socio', changes, clientId: id }));
  save(); return clone(c);
}
export async function deleteClient(actor, id, motivo = '') {
  await wait(350);
  const c = db.clients.find((x) => x.id === id);
  c.deleted = true; c.deletedAt = new Date().toISOString();
  log(auditEntry({ actor, action: 'cliente.eliminar', entityType: 'cliente', entityId: id, entityLabel: c.nombre, summary: `Dio de baja al socio${motivo ? `: ${motivo}` : ''}`, clientId: id }));
  save();
}
export async function reviewRequest(actor, id, action, comentario = '') {
  await wait(380);
  const req = db.requests.find((r) => r.id === id);
  const client = db.clients.find((c) => c.id === req.clientId);
  const out = applyReview(req, action, { actor, comentario, client, allCredits: db.credits });
  Object.assign(req, out.request);
  if (out.credit) {
    const credit = { id: uid('cr'), ...out.credit }; db.credits.push(credit); req.creditId = credit.id;
  }
  log(out.audit); save();
  return clone(req);
}
export async function resetDemo() { db = buildDemoData(); save(); }
