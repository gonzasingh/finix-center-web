// Proveedor de datos con FIREBASE (Auth + Firestore). Se activa automáticamente al definir VITE_FIREBASE_* en .env.local
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, limit, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firebaseConfig, SOCIO_EMAIL_DOMAIN } from '../lib/env';
import { validateClient, cleanClient, auditEntry, applyReview, newRequest } from './logic';
import { diff, CLIENT_LABELS, isWednesday } from '../lib/credit';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Firestore Timestamp -> ISO string (la UI trabaja siempre con strings ISO)
const plain = (v) => {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
};
const fromSnap = (s) => ({ id: s.id, ...plain(s.data()) });
const list = async (q) => (await getDocs(q)).docs.map(fromSnap);

async function loadProfile(user) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  const p = snap.data();
  if (p.role === 'colaborador' && p.active === false) return null;
  return { uid: user.uid, role: p.role, displayName: p.displayName, email: user.email, dni: p.dni, clientId: p.clientId };
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return cb(null);
    try { cb(await loadProfile(user)); } catch { cb(null); }
  });
}

export async function signIn({ mode, identifier, password }) {
  const email = mode === 'socio' ? `${String(identifier).replace(/\D/g, '')}@${SOCIO_EMAIL_DOMAIN}` : String(identifier).trim().toLowerCase();
  let cred;
  try { cred = await signInWithEmailAndPassword(auth, email, password); }
  catch { throw new Error(mode === 'socio' ? 'Documento o contraseña incorrectos' : 'Email o contraseña incorrectos'); }
  const profile = await loadProfile(cred.user);
  if (!profile || profile.role !== (mode === 'socio' ? 'socio' : 'colaborador')) {
    await fbSignOut(auth);
    throw new Error(mode === 'socio' ? 'Esta cuenta no pertenece a un socio' : 'Esta cuenta no tiene acceso de colaborador');
  }
}
export const signOut = () => fbSignOut(auth);

// ---------- Socio ----------
export async function getSocioOverview(profile) {
  const [clientSnap, credits, requests] = await Promise.all([
    getDoc(doc(db, 'clients', profile.clientId)),
    list(query(collection(db, 'credits'), where('clientId', '==', profile.clientId))),
    list(query(collection(db, 'requests'), where('clientId', '==', profile.clientId))),
  ]);
  return { client: fromSnap(clientSnap), credits, requests };
}
export async function createRequest(profile, { monto, plan, cuotas, comentario, promo, rate, tipoCredito }) {
  const [clientSnap, existing] = await Promise.all([
    getDoc(doc(db, 'clients', profile.clientId)),
    list(query(collection(db, 'requests'), where('clientId', '==', profile.clientId))),
  ]);
  const data = newRequest({ client: fromSnap(clientSnap), monto, plan, cuotas, comentario, existing, promo: promo ?? isWednesday(), rate, tipoCredito });
  const ref = doc(collection(db, 'requests'));
  const batch = writeBatch(db);
  batch.set(ref, data);
  await batch.commit();
  return { id: ref.id, ...data };
}

// ---------- Colaborador ----------
export const listClients = async () => (await list(collection(db, 'clients'))).filter((c) => !c.deleted);
export const listCredits = () => list(collection(db, 'credits'));
export const listRequests = () => list(collection(db, 'requests'));
export const listAudit = () => list(query(collection(db, 'auditLogs'), orderBy('ts', 'desc'), limit(500)));

const withAudit = (batch, entry) => batch.set(doc(collection(db, 'auditLogs')), { ...entry, ts: serverTimestamp() });

export async function createClient(actor, data) {
  const all = await list(collection(db, 'clients'));
  const errors = validateClient(data, all);
  if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos'), { fields: errors });
  const ref = doc(collection(db, 'clients'));
  const legajo = Math.max(100, ...all.map((c) => c.legajo || 0)) + 1;
  const clean = cleanClient(data);
  const batch = writeBatch(db);
  batch.set(ref, { legajo, ...clean, score: 60, deleted: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), updatedBy: actor.uid, updatedByName: actor.displayName });
  withAudit(batch, auditEntry({ actor, action: 'cliente.crear', entityType: 'cliente', entityId: ref.id, entityLabel: clean.nombre, summary: `Dio de alta al socio (DNI ${clean.dni})`, clientId: ref.id }));
  await batch.commit();
  return { id: ref.id, legajo, ...clean };
}
export async function updateClient(actor, id, patch) {
  const all = await list(collection(db, 'clients'));
  const errors = validateClient(patch, all, id);
  if (Object.keys(errors).length) throw Object.assign(new Error('Revisá los datos'), { fields: errors });
  const before = all.find((c) => c.id === id);
  const next = cleanClient(patch);
  const changes = diff(before, next, CLIENT_LABELS);
  if (!changes.length) return before;
  const batch = writeBatch(db);
  batch.update(doc(db, 'clients', id), { ...next, updatedAt: serverTimestamp(), updatedBy: actor.uid, updatedByName: actor.displayName });
  withAudit(batch, auditEntry({ actor, action: 'cliente.editar', entityType: 'cliente', entityId: id, entityLabel: next.nombre, summary: 'Actualizó datos del socio', changes, clientId: id }));
  await batch.commit();
  return { ...before, ...next };
}
export async function deleteClient(actor, id, motivo = '') {
  const snap = await getDoc(doc(db, 'clients', id));
  const batch = writeBatch(db);
  batch.update(doc(db, 'clients', id), { deleted: true, deletedAt: serverTimestamp(), deletedBy: actor.uid, deletedByName: actor.displayName, deleteReason: motivo });
  withAudit(batch, auditEntry({ actor, action: 'cliente.eliminar', entityType: 'cliente', entityId: id, entityLabel: snap.data().nombre, summary: `Dio de baja al socio${motivo ? `: ${motivo}` : ''}`, clientId: id }));
  await batch.commit();
}
export async function reviewRequest(actor, id, action, comentario = '') {
  const reqSnap = await getDoc(doc(db, 'requests', id));
  const req = fromSnap(reqSnap);
  const [clientSnap, allCredits] = await Promise.all([getDoc(doc(db, 'clients', req.clientId)), list(collection(db, 'credits'))]);
  const out = applyReview(req, action, { actor, comentario, client: fromSnap(clientSnap), allCredits });
  const batch = writeBatch(db);
  let creditId = req.creditId || null;
  if (out.credit) {
    const cref = doc(collection(db, 'credits'));
    creditId = cref.id;
    batch.set(cref, { ...out.credit, approvedAt: serverTimestamp() });
  }
  const { id: _id, ...reqData } = out.request;
  batch.update(doc(db, 'requests', id), { ...reqData, creditId, updatedAt: serverTimestamp() });
  withAudit(batch, out.audit);
  await batch.commit();
  return { ...out.request, creditId };
}
export async function resetDemo() { /* solo aplica al modo demo */ }
