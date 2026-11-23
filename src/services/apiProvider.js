// Proveedor de datos REAL: API AdmCloud de FINIX (mismos endpoints que la app Android de socios).
// Convierte las respuestas del servidor al formato que consumen las pantallas del portal.
import { EMPRESA_CODIGO } from '../lib/env';
import { BUSINESS } from '../config/business';
import { http, lc, serverMessage, ApiError } from './apiClient';

const SESSION_KEY = 'finix_api_session_v1';
const SESSION_EXPIRED = 'La sesión expiró. Iniciá sesión nuevamente.';

// ---------------------------------------------------------------- sesión
const b64 = (s) => { const t = s.replace(/-/g, '+').replace(/_/g, '/'); return atob(t + '='.repeat((4 - (t.length % 4)) % 4)); };
const tokenExpired = (token) => {
  try { const { exp } = JSON.parse(b64(token.split('.')[1])); return typeof exp === 'number' && exp * 1000 < Date.now() + 15000; } catch { return false; } // si no es un JWT legible se confía en el 401 del servidor
};
let session = null;
try {
  const s = JSON.parse(localStorage.getItem(SESSION_KEY));
  if (s?.token && s?.profile && !tokenExpired(s.token)) session = s;
  else localStorage.removeItem(SESSION_KEY);
} catch { session = null; }
const listeners = new Set();
const setSession = (s) => {
  session = s;
  try { s ? localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(SESSION_KEY); } catch { /* almacenamiento no disponible */ }
  listeners.forEach((l) => l(session?.profile ?? null));
};

export function onAuthChange(cb) {
  listeners.add(cb);
  Promise.resolve().then(() => cb(session?.profile ?? null));
  if (session) loadEmpresa(); // datos públicos de contacto de la empresa (no bloquea)
  return () => listeners.delete(cb);
}

// ---------------------------------------------------------------- helpers
// Sesión vencida: se cierra y la pantalla de ingreso avisa el motivo.
const expire = () => { try { sessionStorage.setItem('finix_login_notice', SESSION_EXPIRED); } catch { /* noop */ } setSession(null); };
// Llamada autenticada. 401 => la sesión terminó: se cierra y se avisa.
async function call(method, path, body) {
  if (!session) throw new ApiError(SESSION_EXPIRED, { status: 401 });
  const res = await http(method, path, { token: session.token, body });
  if (res.status === 401) { expire(); throw new ApiError(SESSION_EXPIRED, { status: 401 }); }
  if (res.status === 403) throw new ApiError('No tenés permiso para consultar esta información.', { status: 403 });
  if (!res.ok) throw new ApiError(failMsg(res), { status: res.status, body: res.body });
  const b = lc(res.body);
  if (b && b.success === false) throw new ApiError(b.message || 'No se pudo completar la operación.', { status: res.status });
  return b;
}
// Mensaje para una respuesta con error: el del servidor si lo trae; si el servicio no responde (5xx / ruta inexistente), uno claro para el socio.
const failMsg = (res) => serverMessage(res.body) || (res.status >= 500 || res.status === 404 || res.status === 405 ? `No pudimos conectar con el servidor de FINIX. Intentá de nuevo en unos minutos. (código ${res.status})` : `El servidor respondió con el código ${res.status}.`);
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const strip = (s = '') => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Fechas: las "…Utc" se interpretan en UTC; el resto como hora de Argentina (UTC-3, sin horario de verano).
function toIso(v, utc = false) {
  if (!v) return null;
  let s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T12:00:00';
  s = s.replace(/(\.\d{3})\d+/, '$1');
  if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) s += utc ? 'Z' : '-03:00';
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const planKey = (t) => { const s = strip(t); return s.includes('seman') ? 'semanal' : s.includes('quinc') ? 'quincenal' : s.includes('mens') ? 'mensual' : null; };
const REQ_CODES = { ingresada: 'ingresada', en_revision: 'en_revision', observada: 'observada', corregida: 'correccion_recibida', preaprobada: 'preaprobada', autorizada: 'autorizada', credito_otorgado: 'credito_otorgado', rechazada: 'rechazada', aprobada: 'aprobada' };
const reqKey = (code) => { const k = strip(code).replace(/[\s-]+/g, '_'); return REQ_CODES[k] || k || 'ingresada'; };
const ACTION_TEXT = {
  TOMAR_REVISION: 'La empresa comenzó a revisar tu solicitud.', OBSERVAR: 'La empresa solicitó información adicional.', CORREGIR: 'Enviaste una corrección.', ENVIAR_CORRECCION: 'Enviaste una corrección.',
  REVISAR_CORRECCION: 'La empresa retomó la revisión.', PREAPROBAR: 'La solicitud fue preaprobada.', RECHAZAR: 'La solicitud fue rechazada.', AUTORIZAR: 'La solicitud fue autorizada.',
};

