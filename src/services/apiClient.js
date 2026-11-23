// Cliente HTTP de la API AdmCloud de FINIX (la misma que usa la app Android de socios).
// En el navegador la llamada va a la ruta propia /admcloud-api/ (ver API_BASE_URL en lib/env.js), que el hosting reenvía al servidor real:
// así no hay problemas de CORS ni de contenido mixto.
import { API_BASE_URL } from '../lib/env';

export class ApiError extends Error {
  constructor(message, { status = 0, network = false, timeout = false, body = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.network = network;
    this.timeout = timeout;
    this.body = body;
  }
}

const TIMEOUT_MS = 20000;

const parse = (text) => {
  if (text == null || text === '') return null;
  try { return JSON.parse(text); } catch { return null; }
};

// Devuelve { status, ok, body }. Solo lanza ApiError por fallas de red/tiempo de espera.
export async function http(method, path, { token, body, timeoutMs = TIMEOUT_MS } = {}) {
  const url = API_BASE_URL + String(path).replace(/^\//, '');
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // no-store: los datos de la cuenta nunca deben salir de una caché del navegador.
    const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctrl.signal, cache: 'no-store' });
    return { status: res.status, ok: res.ok, body: parse(await res.text()) };
  } catch (err) {
    if (err?.name === 'AbortError') throw new ApiError('La solicitud tardó demasiado. Intentá nuevamente.', { timeout: true });
    throw new ApiError('Sin conexión con el servidor. Revisá tu internet e intentá de nuevo.', { network: true });
  } finally { clearTimeout(timer); }
}

// ---- Utilidades de normalización de respuestas ----
// La API responde en camelCase y el cliente original lee sin distinguir mayúsculas: se normaliza todo a minúsculas.
export const lc = (v) => {
  if (Array.isArray(v)) return v.map(lc);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k.toLowerCase(), lc(x)]));
  return v;
};
// Mensaje de error del servidor (campo message/Message), si existe.
export const serverMessage = (body) => {
  const b = lc(body);
  return typeof b?.message === 'string' && b.message.trim() ? b.message.trim() : '';
};
