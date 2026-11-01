import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import navigation from './src/data/navigation.json' with { type: 'json' };
import tools from './src/data/tool-pages.json' with { type: 'json' };

const route = (url) =>
  new URL(url, 'https://chrisflathmann.com').pathname
    .replace(/\.html$/, '')
    .replace(/\/$/, '') || '/';
const visibleRoutes = new Set(
  [...navigation, ...tools].map((page) => route(page.href)),
);

export default defineConfig({
  site: 'https://chrisflathmann.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => visibleRoutes.has(route(page)),
      serialize: (item) => {
        const url = new URL(item.url);
        if (url.pathname !== '/' && !url.pathname.endsWith('.html'))
          url.pathname = `${url.pathname.replace(/\/$/, '')}.html`;
        return { ...item, url: url.href };
      },
    }),
  ],
});
