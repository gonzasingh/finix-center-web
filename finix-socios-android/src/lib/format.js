const TZ = 'America/Argentina/Buenos_Aires';
const num = (n, d = 0) => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });

export const money = (n) => `$${num(n, 2)}`;      // $2.760.002,00
export const moneyInt = (n) => `$${num(n, 0)}`;   // $197.143
export const toDate = (v) => (v?.toDate ? v.toDate() : v instanceof Date ? v : new Date(v));

export function fmtDate(v) {
  if (!v) return '—';
  return toDate(v).toLocaleDateString('es-AR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function fmtTime(v, seconds = false) {
  if (!v) return '—';
  return toDate(v).toLocaleTimeString('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}), hour12: false });
}
export const fmtDateTime = (v, seconds = false) => (v ? `${fmtDate(v)} ${fmtTime(v, seconds)}` : '—');
export const weekday = (v) => {
  const s = toDate(v).toLocaleDateString('es-AR', { timeZone: TZ, weekday: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
export const firstName = (name = '') => name.split(' ')[0] || '';
export const greeting = () => {
  const h = Number(new Date().toLocaleTimeString('es-AR', { timeZone: TZ, hour: '2-digit', hour12: false }));
  return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
};
export const normalize = (s = '') => s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
