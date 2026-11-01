import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'dist');
const redirects = JSON.parse(
  await readFile(path.join(root, 'src/data/legacy-redirects.json'), 'utf8'),
);
const publishedPages = (
  await Promise.all(
    ['navigation', 'tool-pages'].map(async (name) =>
      JSON.parse(
        await readFile(path.join(root, `src/data/${name}.json`), 'utf8'),
      ),
    ),
  )
).flat();
const domain = (await readFile(path.join(root, 'public/CNAME'), 'utf8')).trim();
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  );

for (const [from, target] of Object.entries(redirects)) {
  if (publishedPages.some((page) => page.href === from))
    throw new Error(`Redirect would overwrite a published page: ${from}`);
  const file = path.resolve(output, from.slice(1));
  if (!from.endsWith('.html') || !file.startsWith(output + path.sep))
    throw new Error(`Invalid redirect path: ${from}`);
  const canonical = new URL(target, `https://${domain}`);
  canonical.hash = '';
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(
    file,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page moved | Christopher Flathmann</title><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0;url=${escape(target)}"><link rel="canonical" href="${escape(canonical.href)}"></head><body><p>This content has moved. <a href="${escape(target)}">Continue to the current page.</a></p></body></html>`,
  );
}
console.log(
  `Generated ${Object.keys(redirects).length} compatibility redirects.`,
);
