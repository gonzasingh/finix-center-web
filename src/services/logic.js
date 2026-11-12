// Lógica de negocio compartida por el modo demo y el modo Firebase (funciones puras, sin persistencia).
import { simulate, nextCreditNumber, requestDetail, addDays } from '../lib/credit';
import { BUSINESS } from '../config/business';

export function validateClient(d, clients, selfId) {
  const e = {};
  if (!d.nombre?.trim() || d.nombre.trim().split(/\s+/).length < 2) e.nombre = 'Ingresá nombre y apellido';
  const dni = String(d.dni || '').trim();
  if (!/^\d{7,8}$/.test(dni)) e.dni = 'El DNI debe tener 7 u 8 dígitos';
  else if (clients.some((c) => !c.deleted && c.id !== selfId && c.dni === dni)) e.dni = 'Ya existe un socio con ese DNI';
  if (!d.direccion?.trim()) e.direccion = 'Ingresá la dirección';
  if (String(d.telefono || '').replace(/\D/g, '').length < 8) e.telefono = 'Ingresá un teléfono válido';
  return e;
}
export const cleanClient = (d) => ({
  nombre: d.nombre.trim().replace(/\s+/g, ' '),
  dni: String(d.dni).trim(),
  direccion: d.direccion.trim(),
  telefono: d.telefono.trim(),
});

export const auditEntry = ({ actor, action, entityType, entityId, entityLabel, summary, changes = [], clientId = null }) => ({
  actorId: actor.uid,
  actorName: actor.displayName,
  actorEmail: actor.email || '',
  action, entityType, entityId, entityLabel, summary, changes, clientId,
});

const STATE_BY_ACTION = { revision: 'en_revision', observar: 'observada', aprobar: 'aprobada', rechazar: 'rechazada' };
const AUDIT_BY_ACTION = { revision: 'solicitud.revision', observar: 'solicitud.observar', aprobar: 'solicitud.aprobar', rechazar: 'solicitud.rechazar' };

function validateInstallments(plan, cuotas) {
  const rules = BUSINESS.plans[plan];
  if (!rules) throw new Error('Plan inválido');
  if (!Number.isInteger(cuotas) || cuotas < rules.min || cuotas > rules.max) {
    throw new Error(`La cantidad de cuotas debe ser entre ${rules.min} y ${rules.max}`);
  }
}

// Aplica una acción del colaborador sobre una solicitud. Si se aprueba, genera el crédito.
export function applyReview(req, action, { actor, comentario = '', client, allCredits, now = new Date() }) {
  const estado = STATE_BY_ACTION[action];
  if (!estado) throw new Error('Acción inválida');
  if (['aprobada', 'rechazada'].includes(req.estado)) throw new Error('La solicitud ya fue resuelta');
  if (action === 'observar' && !comentario.trim()) throw new Error('Indicá qué información necesitás del socio');
  if (action === 'aprobar') validateInstallments(req.plan, req.cuotas);

  const detalle = action === 'observar' ? comentario.trim() : requestDetail[estado];
  const entry = { estado, fecha: now.toISOString(), detalle, by: actor.displayName };
  let credit = null;
  let creditId = req.creditId || null;

  if (action === 'aprobar') {
    const sim = simulate({ amount: req.monto, periods: req.cuotas, promo: !!req.promo, rate: req.rate });
    const days = { semanal: 7, quincenal: 15, mensual: 30 }[req.plan] ?? 7;
    credit = {
      clientId: req.clientId,
      numero: nextCreditNumber(client.legajo, allCredits.filter((c) => c.clientId === req.clientId)),
      plan: req.plan, cuotas: sim.periods, valorCuota: sim.installment, cuotasPagas: 0, estado: 'activo',
      inicio: now.toISOString(), primerVencimiento: addDays(now, days).toISOString(),
      requestId: req.id, approvedBy: actor.uid, approvedByName: actor.displayName, approvedAt: now.toISOString(),
    };
    creditId = 'pending';
  }
  const request = { ...req, estado, creditId, updatedAt: now.toISOString(), timeline: [...(req.timeline || []), entry] };
  const label = `Solicitud #${req.numero} · ${client.nombre}`;
  const summary = {
    revision: `Pasó la solicitud #${req.numero} a “En revisión”`,
    observar: `Observó la solicitud #${req.numero}: ${comentario.trim()}`,
    aprobar: `Aprobó la solicitud #${req.numero} y generó el crédito ${credit?.numero}`,
    rechazar: `Rechazó la solicitud #${req.numero}${comentario.trim() ? `: ${comentario.trim()}` : ''}`,
  }[action];
  return { request, credit, audit: auditEntry({ actor, action: AUDIT_BY_ACTION[action], entityType: 'solicitud', entityId: req.id, entityLabel: label, summary, clientId: req.clientId }) };
}

export function newRequest({ client, monto, plan, cuotas, comentario, existing, promo, rate, tipoCredito, now = new Date() }) {
  validateInstallments(plan, cuotas);
  const numero = existing.filter((r) => r.clientId === client.id).length + 1;
  return {
    clientId: client.id, numero, monto, plan, cuotas, promo: !!promo, ...(rate == null ? {} : { rate }), ...(tipoCredito ? { tipoCredito } : {}), comentario: (comentario || '').trim(),
    estado: 'ingresada', creditId: null, createdAt: now.toISOString(), updatedAt: now.toISOString(),
    timeline: [{ estado: 'ingresada', fecha: now.toISOString(), detalle: requestDetail.ingresada, by: client.nombre }],
  };
}
