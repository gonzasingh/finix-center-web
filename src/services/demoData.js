// Datos ficticios para el modo demo. Todas las fechas son relativas a "hoy" para que la demo siempre se vea vigente.
import { addDays, nextWeekday } from '../lib/credit';
import { BUSINESS } from '../config/business';

export const DEMO_STAFF = [
  { uid: 'u-staff-1', role: 'colaborador', displayName: 'Valeria Ortiz', email: 'colaborador@finixcenter.com', password: 'Finix2026!' },
  { uid: 'u-staff-2', role: 'colaborador', displayName: 'Martín Sosa', email: 'martin@finixcenter.com', password: 'Finix2026!' },
];
export const DEMO_SOCIO_PASSWORD = 'demo1234';
export const DEMO_SOCIO_DNI = '40155350';

// [nombre, dni, dirección, teléfono, score, legajo, [[plan, cuotas, valorCuota, pagadas, diasDesdeInicio], ...]]
const SPECS = [
  ['Rodrigo Emiliano Veliz', '40155350', 'Pasaje Los Jazmines 458, B° Norte, San Miguel de Tucumán', '+54 9 381 555 0142', 78, 226, 'RODRIGO'],
  ['María Fernanda Ledesma', '32456781', 'Av. Belgrano 1893, Salta Capital', '+54 9 387 411 2290', 94, 118, [['quincenal', 12, 85000, 4, 70], ['semanal', 10, 60000, 10, 150]]],
  ['Carlos Alberto Núñez', '28900412', 'Calle Mitre 702, San Salvador de Jujuy', '+54 9 388 502 7731', 38, 131, [['semanal', 12, 98000, 5, 91]]],
  ['Lucía Belén Aguirre', '41233908', 'Av. Mate de Luna 2210, San Miguel de Tucumán', '+54 9 381 622 1045', 88, 142, [['mensual', 12, 120000, 3, 95]]],
  ['Juan Pablo Rojas', '35677120', 'Barrio 9 de Julio, Mza. C Casa 14, Catamarca', '+54 9 383 440 9812', 71, 155, [['semanal', 14, 72000, 6, 49], ['semanal', 8, 50000, 8, 120]]],
  ['Silvana Beatriz Cruz', '30112345', 'Av. San Martín 455, Salta Capital', '+54 9 387 399 1604', 83, 167, [['quincenal', 8, 150000, 2, 33]]],
  ['Héctor Daniel Medina', '26788451', 'Calle Lavalle 1180, San Miguel de Tucumán', '+54 9 381 477 3320', 55, 173, [['semanal', 10, 120000, 5, 63]]],
  ['Valentina Soledad Paz', '43120987', 'Pasaje Güemes 90, San Salvador de Jujuy', '+54 9 388 611 4057', 91, 189, [['mensual', 6, 95000, 6, 190]]],
  ['Ramiro Joaquín Torres', '38455012', 'Av. Virgen del Valle 3350, Catamarca', '+54 9 383 455 2288', 66, 194, [['semanal', 12, 64000, 3, 28], ['quincenal', 6, 110000, 6, 130]]],
  ['Gabriela Noemí Sosa', '29345670', 'Calle 24 de Septiembre 1520, San Miguel de Tucumán', '+54 9 381 530 8861', 97, 201, [['semanal', 12, 45000, 9, 70]]],
  ['Federico Nicolás Ibarra', '36890321', 'Av. Paraguay 780, Salta Capital', '+54 9 387 655 0912', 47, 208, [['semanal', 10, 88000, 2, 77]]],
  ['Mónica Elizabeth Gómez', '24567890', 'Calle Alvear 366, San Salvador de Jujuy', '+54 9 388 470 6615', 80, 215, [['quincenal', 10, 70000, 5, 80]]],
  ['Agustín Leandro Herrera', '42005678', 'Barrio Parque Sur, Mza. B Casa 3, Catamarca', '+54 9 383 462 7743', 74, 233, []],
  ['Natalia Romina Villagra', '33780124', 'Av. Roca 2045, San Miguel de Tucumán', '+54 9 381 588 3100', 61, 240, [['mensual', 9, 135000, 2, 70]]],
];

