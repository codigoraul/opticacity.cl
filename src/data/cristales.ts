// Precios y textos de cristales (de ejemplo hasta que la clienta confirme los reales).
// Las claves deben coincidir con los valores de los atributos en WooCommerce.
export const cristales = {
  usos: {
    'Solo armazón': { d: 'Sin cristales', p: 0 },
    'Monofocal': { d: 'Una sola graduación, de lejos o de cerca', p: 25000 },
    'Bifocal': { d: 'Lejos y cerca con línea visible', p: 45000 },
    'Progresivo': { d: 'Todas las distancias, sin línea', p: 79000 },
  } as Record<string, { d: string; p: number }>,
  tipos: {
    'Transparente': { d: 'Cristal tradicional, sin filtro', p: 0 },
    'Filtro luz azul': { d: 'Menos fatiga frente a pantallas', p: 10000 },
  } as Record<string, { d: string; p: number }>,
};
