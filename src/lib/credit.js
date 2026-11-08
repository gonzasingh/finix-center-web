import { BUSINESS } from '../config/business';

// Simulador: interés simple por período (6% estándar, 5% con Supermiércoles). Coincide con la maqueta de la app:
// $300.000 a 7 semanas => cuota $60.857, total $426.000, interés $126.000.
export function simulate({ amount, periods, promo = false }) {
  const rate = promo ? BUSINESS.rates.supermiercoles : BUSINESS.rates.standard;
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
export const nextInstallment = (c, now) => (c.estado === 'activo' ? buildSchedule(c, now).find((q) => q.estado !== 'pagada') : null);
export const overdueCount = (c, now) => (c.estado === 'activo' ? buildSchedule(c, now).filter((q) => q.estado === 'vencida').length : 0);

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
  aprobada: { label: 'Aprobada', tone: 'emerald' },
  rechazada: { label: 'Rechazada', tone: 'rose' },
};
export const requestDetail = {
  ingresada: 'Se actualizó el estado de tu solicitud',
  en_revision: 'La empresa comenzó a revisar tu solicitud',
  observada: 'La empresa solicitó información',
  correccion_recibida: 'Enviaste una corrección',
  aprobada: 'Tu solicitud fue aprobada',
  rechazada: 'Tu solicitud no pudo ser aprobada',
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
