import { defineConfig } from 'astro/config';

import markdoc from '@astrojs/markdoc';

import react from '@astrojs/react';

import keystatic from '@keystatic/astro';

import tailwindcss from '@tailwindcss/vite';

import alpinejs from '@astrojs/alpinejs';

import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://manuelrojas.cl',
  output: 'static',
  adapter: netlify(),
  trailingSlash: 'ignore',

  build: {
    format: 'directory',
  },

  integrations: [
    markdoc(),
    react(),
    ...(process.env.SKIP_KEYSTATIC ? [] : [keystatic()]),
    alpinejs(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});