// ---------------------------------------------------------------- login
export async function signIn({ identifier, password }) {
  const documento = String(identifier).trim().replace(/[.\s-]/g, '');
  if (!documento) throw new Error('Ingresá tu número de documento.');
  if (!password) throw new Error('Ingresá tu contraseña.');
  const res = await http('POST', 'ClienteAuth/login', { body: { empresa: EMPRESA_CODIGO, documento, password } });
  if (res.status === 401) throw new Error('Documento o contraseña incorrectos.');
  if (res.status === 400) throw new Error(serverMessage(res.body) || 'Los datos ingresados no son válidos.');
  if (!res.ok) throw new Error(failMsg(res));
  const b = lc(res.body);
  if (!b) throw new Error('La API devolvió una respuesta vacía.');
  const d = b.data && typeof b.data === 'object' ? b.data : b;
  if (b.success === false || d.success === false) throw new Error(b.message || d.message || 'No se pudo iniciar sesión.');
  const token = d.token || b.token;
  if (!token) throw new Error('La respuesta no contiene un token válido.');
  const id = String(d.idcliente ?? b.idcliente ?? documento);
  setSession({
    token,
    profile: { uid: id, role: 'socio', displayName: d.nombre || b.nombre || 'Socio', dni: String(d.documento || documento), clientId: id, empresa: d.empresacodigo || EMPRESA_CODIGO },
  });
  loadEmpresa();
}
export const signOut = async () => { setSession(null); };

