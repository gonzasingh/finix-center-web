// Datos del negocio y reglas del simulador. Editá este archivo para actualizar la web sin tocar componentes.
export const BUSINESS = {
  name: 'FINIX Center',
  whatsapp: '5493834709315',
  whatsappDisplay: '+54 9 3834 709315',
  email: '', // TODO: completar el mail institucional (si queda vacío no se muestra)
  hours: 'Lunes a Viernes 09:00 - 18:00 hs',
  headquarters: 'Casa Central: Tucumán, Argentina',
  coverage: ['Río Piedras', 'El Galpón', 'San José de Metán', 'Rosario de la Frontera', 'El Tala', 'Trancas', 'San Pedro de Colalao'],
  social: { instagram: '', facebook: '' }, // TODO: completar redes
  // Tasa por período, interés simple (según la maqueta de la app). Supermiércoles: solicitudes ingresadas los miércoles.
  rates: { standard: 0.06, supermiercoles: 0.05 },
  plans: {
    semanal: { label: 'Semanal', days: 7, unit: 'semanas', min: 4, max: 16, default: 7 },
    quincenal: { label: 'Quincenal', days: 15, unit: 'quincenas', min: 2, max: 16, default: 12 },
    mensual: { label: 'Mensual', days: 30, unit: 'meses', min: 3, max: 16, default: 12 },
  },
  amount: { min: 50000, max: 5000000, step: 10000, chips: [100000, 300000, 500000, 1000000] },
  simulator: {
    personal: {
      label: 'Crédito Personal',
      amount: { min: 50000, max: 1000000, step: 10000, chips: [100000, 300000, 500000, 1000000] },
      plans: {
        mensual: { label: 'Mensual', unit: 'meses', min: 1, max: 4, default: 4, rate: 0.22 },
      },
    },
    comercial: {
      label: 'Crédito Comercial',
      amount: { min: 50000, max: 5000000, step: 10000, chips: [100000, 300000, 500000, 1000000] },
      plans: {
        quincenal: { label: 'Quincenal', unit: 'quincenas', min: 2, max: 16, default: 12, rate: 0.12 },
        semanal: { label: 'Semanal', unit: 'semanas', min: 4, max: 16, default: 7, rate: 0.06, promoRate: 0.05 },
      },
    },
  },
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
