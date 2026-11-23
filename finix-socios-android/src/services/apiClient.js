// Cliente HTTP de la API AdmCloud (la misma que usa la app anterior com.finix.center).
// En Android usa el HTTP nativo de Capacitor: evita CORS y "contenido mixto" (la API responde por http://) y
// funciona con el network_security_config que habilita texto plano solo para el dominio de la API.
import { Capacitor, CapacitorHttp } from '@capacitor/core';
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
const native = Capacitor.isNativePlatform();

const parse = (data) => {
  if (data == null || data === '') return null;
  if (typeof data !== 'string') return data;
  try { return JSON.parse(data); } catch { return null; }
};

// Devuelve { status, ok, body }. Solo lanza ApiError por fallas de red/tiempo de espera.
export async function http(method, path, { token, body, timeoutMs = TIMEOUT_MS } = {}) {
  const url = API_BASE_URL + String(path).replace(/^\//, '');
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    if (native) {
      const res = await CapacitorHttp.request({ url, method, headers, data: body, connectTimeout: timeoutMs, readTimeout: timeoutMs });
      return { status: res.status, ok: res.status >= 200 && res.status < 300, body: parse(res.data) };
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctrl.signal });
      return { status: res.status, ok: res.ok, body: parse(await res.text()) };
    } finally { clearTimeout(timer); }
  } catch (err) {
    const msg = String(err?.message || err || '');
    if (err?.name === 'AbortError' || /time.?out|timed out/i.test(msg)) throw new ApiError('La solicitud tardó demasiado. Intentá nuevamente.', { timeout: true });
    throw new ApiError('Sin conexión con el servidor. Revisá tu internet e intentá de nuevo.', { network: true });
  }
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
