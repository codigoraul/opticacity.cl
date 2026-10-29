import { muestra, type Producto } from '../data/productos';

const WP_URL = (import.meta.env.WP_URL ?? '').replace(/\/$/, '');

interface StoreProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  prices: { price: string; currency_minor_unit: number };
  images: { src: string; alt: string }[];
  categories: { name: string }[];
  type?: string;
  variations?: { id: number; attributes: { name: string; value: string }[] }[];
  attributes?: { taxonomy: string; terms: { name: string; slug?: string }[] }[];
}

const strip = (h: string) => h.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const terms = (p: StoreProduct, tax: string) => (p.attributes ?? []).find((a) => a.taxonomy === tax)?.terms.map((t) => t.name) ?? [];

/** Fotos por color: salen de las imágenes de cada variación en WooCommerce. */
async function fotosPorColor(p: StoreProduct): Promise<Record<string, string[]>> {
  if (p.type !== 'variable') return {};
  const res = await fetch(`${WP_URL}/wp-json/wc/store/v1/products?type=variation&parent=${p.id}&per_page=100`);
  if (!res.ok) return {};
  const vars = (await res.json()) as { id: number; images?: { src: string }[] }[];
  const porId = new Map(vars.map((v) => [v.id, (v.images ?? []).map((i) => i.src)]));
  const colores = (p.attributes ?? []).find((a) => a.taxonomy === 'pa_color')?.terms ?? [];
  const out: Record<string, string[]> = {};
  for (const v of p.variations ?? []) {
    const slug = v.attributes.find((a) => a.name.toLowerCase() === 'color')?.value;
    const term = colores.find((t) => t.slug === slug);
    const imgs = porId.get(v.id) ?? [];
    if (term && imgs.length) out[term.name] = [...new Set([...(out[term.name] ?? []), ...imgs])];
  }
  return out;
}

function mapear(p: StoreProduct): Producto {
  const minor = p.prices?.currency_minor_unit ?? 0;
  const raw = Number(p.prices?.price ?? 0) / 10 ** minor;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    code: p.sku || String(p.id),
    category: p.categories?.[0]?.name ?? 'Anteojos',
    price: raw > 0 ? raw : null, // precio 0 en WooCommerce = "Consultar precio"
    images: (p.images ?? []).map((i) => i.src),
    description: strip(p.short_description || p.description || ''),
    colors: terms(p, 'pa_color'),
    sizes: terms(p, 'pa_material'),
    usos: terms(p, 'pa_uso-cristal'),
    tipos: terms(p, 'pa_tipo-cristal'),
    variations: (p.variations ?? []).map((v) => ({ id: v.id, attrs: Object.fromEntries(v.attributes.map((a) => [a.name.toLowerCase(), a.value])) })),
  };
}

// Fotos de muestra (solo lentes) para productos que aún no tienen imagen en WordPress.
const FOTOS_MUESTRA = [
  [import.meta.env.BASE_URL + 'img/yh101-col01.jpg', import.meta.env.BASE_URL + 'img/yh101-front.jpg'],
  [import.meta.env.BASE_URL + 'img/yh101-col04.jpg', import.meta.env.BASE_URL + 'img/yh101-front.jpg'],
  [import.meta.env.BASE_URL + 'img/yh101-col05.jpg', import.meta.env.BASE_URL + 'img/yh101-front.jpg'],
];
const conFotos = (items: Producto[]) =>
  items.map((p, i) => (p.images.length || Object.keys(p.colorImages ?? {}).length ? p : { ...p, images: FOTOS_MUESTRA[i % FOTOS_MUESTRA.length], muestra: true }));

let cache: Promise<{ items: Producto[]; fuente: 'woocommerce' | 'muestra' }> | undefined;

async function cargar() {
  if (!WP_URL) return { items: muestra, fuente: 'muestra' as const };
  try {
    const items: Producto[] = [];
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${WP_URL}/wp-json/wc/store/v1/products?per_page=100&page=${page}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const lote = (await res.json()) as StoreProduct[];
      for (const raw of lote) if (!raw.categories?.some((c) => c.name === 'Cristales')) items.push({ ...mapear(raw), colorImages: await fotosPorColor(raw) });
      if (lote.length < 100) break;
    }
    if (!items.length) throw new Error('sin productos');
    return { items: conFotos(items), fuente: 'woocommerce' as const };
  } catch (e) {
    console.warn(`[woo] No se pudo leer ${WP_URL}: ${(e as Error).message}. Se usan productos de muestra.`);
    return { items: muestra, fuente: 'muestra' as const };
  }
}

/** Productos de WooCommerce (Store API pública). Una sola lectura por compilación. */
export const getProductos = () => (cache ??= cargar());

export interface Complemento { id: number; price: number }

/**
 * Cristales como productos de WooCommerce (categoría "Cristales"): el precio real vive allá.
 * Devuelve SKU -> { id, price }. Si WordPress no responde, queda vacío y la web usa src/data/cristales.ts.
 */
let cacheC: Promise<Record<string, Complemento>> | undefined;
export const getComplementos = () =>
  (cacheC ??= (async () => {
    const out: Record<string, Complemento> = {};
    if (!WP_URL) return out;
    try {
      const res = await fetch(`${WP_URL}/wp-json/wc/store/v1/products?per_page=100&category=cristales`);
      if (!res.ok) return out;
      for (const p of (await res.json()) as StoreProduct[]) {
        const minor = p.prices?.currency_minor_unit ?? 0;
        if (p.sku) out[p.sku] = { id: p.id, price: Number(p.prices?.price ?? 0) / 10 ** minor };
      }
    } catch (e) {
      console.warn(`[woo] No se pudieron leer los cristales: ${(e as Error).message}`);
    }
    return out;
  })());
