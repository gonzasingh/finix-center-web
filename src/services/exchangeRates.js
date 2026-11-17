// Cotización del dólar blue desde APIs públicas (gratuitas, sin API key, con CORS habilitado).
// Orden de prioridad: DolarApi.com -> Bluelytics -> (si ambas fallan) el valor manual de BUSINESS.usd.
import { BUSINESS } from '../config/business';

const SOURCES = [
  {
    id: 'dolarapi',
    url: 'https://dolarapi.com/v1/dolares/blue',
    // { compra, venta, fechaActualizacion }
    parse: (d) => ({ buy: d?.compra, sell: d?.venta, updatedAt: d?.fechaActualizacion }),
  },
  {
    id: 'bluelytics',
    url: 'https://api.bluelytics.com.ar/v2/latest',
    // { blue: { value_buy, value_sell }, last_update }
    parse: (d) => ({ buy: d?.blue?.value_buy, sell: d?.blue?.value_sell, updatedAt: d?.last_update }),
  },
];

const CACHE_KEY = 'finix:usd';
const CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hora: se usa solo para mostrar algo al instante mientras llega el dato fresco

const isPrice = (n) => typeof n === 'number' && Number.isFinite(n) && n > 0;

async function getJson(url, signal, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

// Margen opcional (en %) para mostrar el precio propio de la casa sobre la referencia del mercado.
// Ej.: buyMarginPct: -2 => "Compramos" 2% por debajo del blue; sellMarginPct: 1 => "Vendemos" 1% por encima.
function applyMargin({ buy, sell }) {
  const { buyMarginPct = 0, sellMarginPct = 0 } = BUSINESS.usdLive || {};
  return {
    buy: Math.round(buy * (1 + buyMarginPct / 100)),
    sell: Math.round(sell * (1 + sellMarginPct / 100)),
  };
}

export async function fetchLiveDollar(signal) {
  let lastError;
  for (const source of SOURCES) {
    try {
      const raw = source.parse(await getJson(source.url, signal));
      // Si una fuente devuelve datos raros, se descarta y se prueba la siguiente.
      if (!isPrice(raw.buy) || !isPrice(raw.sell) || raw.sell < raw.buy) throw new Error('Datos inválidos');
      const updated = raw.updatedAt ? new Date(raw.updatedAt) : new Date();
      return {
        ...applyMargin(raw),
        updatedAt: Number.isNaN(updated.getTime()) ? new Date() : updated,
        source: source.id,
      };
    } catch (err) {
      if (signal?.aborted) throw err;
      lastError = err;
    }
  }
  throw lastError || new Error('Sin cotización disponible');
}

export function manualDollar() {
  return { buy: BUSINESS.usd.buy, sell: BUSINESS.usd.sell, updatedAt: null, source: 'manual' };
}

export function readCachedDollar() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (c && isPrice(c.buy) && isPrice(c.sell) && Date.now() - c.savedAt < CACHE_MAX_AGE) {
      return { buy: c.buy, sell: c.sell, updatedAt: new Date(c.updatedAt), source: c.source };
    }
  } catch { /* sin caché */ }
  return null;
}

export function cacheDollar(rate) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...rate, updatedAt: rate.updatedAt.toISOString(), savedAt: Date.now() }));
  } catch { /* modo privado / sin espacio */ }
}
