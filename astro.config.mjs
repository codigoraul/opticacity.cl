import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://opticacity.cl',
  // BASE_PATH=/prueba publica el sitio en una subcarpeta (ej. https://opticacity.cl/prueba)
  base: (process.env.BASE_PATH || '/').replace(/\/?$/, '/'),
  // Permite compilar en otra carpeta: ASTRO_OUT_DIR=/ruta npm run build
  ...(process.env.ASTRO_OUT_DIR ? { outDir: process.env.ASTRO_OUT_DIR } : {}),
});
