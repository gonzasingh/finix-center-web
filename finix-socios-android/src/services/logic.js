// Lógica de negocio del socio (funciones puras, sin persistencia). Idéntica a la de la web.
import { requestDetail } from '../lib/credit';
import { BUSINESS } from '../config/business';

function validateInstallments(plan, cuotas) {
  const rules = BUSINESS.plans[plan];
  if (!rules) throw new Error('Plan inválido');
  if (!Number.isInteger(cuotas) || cuotas < rules.min || cuotas > rules.max) {
    throw new Error(`La cantidad de cuotas debe ser entre ${rules.min} y ${rules.max}`);
  }
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
