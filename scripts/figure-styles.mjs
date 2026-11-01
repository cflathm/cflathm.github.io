import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Standalone SVGs carry the same lettering as the site, with no font request.
export async function standaloneFigureStyles(root, option = 'current') {
  const [css, font, bodyFont] = await Promise.all([
    readFile(
      path.join(
        root,
        option === 'playbook'
          ? 'src/assets/figures/playbook/playbook.css'
          : 'src/assets/figures/figure.css',
      ),
      'utf8',
    ),
    readFile(
      path.join(
        root,
        'node_modules/@fontsource/kalam/files/kalam-latin-400-normal.woff2',
      ),
    ),
    readFile(
      path.join(
        root,
        'node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2',
      ),
    ),
  ]);
  return `@font-face{font-family:'Kalam';font-style:normal;font-weight:400;src:url(data:font/woff2;base64,${font.toString('base64')}) format('woff2')}\n@font-face{font-family:'Source Sans 3 Variable';font-style:normal;font-weight:200 900;src:url(data:font/woff2;base64,${bodyFont.toString('base64')}) format('woff2')}\n${css}`;
}
