// Datos del negocio y reglas del simulador. Editá este archivo para actualizar la web sin tocar componentes.
export const BUSINESS = {
  name: 'FINIX Center',
  whatsapp: '5493834709315',
  whatsappDisplay: '+54 9 3834 709315',
  email: '', // TODO: completar el mail institucional (si queda vacío no se muestra)
  hours: 'Lunes a Viernes 09:00 - 18:00 hs',
  headquarters: 'Casa Central: Tucumán, Argentina',
  coverage: ['Casa Central Tucumán', 'Salta', 'Jujuy', 'Catamarca'],
  social: { instagram: '', facebook: '' }, // TODO: completar redes
  // Tasa por período, interés simple (según la maqueta de la app). Supermiércoles: solicitudes ingresadas los miércoles.
  rates: { standard: 0.06, supermiercoles: 0.05 },
  plans: {
    semanal: { label: 'Semanal', days: 7, unit: 'semanas', min: 4, max: 26, default: 7 },
    quincenal: { label: 'Quincenal', days: 15, unit: 'quincenas', min: 2, max: 24, default: 12 },
    mensual: { label: 'Mensual', days: 30, unit: 'meses', min: 3, max: 24, default: 12 },
  },
  amount: { min: 50000, max: 5000000, step: 10000, chips: [100000, 300000, 500000, 1000000] },
  usd: { buy: 1185, sell: 1215 },
  branches: [
    { name: 'Sucursal Barrio Norte', address: 'Av. Sarmiento 1240', hours: '09 a 18 hs', phone: '381 555-0224' },
    { name: 'Sucursal Centro', address: 'Av. Sarmiento 1240', hours: '09 a 18 hs', phone: '381 555-0110' },
  ],
  requirements: {
    personal: ['Recibo de sueldo (antigüedad 1 año)', 'D.N.I.', 'Boleta de servicios'],
    comercial: ['Titular de comercio (dueño)', 'D.N.I.', 'Boleta de servicio'],
  },
};

export const waLink = (text = 'Hola FINIX Center, quisiera consultar por sus servicios financieros.') =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;
