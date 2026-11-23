import { useEffect, useState } from 'react';
import { DEMO } from './env';
import { NEWS_URL } from '../config/news';

// Secciones del portal a las que puede apuntar un banner.
export const PORTAL_SECTIONS = ['simulador', 'requisitos', 'sucursales', 'atencion', 'nosotros', 'creditos', 'solicitudes', 'avisos', 'perfil'];

const BUNDLED = 'novedades/novedades.json'; // kit de ejemplo incluido en el sitio (public/novedades): respaldo si no se puede descargar el archivo remoto
const CACHE_KEY = 'finix_news_v1';
const MIN_GAP_MS = 60 * 1000; // no consultar más de una vez por minuto

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Solo se aceptan direcciones https (o de la propia app). Las relativas se resuelven contra la dirección del novedades.json.
function safeUrl(value, base) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const u = new URL(value.trim(), base);
    const ok = u.protocol === 'https:' || u.origin === window.location.origin || (DEMO && /^(localhost|127\.0\.0\.1)$/.test(u.hostname));
    return ok ? u.href : '';
  } catch { return ''; }
}

// Valida el JSON remoto y devuelve los banners vigentes. Cualquier dato raro se descarta en vez de romper la pantalla.
export function normalizeNews(raw, base, today = dayKey()) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.banners) ? raw.banners : [];
  const seen = new Set();
  return list.map((b, i) => {
    if (!b || typeof b !== 'object' || b.activo === false) return null;
    if (b.desde && String(b.desde).slice(0, 10) > today) return null; // todavía no empezó
    if (b.hasta && String(b.hasta).slice(0, 10) < today) return null; // ya terminó
    const title = str(b.titulo, 90);
    if (!title) return null;
    let id = str(String(b.id ?? ''), 60) || `banner-${i + 1}`;
    while (seen.has(id)) id += '-';
    seen.add(id);
    const d = b.destino && typeof b.destino === 'object' ? b.destino : {};
    let action = null;
    if (d.tipo === 'web') { const url = safeUrl(d.url, base); if (url) action = { type: 'web', url }; }
    else if (d.tipo === 'app' && typeof d.seccion === 'string') action = { type: 'app', section: d.seccion };
    return { id, tag: str(b.etiqueta, 28), title, text: str(b.texto, 140), image: safeUrl(b.imagen, base), fit: b.ajuste === 'contener' ? 'contain' : 'cover', action };
  }).filter(Boolean).slice(0, 12);
}

async function getJson(url, timeout = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

// ---- Estado compartido (una sola descarga para toda la app) ----
let raw = null; let base = ''; let inflight = null; let lastTry = 0; let lastOk = false;
let state = { items: [], ready: false };
const subs = new Set();
const publish = (next) => { state = next; subs.forEach((fn) => fn(state)); };
const recompute = () => { if (raw) publish({ items: normalizeNews(raw, base), ready: true }); };

try {
  const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); // última versión descargada: se muestra al instante y sin conexión
  if (c?.raw) { raw = c.raw; base = c.base || ''; state = { items: normalizeNews(raw, base), ready: true }; }
} catch { /* sin caché */ }

export function refreshNews(force = false) {
  recompute(); // también re-evalúa las fechas de vigencia
  if (inflight) return inflight;
  if (!force && lastOk && Date.now() - lastTry < MIN_GAP_MS) return Promise.resolve();
  lastTry = Date.now();
  inflight = (async () => {
    try {
      if (NEWS_URL) {
        try {
          raw = await getJson(NEWS_URL); base = NEWS_URL; lastOk = true;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ raw, base })); } catch { /* sin espacio */ }
          recompute(); return;
        } catch { lastOk = false; }
      }
      // Sin archivo remoto ni versión guardada: se usa el kit incluido en el sitio, así la sección nunca queda vacía por una falla de red.
      if (!raw) { base = new URL(import.meta.env.BASE_URL + BUNDLED, window.location.origin).href; raw = await getJson(base); recompute(); }
    } catch { /* sin novedades */ } finally {
      if (!state.ready) publish({ items: state.items, ready: true });
      inflight = null;
    }
  })();
  return inflight;
}

export function useNews() {
  const [s, setS] = useState(state);
  useEffect(() => {
    subs.add(setS); setS(state); refreshNews();
    const onVisible = () => { if (document.visibilityState === 'visible') refreshNews(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { subs.delete(setS); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  return s;
}
