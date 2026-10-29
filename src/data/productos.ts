export interface Producto {
  id: number;
  slug: string;
  name: string;
  code: string;        // SKU
  category: string;
  price: number | null; // CLP; null = "Consultar precio"
  images: string[];
  description: string;
  colors: string[];
  sizes: string[];
  usos: string[];
  tipos: string[];
  colorImages?: Record<string, string[]>; // fotos por color (variaciones de WooCommerce)
  variations?: { id: number; attrs: Record<string, string> }[]; // variaciones de WooCommerce: id y atributos (slug)
  muestra?: boolean; // true = fotos de muestra (sin fotos reales en WordPress)
}

export const clp = (n: number) => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Muestra: se usa solo cuando WP_URL no está definido o WordPress no responde.
const m = (id: number, slug: string, name: string, code: string, price: number | null, images: string[]): Producto =>
  ({ id, slug, name, code, category: 'Anteojos', price, images, muestra: true, description: '', colors: ['Negro', 'Café', 'Rosado'], sizes: ['Acetato', 'Metal'], usos: ['Solo armazón', 'Monofocal', 'Bifocal', 'Progresivo'], tipos: ['Transparente', 'Filtro luz azul'] });

export const muestra: Producto[] = [
  m(1, 'armazon-as9', 'Armazón AS9', 'AS9', 29000, [import.meta.env.BASE_URL + 'img/g3.jpg', import.meta.env.BASE_URL + 'img/hero2.jpg', import.meta.env.BASE_URL + 'img/tienda2.jpg']),
  m(2, 'armazon-im205', 'Armazón IM205', 'IM205', 29000, [import.meta.env.BASE_URL + 'img/g2.jpg']),
  m(3, 'tr90-animal-print-cafe', 'TR90 animal print café', 'TR90-AP', null, [import.meta.env.BASE_URL + 'img/mujer.jpg']),
  m(4, 'armazon-tr90-azul', 'Armazón TR90 azul', 'TR90-AZ', null, [import.meta.env.BASE_URL + 'img/hombre.jpg']),
  m(5, 'armazon-lazzari-an1023', 'Armazón Lazzari AN1023', 'AN1023', null, [import.meta.env.BASE_URL + 'img/g1.jpg']),
  m(6, 'armazon-ac31', 'Armazón AC31', 'AC31', null, [import.meta.env.BASE_URL + 'img/g4.jpg']),
];