export function buildDemoData(now = new Date()) {
  const iso = (d) => new Date(d).toISOString();
  const ago = (days, hh = 10, mm = 0) => { const d = addDays(now, -days); d.setHours(hh, mm, 0, 0); return d; };
  const clients = [], credits = [], requests = [];

  SPECS.forEach((s, i) => {
    const [nombre, dni, direccion, telefono, score, legajo, cr] = s;
    const id = `c-${i + 1}`;
    clients.push({ id, legajo, nombre, dni, direccion, telefono, score, createdAt: iso(ago(200 - i * 9)), updatedAt: iso(ago(30 - i)), updatedByName: 'Valeria Ortiz', deleted: false });
    const mk = (idx, plan, cuotas, valorCuota, cuotasPagas, dias, over = {}) => {
      const days = BUSINESS.plans[plan].days; const inicio = ago(dias);
      credits.push({ id: `cr-${id}-${idx}`, clientId: id, numero: `${legajo}/${idx}`, plan, cuotas, valorCuota, cuotasPagas, estado: cuotasPagas >= cuotas ? 'cancelado' : 'activo',
        inicio: iso(inicio), primerVencimiento: iso(addDays(inicio, days)), ...over });
    };
    if (cr === 'RODRIGO') {
      mk(0, 'semanal', 12, 140000, 12, 120);                                                    // cancelado (100% pagado)
      mk(1, 'semanal', 12, 143333, 1, 10);                                                       // activo
      mk(2, 'semanal', 14, 197143, 0, 3, { primerVencimiento: iso(nextWeekday(2, now)) });     // activo: próxima cuota un martes
    } else cr.forEach((c, k) => mk(k, ...c));
  });

  const rodrigo = 'c-1';
  const mkReq = (id, clientId, numero, monto, plan, cuotas, estado, comentario, tl) =>
    requests.push({ id, clientId, numero, monto, plan, cuotas, promo: false, comentario, estado, creditId: null, createdAt: tl[0].fecha, updatedAt: tl[tl.length - 1].fecha, timeline: tl });
  mkReq('r-1', rodrigo, 1, 150000, 'quincenal', 12, 'correccion_recibida', 'Necesito ampliar mi negocio.', [
    { estado: 'ingresada', fecha: iso(ago(18, 13, 23)), detalle: 'Se actualizó el estado de tu solicitud', by: 'Rodrigo Emiliano Veliz' },
    { estado: 'en_revision', fecha: iso(ago(5, 10, 38)), detalle: 'La empresa comenzó a revisar tu solicitud', by: 'Martín Sosa' },
    { estado: 'observada', fecha: iso(ago(3, 16, 10)), detalle: 'La empresa solicitó información', by: 'Martín Sosa' },
    { estado: 'correccion_recibida', fecha: iso(ago(2, 8, 40)), detalle: 'Enviaste una corrección', by: 'Rodrigo Emiliano Veliz' },
  ]);
  mkReq('r-2', rodrigo, 2, 300000, 'semanal', 7, 'en_revision', 'Capital para mercadería.', [
    { estado: 'ingresada', fecha: iso(ago(4, 9, 15)), detalle: 'Se actualizó el estado de tu solicitud', by: 'Rodrigo Emiliano Veliz' },
    { estado: 'en_revision', fecha: iso(ago(1, 11, 5)), detalle: 'La empresa comenzó a revisar tu solicitud', by: 'Valeria Ortiz' },
  ]);
  mkReq('r-3', 'c-4', 1, 500000, 'mensual', 12, 'ingresada', 'Remodelación del local.', [
    { estado: 'ingresada', fecha: iso(ago(0, 8, 50)), detalle: 'Se actualizó el estado de tu solicitud', by: 'Lucía Belén Aguirre' } ]);
  mkReq('r-4', 'c-10', 1, 200000, 'semanal', 10, 'ingresada', 'Compra de herramientas.', [
    { estado: 'ingresada', fecha: iso(ago(1, 17, 30)), detalle: 'Se actualizó el estado de tu solicitud', by: 'Gabriela Noemí Sosa' } ]);
  mkReq('r-5', 'c-13', 1, 250000, 'quincenal', 8, 'observada', 'Capital de trabajo.', [
    { estado: 'ingresada', fecha: iso(ago(6, 12, 0)), detalle: 'Se actualizó el estado de tu solicitud', by: 'Agustín Leandro Herrera' },
    { estado: 'en_revision', fecha: iso(ago(5, 9, 20)), detalle: 'La empresa comenzó a revisar tu solicitud', by: 'Valeria Ortiz' },
    { estado: 'observada', fecha: iso(ago(4, 15, 45)), detalle: 'Falta adjuntar boleta de servicio actualizada', by: 'Valeria Ortiz' } ]);

  const A = (days, hh, mm, actor, action, entityType, entityId, entityLabel, summary, changes = [], clientId = null) => ({
    id: `a-${days}-${hh}${mm}-${entityId}`, ts: iso(ago(days, hh, mm)), actorId: actor.uid, actorName: actor.displayName, actorEmail: actor.email,
    action, entityType, entityId, entityLabel, summary, changes, clientId });
  const [V, M] = DEMO_STAFF;
  const audit = [
    A(1, 11, 5, V, 'solicitud.revision', 'solicitud', 'r-2', 'Solicitud #2 · Rodrigo Emiliano Veliz', 'Pasó la solicitud #2 a “En revisión”', [], 'c-1'),
    A(2, 9, 12, M, 'cliente.editar', 'cliente', 'c-5', 'Juan Pablo Rojas', 'Actualizó datos del socio', [{ field: 'telefono', label: 'Teléfono', from: '+54 9 383 440 9800', to: '+54 9 383 440 9812' }], 'c-5'),
    A(3, 16, 10, M, 'solicitud.observar', 'solicitud', 'r-1', 'Solicitud #1 · Rodrigo Emiliano Veliz', 'Observó la solicitud #1: La empresa solicitó información', [], 'c-1'),
    A(4, 15, 45, V, 'solicitud.observar', 'solicitud', 'r-5', 'Solicitud #1 · Agustín Leandro Herrera', 'Observó la solicitud #1: Falta adjuntar boleta de servicio actualizada', [], 'c-13'),
    A(5, 10, 38, M, 'solicitud.revision', 'solicitud', 'r-1', 'Solicitud #1 · Rodrigo Emiliano Veliz', 'Pasó la solicitud #1 a “En revisión”', [], 'c-1'),
    A(7, 14, 22, V, 'cliente.editar', 'cliente', 'c-3', 'Carlos Alberto Núñez', 'Actualizó datos del socio', [{ field: 'direccion', label: 'Dirección', from: 'Calle Mitre 700, San Salvador de Jujuy', to: 'Calle Mitre 702, San Salvador de Jujuy' }], 'c-3'),
    A(9, 12, 30, M, 'solicitud.aprobar', 'solicitud', 'r-0', 'Solicitud #2 · Silvana Beatriz Cruz', 'Aprobó la solicitud #2 y generó el crédito 167/0', [], 'c-6'),
    A(15, 10, 2, V, 'cliente.crear', 'cliente', 'c-14', 'Natalia Romina Villagra', 'Dio de alta al socio (DNI 33780124)', [], 'c-14'),
    A(21, 17, 40, M, 'cliente.editar', 'cliente', 'c-10', 'Gabriela Noemí Sosa', 'Actualizó datos del socio', [{ field: 'direccion', label: 'Dirección', from: 'Calle 24 de Septiembre 1500, San Miguel de Tucumán', to: 'Calle 24 de Septiembre 1520, San Miguel de Tucumán' }], 'c-10'),
  ];
  return { clients, credits, requests, audit };
}
