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
const navigation = await readJson('src/data/navigation.json');
const toolPages = await readJson('src/data/tool-pages.json');
const contentPages = [...navigation, ...toolPages];
const redirects = await readJson('src/data/legacy-redirects.json');
const archivedAssets = await readJson(
  'archive/pre-page-consolidation/archived-assets.json',
);
const visiblePageFiles = new Set(
  contentPages.map((page) => (page.href === '/' ? '/index.html' : page.href)),
);
const allowedHrefs = new Set(contentPages.map((page) => page.href));
const courseDocuments = new Set(
  manifest.urls.filter(
    (url) => url.startsWith('/hcc3030/') && url.endsWith('.html'),
  ),
);
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
  const file = archivedAssets[url]
    ? path.join(root, archivedAssets[url])
    : path.join(dist, url.slice(1));
  if (await exists(file))
    verify(
      createHash('sha256')
        .update(await readFile(file))
        .digest('hex') === hash,
      `Original asset changed: ${url}`,
    );
  else failures.push(`Missing original asset: ${url}`);
}
const researchHtml = await readFile(path.join(dist, 'research.html'), 'utf8');
for (const group of publications) {
  verify(
    group.items.length >= (manifest.publicationCounts[group.title] ?? 0),
    `Publication entries lost: ${group.title}`,
  );
}
const publicationSnapshot = await readJson(
  'archive/pre-page-consolidation/src/data/publications.json',
);
const retainedCitations = new Set(
  publications.flatMap((group) => group.items.map((item) => item.citationHtml)),
);
for (const group of publicationSnapshot)
  for (const item of group.items)
    verify(
      retainedCitations.has(item.citationHtml),
      `Original publication data lost: ${item.id}`,
    );
const fundingPosition = researchHtml.indexOf('id="funding"');
const publicationsPosition = researchHtml.indexOf('id="publications"');
const teachingPosition = researchHtml.indexOf('id="teaching"');
verify(
  fundingPosition > -1 &&
    fundingPosition < publicationsPosition &&
    publicationsPosition < teachingPosition,
  'Research sections must be Funding, Publications, Teaching',
);
verify(
  researchHtml
    .slice(publicationsPosition, teachingPosition)
    .includes('href="/CV.pdf"') &&
    !researchHtml.includes('id="publication-search"') &&
    !researchHtml.includes('id="research-highlights-title"'),
  'Research must link to the CV instead of a publication list or research highlights',
);
for (const deck of await readJson('src/data/course-decks.json'))
  verify(
    researchHtml.includes(`href="${deck.href}"`),
    `Course deck missing from Research: ${deck.href}`,
  );
