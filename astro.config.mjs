import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://opticacity.cl',
  // Permite compilar en otra carpeta: ASTRO_OUT_DIR=/ruta npm run build
  ...(process.env.ASTRO_OUT_DIR ? { outDir: process.env.ASTRO_OUT_DIR } : {}),
});
