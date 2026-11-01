import assert from 'node:assert/strict';
import { readFile, readdir, stat, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const readJson = async (file) =>
  JSON.parse(await readFile(path.join(root, file), 'utf8'));
const manifest = await readJson('scripts/legacy-manifest.json');
const publications = await readJson('src/data/publications.json');
const funding = await readJson('src/data/funding.json');
const failures = [];
let checkedLinks = 0;
let checkedAssets = 0;
async function filesIn(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await filesIn(file)));
    else result.push(file);
  }
  return result;
}
async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}
function verify(condition, message) {
  if (!condition) failures.push(message);
}
for (const url of manifest.urls)
  verify(
    await exists(path.join(dist, url === '/' ? 'index.html' : url.slice(1))),
    `Missing legacy URL: ${url}`,
  );
for (const [url, hash] of Object.entries(manifest.preserved)) {
  // The academic CV is maintained independently and must remain replaceable.
  if (url.endsWith('.DS_Store') || url === '/CV.pdf') continue;
  checkedAssets++;
  const file = path.join(dist, url.slice(1));
  if (await exists(file))
    verify(
      createHash('sha256')
        .update(await readFile(file))
        .digest('hex') === hash,
      `Original asset changed: ${url}`,
    );
  else failures.push(`Missing original asset: ${url}`);
}
const publicationHtml = await readFile(
  path.join(dist, 'publications.html'),
  'utf8',
);
for (const group of publications) {
  verify(
    group.items.length >= (manifest.publicationCounts[group.title] ?? 0),
    `Publication entries lost: ${group.title}`,
  );
  for (const item of group.items)
    verify(
      publicationHtml.includes(item.citationHtml),
      `Publication citation missing: ${item.id}`,
    );
}
const fundingHtml = await readFile(path.join(dist, 'funding.html'), 'utf8');
for (const group of funding.groups) {
  verify(
    group.items.length >= (manifest.fundingCounts[group.title] ?? 0),
    `Funding entries lost: ${group.title}`,
  );
  for (const item of group.items)
    verify(
      fundingHtml.includes(item.citationHtml),
      `Funding citation missing: ${item.year} ${item.award}`,
    );
}
for (const name of ['CV.pdf', 'Resume.pdf']) {
  const file = path.join(dist, name);
  const pdf = await readFile(file);
  verify(pdf.subarray(0, 5).toString() === '%PDF-', `Invalid PDF: ${name}`);
  verify(
    !(await lstat(file)).isSymbolicLink(),
    `${name} must be an independent file`,
  );
}
const newPages = [
  'index',
  'work',
  'about',
  'research',
  'contact',
  'publications',
  'funding',
  'teaching',
  'hcc-3030',
  'hcc-8600',
  'fun-tools',
  'dcom-bingo',
  '404',
  'oldindex',
];
for (const name of newPages) {
  const html = await readFile(path.join(dist, `${name}.html`), 'utf8');
  for (const [pattern, label] of [
    [/<html lang="en"/, 'language'],
    [/<h1[ >]/, 'main heading'],
    [/name="description"/, 'description'],
    [/rel="canonical"/, 'canonical'],
    [/property="og:image"/, 'social image'],
    [/type="application\/ld\+json"/, 'structured data'],
  ])
    verify(pattern.test(html), `Missing ${label}: ${name}`);
  verify(
    !/fonts\.googleapis|fonts\.gstatic/.test(html),
    `Fonts must be local: ${name}`,
  );
}
for (const name of ['index', 'about', 'contact']) {
  const html = await readFile(path.join(dist, `${name}.html`), 'utf8');
  verify(
    html.includes('href="/CV.pdf"') && html.includes('href="/Resume.pdf"'),
    `Both document links required: ${name}`,
  );
}
const home = await readFile(path.join(dist, 'index.html'), 'utf8');
verify(
  [...home.matchAll(/data-figure-option="playbook"/g)].length === 4,
  'The homepage must use the four selected playbook figures',
);
for (const kind of ['overview', 'knowledge', 'protection', 'coordination']) {
  const figureId = kind === 'overview' ? 'hero-overview' : `home-${kind}`;
  verify(
    home.includes(`id="${figureId}-title"`) &&
      home.includes(`id="${figureId}-desc"`),
    `Missing accessible figure: ${kind}`,
  );
  verify(
    [...home.matchAll(new RegExp(`data-figure="${kind}"`, 'g'))].length === 1,
    `Each figure must appear once on the homepage: ${kind}`,
  );
  for (const option of ['', 'playbook/']) {
    const svg = await readFile(
      path.join(dist, 'figures', `${option}${kind}.svg`),
      'utf8',
    );
    verify(
      /<title\b[^>]*>[^<]+<\/title>/.test(svg) &&
        /<desc\b[^>]*>[^<]+<\/desc>/.test(svg) &&
        /viewBox="[^"]+"/.test(svg),
      `Standalone figure needs a title, description, and viewBox: ${option}${kind}`,
    );
    verify(
      !/<(?:image|script|foreignObject)\b|data:image/i.test(svg),
      `Figure must remain native SVG without embedded artwork: ${option}${kind}`,
    );
    const embeddedFonts = [
      ...svg.matchAll(/data:font\/woff2;base64,([A-Za-z0-9+/=]+)/g),
    ];
    verify(
      embeddedFonts.length >= 2 &&
        embeddedFonts.every(
          (font) =>
            Buffer.from(font[1], 'base64').subarray(0, 4).toString() === 'wOF2',
        ),
      `Standalone lettering must work without a font request: ${option}${kind}`,
    );
    const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    verify(
      new Set(ids).size === ids.length,
      `Duplicate SVG IDs: ${option}${kind}`,
    );
    for (const match of svg.matchAll(/(?:href="#|url\(#)([^"\s)]+)/g))
      verify(
        ids.includes(match[1]),
        `Missing SVG reference in ${option}${kind}: ${match[1]}`,
      );
  }
}
for (const page of ['figure-options', 'figure-originals', 'playbook-preview']) {
  const html = await readFile(path.join(dist, `${page}.html`), 'utf8');
  verify(
    /name="robots" content="noindex, follow"/.test(html),
    `Design preview must stay out of search indexes: ${page}`,
  );
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  verify(
    new Set(ids).size === ids.length,
    `Duplicate IDs on figure preview: ${page}`,
  );
  verify(
    !(await readFile(path.join(dist, 'sitemap-0.xml'), 'utf8')).includes(
      `/${page}`,
    ),
    `Design preview must stay out of the sitemap: ${page}`,
  );
}
verify(
  await exists(path.join(dist, 'figures/Kalam-OFL.txt')),
  'Missing figure font license',
);
verify(
  await exists(path.join(dist, 'figures/SourceSans3-OFL.txt')),
  'Missing figure label font license',
);
const figureIds = [
  ...home.matchAll(
    /\bid="((?:hero-overview|home-(?:knowledge|protection|coordination))-[^"]+)"/g,
  ),
].map((match) => match[1]);
verify(
  new Set(figureIds).size === figureIds.length,
  'Homepage SVG IDs must be unique',
);
verify(
  (await readFile(path.join(dist, 'CNAME'), 'utf8')).trim() ===
    'chrisflathmann.com',
  'Custom domain changed',
);
verify(await exists(path.join(dist, 'sitemap-index.xml')), 'Missing sitemap');
verify(await exists(path.join(dist, '.nojekyll')), 'Missing .nojekyll');