// ---------------------------------------------------------------- datos de la empresa (públicos)
let empresaLoaded = false;
async function loadEmpresa() {
  if (empresaLoaded) return;
  empresaLoaded = true;
  try {
    const res = await http('GET', `Empresa/${encodeURIComponent(EMPRESA_CODIGO)}`);
    if (!res.ok) { empresaLoaded = false; return; }
    const e = lc(res.body); const d = e?.data && typeof e.data === 'object' ? e.data : e;
    if (d?.email) BUSINESS.email = String(d.email);
    if (/^https?:\/\//i.test(d?.instagram || '')) BUSINESS.social.instagram = d.instagram;
    if (/^https?:\/\//i.test(d?.facebook || '')) BUSINESS.social.facebook = d.facebook;
  } catch { empresaLoaded = false; /* la app funciona con los datos locales */ }
}

// ---------------------------------------------------------------- mapeos a las estructuras de las pantallas
const MOV_ORDER = (a, b) => (b.fecha || '').localeCompare(a.fecha || '') || num(b.orden) - num(a.orden);
function mapMovement(m) {
  return {
    id: String(m.id ?? `${m.fecha}-${m.orden}`), fecha: toIso(m.fecha), tipo: String(m.tipo || '').toUpperCase(), concepto: m.concepto || '',
    importe: num(m.importe), mostrarImporte: m.mostrarimporte !== false, estado: m.estado || '', ticket: m.ticket || '', formaPago: m.formapago || '', orden: num(m.orden),
  };
}

function mapCredit(c, stmt) {
  const total = num(c.montofinal);
  const pagado = num(c.pagado);
  const saldo = c.saldo == null ? Math.max(total - pagado, 0) : num(c.saldo);
  const cuotas = Math.max(num(c.numerocuotas), 0);
  const valorCuota = num(c.montocuota);
  const estadoTxt = String(c.estado || '');
  const cancelado = /cancel|finaliz/i.test(estadoTxt) || (total > 0 && saldo <= 0);
  const cuotasPagas = valorCuota > 0 ? clamp(Math.floor(pagado / valorCuota + 0.01), 0, cuotas || Infinity) : 0;
  const s = stmt || {};
  return {
    id: String(c.idventa), clientId: String(c.idcliente ?? ''), numero: String(c.numerocredito ?? c.idcredito ?? c.idventa),
    plan: planKey(c.plan), planTexto: c.plan || '', cuotas, valorCuota, cuotasPagas, estado: cancelado ? 'cancelado' : 'activo',
    inicio: toIso(c.fechainicio), diaCobro: c.diacobro ?? null,
    alerta: /atras|mora|vencid/i.test(estadoTxt) ? 'atraso' : /prox/i.test(estadoTxt) ? 'proximo' : null,
    real: { total, pagado, saldo, avance: total > 0 ? clamp(Math.round((pagado / total) * 100), 0, 100) : cancelado ? 100 : 0, restantes: valorCuota > 0 ? Math.max(Math.ceil(saldo / valorCuota - 0.01), 0) : Math.max(cuotas - cuotasPagas, 0) },
    proximoVencimiento: toIso(s.proximovencimiento), proximaCuota: s.proximacuota == null ? null : num(s.proximacuota),
    movimientos: (s.movimientos || []).map(mapMovement).sort(MOV_ORDER),
  };
}

function mapTimeline(items = [], resumen) {
  const list = items.map((t, i) => {
    const accion = String(t.codigoaccion || '').toUpperCase();
    return {
      id: String(t.id ?? i), estado: reqKey(t.estadonuevocodigo), estadoNombre: t.estadonuevonombre || '', fecha: toIso(t.fechautc, true),
      detalle: (t.observacion && String(t.observacion).trim()) || ACTION_TEXT[accion] || t.nombreaccion || 'Se actualizó el estado de la solicitud.',
      by: t.realizadoporcliente ? 'Vos' : 'FINIX Center',
    };
  }).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
  return list.length ? list : [{ id: 'actual', estado: resumen.estado, estadoNombre: resumen.estadoNombre, fecha: resumen.updatedAt, detalle: resumen.estadoDescripcion || 'Se actualizó el estado de la solicitud.', by: 'FINIX Center' }];
}

function mapRequest(r, det) {
  const d = det || {};
  const base = {
    id: String(r.id), numero: r.id, monto: num(d.montosolicitado ?? r.montosolicitado), plan: planKey(d.nombreplan ?? r.nombreplan), planTexto: d.nombreplan ?? r.nombreplan ?? '',
    cuotas: num(d.cuotas ?? r.cuotas), estado: reqKey(d.estadocodigo ?? r.estadocodigo), estadoNombre: d.estadonombre ?? r.estadonombre ?? '', estadoDescripcion: d.estadodescripcion || '',
    comentario: (d.comentario || '').trim(), createdAt: toIso(d.fecha ?? r.fecha), updatedAt: toIso(d.fechaultimocambioestadoutc ?? r.fechaultimocambioestadoutc, true) || toIso(d.fecha ?? r.fecha),
    requiereAtencion: !!(d.requiereatencion ?? r.requiereatencion), ultimaObservacion: (d.ultimaobservacion ?? r.ultimaobservacion) || '',
  };
  return { ...base, timeline: mapTimeline(d.timeline, base) };
}

function mapNotice(n) {
  return { id: String(n.id), title: n.titulo || 'Aviso', text: n.mensaje || '', date: toIso(n.fechautc, true), unread: !n.leida, tipo: String(n.tipo || ''), ruta: String(n.rutadestino || ''), refId: n.referenciaid == null ? null : String(n.referenciaid) };
}

// ---------------------------------------------------------------- lectura del socio
export async function getSocioOverview() {
  // Imprescindibles: si fallan, la pantalla muestra el error y permite reintentar (no se muestra información incompleta).
  const [perfilB, creditosB, solicitudesB] = await Promise.all([call('GET', 'ClientePerfil'), call('GET', 'ClienteCuenta/creditos'), call('GET', 'ClienteSolicitudes/mis-solicitudes')]);
  const avisosB = await call('GET', 'ClienteNotificaciones').catch(() => null); // los avisos son opcionales

  const rawCredits = (creditosB.creditos || creditosB.data?.creditos || []).filter((c) => c?.idventa != null);
  const rawRequests = (solicitudesB.solicitudes || solicitudesB.data?.solicitudes || []).filter((r) => r?.id != null);

  // Estado de cuenta por crédito. Si falla uno ACTIVO se informa el error: mostrar "sin cuotas pendientes" por una falla sería engañoso.
  const stmts = await Promise.allSettled(rawCredits.map((c) => call('GET', `ClienteCuenta/estado-cuenta/${encodeURIComponent(c.idventa)}`)));
  const credits = rawCredits.map((c, i) => {
    const r = stmts[i];
    const stmt = r.status === 'fulfilled' ? (r.value.data ?? r.value) : null;
    const isActive = !/cancel|finaliz/i.test(String(c.estado || '')) && !(num(c.montofinal) > 0 && c.saldo != null && num(c.saldo) <= 0);
    if (!stmt && isActive) throw r.reason instanceof ApiError ? r.reason : new ApiError('No pudimos cargar el estado de cuenta.');
    return mapCredit(c, stmt);
  });

  // Detalle (línea de tiempo) de las solicitudes más recientes. Si no llega, se muestra el estado actual.
  const recent = [...rawRequests].sort((a, b) => num(b.id) - num(a.id)).slice(0, 20);
  const details = await Promise.allSettled(recent.map((r) => call('GET', `crm/solicitudes/${encodeURIComponent(r.id)}/detalle`)));
  const detailById = new Map(recent.map((r, i) => [String(r.id), details[i].status === 'fulfilled' ? (details[i].value.data ?? details[i].value) : null]));
  const requests = rawRequests.map((r) => mapRequest(r, detailById.get(String(r.id))));

  const p = perfilB.data && typeof perfilB.data === 'object' ? perfilB.data : perfilB;
  const nombre = p.nombrecompleto || [p.nombre, p.apellido].filter(Boolean).join(' ') || session?.profile.displayName || '';
  const client = {
    id: String(p.idcliente ?? session?.profile.clientId ?? ''), nombre, dni: String(p.documento || session?.profile.dni || ''), direccion: p.direccion || '', telefono: p.telefono || '', email: p.email || '',
    empresa: p.empresanombre || '', legajo: null,
  };
  const notices = avisosB ? (avisosB.data?.notificaciones || avisosB.notificaciones || []).map(mapNotice) : [];
  return { client, credits, requests, notices, source: 'api' };
}

// ---------------------------------------------------------------- avisos
export async function markNoticeRead(id) { await call('POST', `ClienteNotificaciones/${encodeURIComponent(id)}/leer`); }
export async function markAllNoticesRead() { await call('POST', 'ClienteNotificaciones/leer-todas'); }

// ---------------------------------------------------------------- nueva solicitud de crédito
async function resolvePlanName(plan) {
  try {
    const res = await http('GET', `Publico/planes?empresaCodigo=${encodeURIComponent(EMPRESA_CODIGO)}`);
    const list = res.ok ? lc(res.body) : null;
    const items = Array.isArray(list) ? list : list?.planes || list?.data || [];
    const hit = items.find((x) => planKey(x.descripcion) === plan || planKey(x.tipopago) === plan);
    if (hit?.descripcion) return String(hit.descripcion);
  } catch { /* se usa el nombre local */ }
  return (BUSINESS.plans[plan]?.label || plan).toUpperCase();
}
export async function createRequest(profile, { monto, plan, cuotas, comentario }) {
  const perfilB = await call('GET', 'ClientePerfil');
  const p = perfilB.data && typeof perfilB.data === 'object' ? perfilB.data : perfilB;
  const nombrePlan = await resolvePlanName(plan);
  const res = await http('POST', 'Publico/solicitudes', {
    token: session?.token,
    body: {
      empresaCodigo: EMPRESA_CODIGO, nombre: p.nombre || profile.displayName, apellido: p.apellido || '', documento: String(p.documento || profile.dni), telefono: p.telefono || '', email: p.email || '',
      montoSolicitado: monto, nombrePlan, cuotas, comentario: (comentario || '').trim(),
    },
  });
  const b = lc(res.body);
  if (res.status === 401) { expire(); throw new ApiError(SESSION_EXPIRED, { status: 401 }); }
  if (!res.ok || b?.correcto === false) throw new ApiError(b?.mensaje || b?.message || 'No pudimos enviar la solicitud. Intentá de nuevo.', { status: res.status });
  return { id: String(b?.idsolicitud ?? '') };
}

// ---------------------------------------------------------------- cambio de contraseña
export async function changePassword({ actual, nueva, confirmacion }) {
  if (!actual) throw new Error('Ingresá tu contraseña actual.');
  if (!nueva) throw new Error('Ingresá la nueva contraseña.');
  if (nueva.length < 8) throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
  if (nueva !== confirmacion) throw new Error('La confirmación no coincide con la nueva contraseña.');
  if (nueva === actual) throw new Error('La nueva contraseña debe ser diferente de la actual.');
  if (!session) throw new ApiError('La sesión finalizó. Ingresá nuevamente.', { status: 401 });
  const res = await http('POST', 'ClienteAuth/cambiar-password', { token: session.token, body: { passwordActual: actual, passwordNueva: nueva, confirmacionPassword: confirmacion } });
  const msg = serverMessage(res.body);
  // 401 sin mensaje = token vencido; con mensaje = el servidor rechazó la contraseña actual.
  if (res.status === 401 && !msg) { expire(); throw new ApiError(SESSION_EXPIRED, { status: 401 }); }
  const b = lc(res.body);
  if (!res.ok || b?.success === false) throw new Error(msg || 'No se pudo cambiar la contraseña.');
  return msg || 'Tu contraseña fue actualizada.';
}
