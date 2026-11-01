import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chrisflathmann.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) =>
        ![
          'oldindex',
          '404',
          'figure-options',
          'figure-originals',
          'playbook-preview',
        ].some(
          (name) =>
            new URL(page).pathname.replace(/\/$/, '').replace(/\.html$/, '') ===
            `/${name}`,
        ),
    }),
  ],
});
