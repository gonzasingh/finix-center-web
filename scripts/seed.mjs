// Crea usuarios y datos iniciales en Firebase con el Admin SDK.
//
//   npm run seed -- staff --email valeria@tudominio.com --password "Clave-Segura-1" --name "Valeria Ortiz"
//   npm run seed -- socio --dni 40155350 --password "ClaveSocio1" --name "Rodrigo Emiliano Veliz" --address "Calle 123" --phone "+54 9 381 555 0142"
//   npm run seed -- demo     (colaborador + socios de ejemplo con créditos y solicitudes)
//
// Requiere una clave de cuenta de servicio: Firebase Console > Configuración > Cuentas de servicio > Generar clave privada.
// Guardala como ./serviceAccountKey.json (ya está en .gitignore) o apuntá GOOGLE_APPLICATION_CREDENTIALS a ese archivo.
import { readFileSync, existsSync } from 'node:fs';
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
initializeApp({ credential: existsSync(keyPath) ? cert(JSON.parse(readFileSync(keyPath, 'utf8'))) : applicationDefault() });
const auth = getAuth();
const db = getFirestore();
const DOMAIN = process.env.VITE_SOCIO_EMAIL_DOMAIN || 'socios.finixcenter.app';

const [cmd, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const day = 86400000;
const ts = (offsetDays = 0) => Timestamp.fromDate(new Date(Date.now() + offsetDays * day));

async function upsertAuthUser(email, password, displayName) {
  try { const u = await auth.getUserByEmail(email); await auth.updateUser(u.uid, { password, displayName }); return u.uid; }
  catch { return (await auth.createUser({ email, password, displayName })).uid; }
}

async function createStaff({ email, password, name }) {
  if (!email || !password || !name) throw new Error('Faltan --email, --password y --name');
  const uid = await upsertAuthUser(email.toLowerCase(), password, name);
  await db.doc(`users/${uid}`).set({ role: 'colaborador', displayName: name, email: email.toLowerCase(), active: true });
  console.log(`✔ Colaborador listo: ${name} <${email}>`);
}

async function createSocio({ dni, password, name, address = '', phone = '', legajo, score = 60 }) {
  if (!dni || !password || !name) throw new Error('Faltan --dni, --password y --name');
  const clientRef = db.doc(`clients/${dni}`); // el id del cliente es el DNI
  const exists = (await clientRef.get()).exists;
  if (!exists) {
    const max = (await db.collection('clients').get()).docs.reduce((m, d) => Math.max(m, d.data().legajo || 0), 100);
    await clientRef.set({ legajo: legajo || max + 1, nombre: name, dni, direccion: address, telefono: phone, score: Number(score), deleted: false, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), updatedByName: 'Sistema' });
  }
  const uid = await upsertAuthUser(`${dni}@${DOMAIN}`, password, name);
  await db.doc(`users/${uid}`).set({ role: 'socio', displayName: name, dni, clientId: dni });
  console.log(`✔ Socio listo: ${name} (DNI ${dni})`);
  return dni;
}

const credit = (clientId, numero, plan, cuotas, valorCuota, cuotasPagas, startDays) => {
  const days = { semanal: 7, quincenal: 15, mensual: 30 }[plan];
  return db.collection('credits').add({ clientId, numero, plan, cuotas, valorCuota, cuotasPagas, estado: cuotasPagas >= cuotas ? 'cancelado' : 'activo', inicio: ts(-startDays), primerVencimiento: ts(-startDays + days) });
};

async function demo() {
  await createStaff({ email: 'colaborador@finixcenter.com', password: 'Finix2026!', name: 'Valeria Ortiz' });
  const socios = [
    ['40155350', 'Rodrigo Emiliano Veliz', 'Pasaje Los Jazmines 458, B° Norte, San Miguel de Tucumán', '+54 9 381 555 0142', 226, 78],
    ['32456781', 'María Fernanda Ledesma', 'Av. Belgrano 1893, Salta Capital', '+54 9 387 411 2290', 118, 94],
    ['28900412', 'Carlos Alberto Núñez', 'Calle Mitre 702, San Salvador de Jujuy', '+54 9 388 502 7731', 131, 38],
  ];
  for (const [dni, name, address, phone, legajo, score] of socios) await createSocio({ dni, password: 'demo1234', name, address, phone, legajo, score });
  await credit('40155350', '226/0', 'semanal', 12, 140000, 12, 120);
  await credit('40155350', '226/1', 'semanal', 12, 143333, 1, 10);
  await credit('40155350', '226/2', 'semanal', 14, 197143, 0, 3);
  await credit('32456781', '118/0', 'quincenal', 12, 85000, 4, 70);
  await credit('28900412', '131/0', 'semanal', 12, 98000, 5, 91);
  await db.collection('requests').add({ clientId: '40155350', numero: 1, monto: 150000, plan: 'quincenal', cuotas: 12, promo: false, comentario: 'Necesito ampliar mi negocio.', estado: 'en_revision', creditId: null, createdAt: ts(-4), updatedAt: ts(-1),
    timeline: [{ estado: 'ingresada', fecha: new Date(Date.now() - 4 * day).toISOString(), detalle: 'Se actualizó el estado de tu solicitud', by: 'Rodrigo Emiliano Veliz' }, { estado: 'en_revision', fecha: new Date(Date.now() - day).toISOString(), detalle: 'La empresa comenzó a revisar tu solicitud', by: 'Valeria Ortiz' }] });
  console.log('✔ Datos de ejemplo cargados. Socio: DNI 40155350 / demo1234 · Colaborador: colaborador@finixcenter.com / Finix2026!');
}

try {
  if (cmd === 'staff') await createStaff(flags);
  else if (cmd === 'socio') await createSocio({ ...flags, name: flags.name });
  else if (cmd === 'demo') await demo();
  else console.log('Uso: npm run seed -- <staff|socio|demo> [--flags]  (ver comentarios al inicio de scripts/seed.mjs)');
} catch (e) { console.error('✖', e.message); process.exit(1); }
