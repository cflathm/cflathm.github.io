import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { standaloneFigureStyles } from './figure-styles.mjs';

const root = path.resolve(import.meta.dirname, '..');
const css = await standaloneFigureStyles(root);
const playbookCss = await standaloneFigureStyles(root, 'playbook');
const studies = [
  [
    'overview',
    'AI supports people working together',
    'AI helps people share knowledge, block cognitive risk, and coordinate handoffs.',
  ],
  [
    'knowledge',
    'Shared knowledge',
    'Who knows what, when it is needed, and how people use it to form a collective judgement.',
  ],
  [
    'protection',
    'Cognitive protection',
    'AI blocks cognitive risks while people remain connected as a team.',
  ],
  [
    'coordination',
    'Coordination across teams',
    'Help teams with handoffs and a shared plan.',
  ],
];
const figures = await Promise.all(
  studies.map(async ([kind, title], index) => {
    const source = await readFile(
      path.join(root, `src/assets/figures/playbook/${kind}.svg`),
      'utf8',
    );
    const svg = source
      .replaceAll('FIGURE', `study-${kind}`)
      .replace(
        'technical-figure',
        `technical-figure${index === 0 ? ' hero-diagram' : ''}`,
      )
      .replace('</defs>', `</defs><style>${playbookCss}</style>`);
    return `<article class="${index === 0 ? 'hero-study' : ''}"><header><span>${index === 0 ? 'ALL' : `0${index}`}</span><h2>${title}</h2></header>${svg}</article>`;
  }),
);
await writeFile(
  path.join(root, 'design/figures/preview.html'),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI + people · Figure study</title><style>
body{margin:0;padding:32px;background:#f5f6f3;color:#283b50;font:16px/1.5 'Source Sans 3 Variable',Arial,sans-serif}main{max-width:1300px;margin:auto}h1{font-size:30px;letter-spacing:-.035em;font-weight:500;margin:0}main>p{font-size:16px;color:#5b6e82;margin:6px 0 24px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}article{border-top:1px solid #cad4dc}header{display:flex;align-items:center;gap:14px;padding:22px 26px 0}header span{font:12px monospace;color:#5b6e82}h2{font-size:21px;font-weight:500;letter-spacing:-.015em;margin:0}article>p{margin:0;padding:0 26px 22px;font-size:15px;color:#5b6e82}svg{max-height:350px;margin:10px 0}.hero-study{background:#101d30;color:#dde6f2;border:0}.hero-study header span,.hero-study>p{color:#a9bad0}@media(max-width:700px){.grid{grid-template-columns:1fr}body{padding:20px}svg{max-height:none}}
</style></head><body><main><h1>AI + people</h1><p>Four concept sketches, reviewed on the site's dark and light surfaces.</p><div class="grid">${figures.join('')}</div></main></body></html>`,
);
console.log('Wrote four concept figure studies.');

const pairs = await Promise.all(
  studies.map(async ([kind, title, caption], index) => {
    const render = async (option) => {
      const isPlaybook = option === 'playbook';
      const source = await readFile(
        path.join(
          root,
          `src/assets/figures/${isPlaybook ? 'playbook/' : ''}${kind}.svg`,
        ),
        'utf8',
      );
      const svg = source
        .replaceAll('FIGURE', `${option}-${kind}`)
        .replace(
          'technical-figure',
          `technical-figure${index === 0 ? ' hero-diagram' : ''}`,
        )
        .replace(
          '</defs>',
          `</defs><style>${isPlaybook ? playbookCss : css}</style>`,
        );
      return `<figure class="${index === 0 ? 'hero-study' : ''}"><figcaption>${isPlaybook ? 'B · Selected playbook' : 'A · Earlier style'}</figcaption>${svg}</figure>`;
    };
    return `<section><h2>${index === 0 ? '00' : `0${index}`} / ${title}</h2><p>${caption}</p><div class="pair">${await render('current')}${await render('playbook')}</div></section>`;
  }),
);
await writeFile(
  path.join(root, 'design/figures/compare.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Figure options · Earlier and selected playbook</title><style>
body{margin:0;padding:40px;background:#f5f6f3;color:#283b50;font:18px/1.5 'Source Sans 3 Variable',Arial,sans-serif}main{max-width:1380px;margin:auto}h1{font-size:40px;letter-spacing:-.04em;font-weight:500;margin:0}main>p{max-width:740px;color:#5b6e82}a{color:#2469b8;text-underline-offset:4px}nav{display:flex;gap:28px;flex-wrap:wrap;margin-bottom:44px}section{border-top:1px solid #cad4dc;padding:24px 0 36px}h2{font-size:25px;font-weight:500;margin:0}section>p{font-size:17px;color:#5b6e82;margin:6px 0 20px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:stretch}figure{margin:0;padding:20px;display:flex;flex-direction:column;justify-content:center}figcaption{font-size:16px;margin-bottom:12px}.hero-study{background:#101d30;color:#dde6f2}svg{max-height:480px}.playbook-figure{margin:auto}.pair figure:not(.hero-study){border:1px solid #d5dcd6}@media(max-width:760px){body{padding:20px}h1{font-size:32px}.pair{grid-template-columns:1fr}figure{padding:12px}svg{max-height:none}}
</style></head><body><main><h1>Same work. Two drawing styles.</h1><p>B is the selected style, now used on the homepage. A remains here for reference.</p><nav><a href="http://127.0.0.1:4321/">B: selected homepage</a></nav>${pairs.join('')}</main></body></html>`,
);
console.log('Wrote current / playbook comparison.');