const outputFiles = await filesIn(dist);
const documentCache = new Map();
async function documentAt(file) {
  if (!documentCache.has(file))
    documentCache.set(file, await readFile(file, 'utf8'));
  return documentCache.get(file);
}
for (const file of await filesIn(path.join(root, 'src'))) {
  if (!/\.(astro|ts|md|json|css)$/.test(file)) continue;
  const source = (await readFile(file, 'utf8')).replaceAll(
    'chris@cfjord.com',
    '',
  );
  verify(
    !/c[\s._-]*fjord|humanaiteaming\.com/i.test(source),
    `Retired company reference in source: ${path.relative(root, file)}`,
  );
}
for (const file of outputFiles) {
  if (/\.(html|css|js|json|svg|xml|txt|tex)$/.test(file)) {
    const text = await documentAt(file);
    const withoutEmail = text.replaceAll('chris@cfjord.com', '');
    verify(
      !/c[\s._-]*fjord|humanaiteaming\.com/i.test(withoutEmail),
      `Retired company reference: ${path.relative(dist, file)}`,
    );
  }
  if (!file.endsWith('.html')) continue;
  const html = (await documentAt(file))
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  for (const match of html.matchAll(
    /\b(?:href|src|poster)\s*=\s*(["'])(.*?)\1/gs,
  )) {
    const link = match[2].replaceAll('&amp;', '&');
    if (
      !link ||
      /^(?:data:|mailto:|tel:|javascript:|blob:|https?:|\/\/)/i.test(link) ||
      link.includes('${')
    )
      continue;
    const parsed = new URL(
      link,
      `https://chrisflathmann.com/${path.relative(dist, file).replaceAll('\\', '/')}`,
    );
    let target = path.join(dist, decodeURIComponent(parsed.pathname));
    if (parsed.pathname.endsWith('/')) target = path.join(target, 'index.html');
    if (
      !(await exists(target)) &&
      !path.extname(target) &&
      (await exists(`${target}.html`))
    )
      target += '.html';
    checkedLinks++;
    if (!(await exists(target))) {
      failures.push(`Broken link in ${path.relative(dist, file)}: ${link}`);
      continue;
    }
    if (parsed.hash && target.endsWith('.html')) {
      const id = decodeURIComponent(parsed.hash.slice(1));
      // Slide decks use Reveal's hash routing rather than element IDs.
      if (id.startsWith('/')) continue;
      const targetHtml = await documentAt(target);
      verify(
        targetHtml.includes(`id="${id}"`) ||
          targetHtml.includes(`id='${id}'`) ||
          targetHtml.includes(`name="${id}"`),
        `Missing fragment in ${path.relative(dist, file)}: ${link}`,
      );
    }
  }
}
assert.equal(failures.length, 0, failures.join('\n'));
console.log(
  `Verified ${manifest.urls.length} existing URLs, ${checkedAssets} unchanged assets, ${publications.reduce((n, g) => n + g.items.length, 0)} publication entries, ${funding.groups.reduce((n, g) => n + g.items.length, 0)} funding records, ${checkedLinks} internal links, both PDFs, figures, metadata, and retired branding removal.`,
);