for (const group of funding.groups) {
  verify(
    group.items.length >= (manifest.fundingCounts[group.title] ?? 0),
    `Funding entries lost: ${group.title}`,
  );
  for (const item of group.items)
    verify(
      researchHtml.includes(item.citationHtml),
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
  ...contentPages.map((page) =>
    page.href === '/' ? 'index' : page.href.slice(1, -5),
  ),
  '404',
];
for (const name of newPages) {
  const html = await readFile(path.join(dist, `${name}.html`), 'utf8');
  for (const [pattern, label] of [
    [/<html lang="en"/, 'language'],
    [/<h1[ >]|role="heading" aria-level="1"/, 'main heading'],
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
const toolsHtml = await readFile(path.join(dist, 'tools.html'), 'utf8');
const bingoHtml = await readFile(path.join(dist, 'dcom-bingo.html'), 'utf8');
const woodHtml = await readFile(
  path.join(dist, 'wood-tile-studio.html'),
  'utf8',
);
verify(
  toolPages.length === 2 &&
    toolPages.every((page) => toolsHtml.includes(`href="${page.href}"`)) &&
    !toolsHtml.includes('<iframe') &&
    !toolsHtml.includes('id="bingo-card"') &&
    [...bingoHtml.matchAll(/class="bingo-square\b/g)].length === 25 &&
    woodHtml.includes('id="editorCanvas"') &&
    woodHtml.includes('href="/tools.html"'),
  'Tools must link to exactly two standalone apps, with a static bingo fallback',
);
verify(
  createHash('sha256')
    .update(await readFile(path.join(root, 'src/tools/wood-tile-studio.html')))
    .digest('hex') === manifest.preserved['/wood-tile-studio.html'],
  'The standalone wood tile source must retain the original editing and export code',
);
const originalEditor = await readFile(
  path.join(root, 'src/tools/wood-tile-studio.html'),
  'utf8',
);
verify(
  woodHtml.includes(
    originalEditor.match(/<script>([\s\S]*)<\/script>/)?.[1] ??
      'MISSING EDITOR SCRIPT',
  ),
  'Standalone Wood Tile Studio must publish the complete original app script',
);
verify(
  JSON.stringify(await readJson('src/data/bingo.json')) ===
    JSON.stringify(
      await readJson('archive/pre-page-consolidation/src/data/bingo.json'),
    ),
  'Original bingo prompts must survive consolidation',
);
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
// Retired addresses redirect into the main pages or the two standalone apps.
for (const [from, target] of Object.entries(redirects)) {
  const html = await readFile(path.join(dist, from.slice(1)), 'utf8');
  verify(
    html.includes('http-equiv="refresh"') &&
      html.includes(`content="0;url=${target}"`),
    `Retired URL must redirect: ${from}`,
  );
  verify(
    /name="robots" content="noindex, follow"/.test(html),
    `Redirect must not be indexed: ${from}`,
  );
  verify(
    allowedHrefs.has(target.split('#')[0]),
    `Redirect target is not a top-bar page or tool: ${from}`,
  );
}
const expectedSources = new Set([
  ...contentPages.map((page) =>
    page.href === '/' ? 'index.astro' : `${page.href.slice(1, -5)}.astro`,
  ),
  '404.astro',
]);
const sourcePages = (await readdir(path.join(root, 'src/pages'))).filter(
  (name) => name.endsWith('.astro'),
);
verify(
  sourcePages.length === expectedSources.size &&
    sourcePages.every((name) => expectedSources.has(name)),
  'Only top-bar pages, the two standalone tools, and the 404 may be authored',
);
for (const page of navigation) {
  const html = await readFile(
    path.join(dist, page.href === '/' ? 'index.html' : page.href.slice(1)),
    'utf8',
  );
  const mainNav =
    html.match(
      /<nav[^>]*aria-label="Main navigation"[^>]*>([\s\S]*?)<\/nav>/,
    )?.[1] ?? '';
  const hrefs = [...mainNav.matchAll(/href="([^"]+)"/g)].map(
    (match) => match[1],
  );
  verify(
    JSON.stringify(hrefs) ===
      JSON.stringify(navigation.map((item) => item.href)),
    `Top bar differs on ${page.href}`,
  );
  verify(
    html.includes(
      `rel="canonical" href="https://chrisflathmann.com${page.href}"`,
    ),
    `Incorrect canonical URL: ${page.href}`,
  );
  const content = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  for (const match of content.matchAll(/\bhref=["']([^"']+)["']/g)) {
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(match[1])) continue;
    const target = new URL(match[1], `https://chrisflathmann.com${page.href}`)
      .pathname;
    if (target.endsWith('.html'))
      verify(
        allowedHrefs.has(target) || courseDocuments.has(target),
        `Visible page links outside the top bar and tool exceptions: ${page.href} -> ${target}`,
      );
  }
}
const sitemap = await readFile(path.join(dist, 'sitemap-0.xml'), 'utf8');
const indexed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .sort();
verify(
  JSON.stringify(indexed) ===
    JSON.stringify(
      contentPages
        .map((page) => `https://chrisflathmann.com${page.href}`)
        .sort(),
    ),
  'Sitemap must contain exactly the top-bar pages and two standalone tools',
);
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
verify(
  (await readFile(path.join(root, 'CNAME'), 'utf8')).trim() ===
    'chrisflathmann.com',
  'Preserve the repository-level Pages custom-domain binding',
);
verify(await exists(path.join(dist, '.nojekyll')), 'Missing .nojekyll');

const outputFiles = await filesIn(dist);
verify(
  !outputFiles.some((file) =>
    /^(?:archive|design)[\\/]/.test(path.relative(dist, file)),
  ),
  'Source archives or design studies must not be published',
);
const documentCache = new Map();
async function documentAt(file) {
  if (!documentCache.has(file))
    documentCache.set(file, await readFile(file, 'utf8'));
  return documentCache.get(file);
}
for (const file of await filesIn(path.join(root, 'src'))) {
  if (!/\.(astro|ts|md|json|css|html)$/.test(file)) continue;
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
  const pageUrl = '/' + path.relative(dist, file).replaceAll('\\', '/');
  verify(
    visiblePageFiles.has(pageUrl) ||
      pageUrl === '/404.html' ||
      courseDocuments.has(pageUrl) ||
      Object.hasOwn(redirects, pageUrl),
    `Unlisted content page in build: ${pageUrl}`,
  );
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
  `Verified ${navigation.length} top-bar pages and ${toolPages.length} standalone apps, ${Object.keys(redirects).length} redirects, ${manifest.urls.length} existing URLs, ${checkedAssets} preserved assets (including archived tools), ${publications.reduce((n, g) => n + g.items.length, 0)} preserved publication records, Research section order and CV link, ${funding.groups.reduce((n, g) => n + g.items.length, 0)} funding records, ${checkedLinks} internal links, both PDFs, figures, metadata, and retired branding removal.`,
);
