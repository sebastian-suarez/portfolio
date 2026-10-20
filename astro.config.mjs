// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Lightning CSS folds animation-timeline into the animation shorthand when
      // minifying, which browsers reject, so the scroll-driven rules would vanish.
      cssMinify: false,
    },
  },

  site: "https://sebastiansuarez.dev",

  // No web fonts: the glass design uses the system stack (see global.css).
});
