// Precios y textos de cristales (de ejemplo hasta que la clienta confirme los reales).
// Las claves deben coincidir con los valores de los atributos en WooCommerce.
// `sku` enlaza con el producto de la categoría "Cristales" en WooCommerce: si existe, su precio manda y es el que se cobra.
export const cristales = {
  usos: {
    'Solo armazón': { d: 'Sin cristales', p: 0 },
    'Monofocal': { d: 'Una sola graduación, de lejos o de cerca', p: 25000, sku: 'CR-MONOFOCAL' },
    'Bifocal': { d: 'Lejos y cerca con línea visible', p: 45000, sku: 'CR-BIFOCAL' },
    'Progresivo': { d: 'Todas las distancias, sin línea', p: 79000, sku: 'CR-PROGRESIVO' },
  } as Record<string, { d: string; p: number; sku?: string }>,
  tipos: {
    'Transparente': { d: 'Cristal tradicional, sin filtro', p: 0 },
    'Filtro luz azul': { d: 'Menos fatiga frente a pantallas', p: 10000, sku: 'CR-LUZ-AZUL' },
  } as Record<string, { d: string; p: number; sku?: string }>,
};
