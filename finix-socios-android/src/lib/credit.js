import { BUSINESS } from '../config/business';

// Simulador: interés simple por período (6% estándar, 5% con Supermiércoles). Coincide con la maqueta de la app:
// $300.000 a 7 semanas => cuota $60.857, total $426.000, interés $126.000.
export function simulate({ amount, periods, promo = false, rate: customRate }) {
  if (!Number.isInteger(periods) || periods < 1) throw new Error('La cantidad de cuotas debe ser un entero positivo');
  periods = Math.min(periods, Math.max(...Object.values(BUSINESS.plans).map(({ max }) => max)));
  const rate = customRate ?? (promo ? BUSINESS.rates.supermiercoles : BUSINESS.rates.standard);
  const interest = Math.round(amount * rate * periods);
  const total = amount + interest;
  return { rate, interest, total, installment: Math.round(total / periods), periods };
}

export const isWednesday = (d = new Date()) => d.getDay() === 3;
const DAY = 86400000;
export const addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY);
export const nextWeekday = (weekday, from = new Date()) => {
  let d = new Date(from); d.setHours(12, 0, 0, 0);
  while (d.getDay() !== weekday) d = addDays(d, 1);
  return d;
};

// Estadísticas derivadas de un crédito (se guardan solo cuotas, valor y cuotas pagas).
export function creditStats(c) {
  // Créditos reales de la API: los importes vienen calculados por el servidor.
  if (c.real) return { total: c.real.total, pagado: c.real.pagado, saldo: c.real.saldo, avance: c.real.avance, restantes: c.real.restantes };
  const total = c.valorCuota * c.cuotas;
  const pagado = c.valorCuota * c.cuotasPagas;
  return { total, pagado, saldo: total - pagado, avance: Math.round((c.cuotasPagas / c.cuotas) * 100), restantes: c.cuotas - c.cuotasPagas };
}

// Cronograma de cuotas con estado (pagada / vencida / pendiente).
export function buildSchedule(c, now = new Date()) {
  const days = BUSINESS.plans[c.plan]?.days ?? 7;
  return Array.from({ length: c.cuotas }, (_, i) => {
    const due = addDays(new Date(c.primerVencimiento), i * days);
    const estado = i < c.cuotasPagas ? 'pagada' : due < new Date(now.getTime() - DAY) ? 'vencida' : 'pendiente';
    return { n: i + 1, due, monto: c.valorCuota, estado };
  });
}
export const nextInstallment = (c, now) => {
  if (c.estado !== 'activo') return null;
  if (c.real) return c.proximoVencimiento ? { n: null, due: new Date(c.proximoVencimiento), monto: c.proximaCuota ?? c.valorCuota, estado: c.alerta === 'atraso' ? 'vencida' : 'pendiente' } : null;
  return buildSchedule(c, now).find((q) => q.estado !== 'pagada');
};
export const overdueCount = (c, now) => (c.estado === 'activo' ? buildSchedule(c, now).filter((q) => q.estado === 'vencida').length : 0);

// Etiqueta del plan: los créditos reales pueden traer un plan que no está en la configuración local.
export const planLabel = (c) => BUSINESS.plans[c.plan]?.label || c.planTexto || '—';

// Score de pago (0-100).
export function scoreInfo(score = 0) {
  if (score >= 85) return { label: 'Excelente', tone: 'emerald', color: '#34d399' };
  if (score >= 70) return { label: 'Bueno', tone: 'gold', color: '#E2BF60' };
  if (score >= 50) return { label: 'Regular', tone: 'amber', color: '#f59e0b' };
  return { label: 'En riesgo', tone: 'rose', color: '#fb7185' };
}

export const REQUEST_STATES = {
  ingresada: { label: 'Ingresada', tone: 'sky' },
  en_revision: { label: 'En revisión', tone: 'gold' },
  observada: { label: 'Observada', tone: 'amber' },
  correccion_recibida: { label: 'Corrección recibida', tone: 'violet' },
  preaprobada: { label: 'Preaprobada', tone: 'violet' },
  aprobada: { label: 'Aprobada', tone: 'emerald' },
  autorizada: { label: 'Autorizada', tone: 'emerald' },
  credito_otorgado: { label: 'Crédito otorgado', tone: 'emerald' },
  rechazada: { label: 'Rechazada', tone: 'rose' },
};
// Estados en los que la solicitud ya no está "en curso".
export const FINAL_REQUEST_STATES = ['aprobada', 'autorizada', 'credito_otorgado', 'rechazada'];
// Estado de una solicitud con respaldo para códigos que la app todavía no conoce (usa el nombre que informa el servidor).
export const reqState = (estado, nombre) => REQUEST_STATES[estado] || { label: nombre || String(estado || 'Sin estado'), tone: 'gray' };
export const requestDetail = {
  ingresada: 'Se actualizó el estado de tu solicitud',
  en_revision: 'La empresa comenzó a revisar tu solicitud',
  observada: 'La empresa solicitó información',
  correccion_recibida: 'Enviaste una corrección',
  aprobada: 'Tu solicitud fue aprobada',
  rechazada: 'Tu solicitud no pudo ser aprobada',
  preaprobada: 'Tu solicitud fue preaprobada',
  autorizada: 'Tu solicitud fue autorizada',
  credito_otorgado: 'Se otorgó tu crédito',
};
export const nextCreditNumber = (legajo, credits) => {
  const n = credits.filter((c) => c.clientId && String(c.numero).startsWith(`${legajo}/`)).length;
  return `${legajo}/${n}`;
};

// Auditoría: compara dos versiones de un registro y devuelve los campos que cambiaron.
export function diff(before, after, labels) {
  return Object.keys(labels)
    .filter((k) => String(before?.[k] ?? '') !== String(after?.[k] ?? ''))
    .map((k) => ({ field: k, label: labels[k], from: before?.[k] ?? '', to: after?.[k] ?? '' }));
}
export const CLIENT_LABELS = { nombre: 'Nombre completo', dni: 'DNI', direccion: 'Dirección', telefono: 'Teléfono' };

export const AUDIT_ACTIONS = {
  'cliente.crear': { label: 'Alta de socio', tone: 'emerald' },
  'cliente.editar': { label: 'Edición de socio', tone: 'gold' },
  'cliente.eliminar': { label: 'Baja de socio', tone: 'rose' },
  'solicitud.revision': { label: 'Solicitud en revisión', tone: 'sky' },
  'solicitud.observar': { label: 'Solicitud observada', tone: 'amber' },
  'solicitud.aprobar': { label: 'Crédito aprobado', tone: 'emerald' },
  'solicitud.rechazar': { label: 'Solicitud rechazada', tone: 'rose' },
};
