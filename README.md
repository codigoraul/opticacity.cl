# Óptica City · Astro

Sitio público de opticacity.cl (Astro). Backend futuro: WordPress headless + WooCommerce.

## Comandos
- `npm install`
- `npm run dev` → http://localhost:4321
- `npm run build` → carpeta `dist/`

## Páginas
- `/` home
- `/producto/<slug>` ficha con configurador (una por producto)

## Datos
Por ahora **estáticos**: `src/data/productos.ts` (se edita ahí).
La lectura de WooCommerce ya está lista en `src/lib/woo.ts` y se activa sola cuando existe `WP_URL`
(ver `.env.example`). Sin `WP_URL`, o si WordPress no responde, se usan los datos estáticos.

## Pendiente
- Fotos por color (variaciones de WooCommerce), precios reales de cristales, tintes y tratamientos.
- Catálogo, carrito y checkout; pasarela de pago y despacho.
