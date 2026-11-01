import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { standaloneFigureStyles } from './figure-styles.mjs';
const root = path.resolve(import.meta.dirname, '..');
const css = await standaloneFigureStyles(root);
const destination = path.join(root, 'public/figures');
await mkdir(destination, { recursive: true });
await writeFile(
  path.join(destination, 'Kalam-OFL.txt'),
  await readFile(path.join(root, 'node_modules/@fontsource/kalam/LICENSE')),
);
await writeFile(
  path.join(destination, 'SourceSans3-OFL.txt'),
  await readFile(
    path.join(root, 'node_modules/@fontsource-variable/source-sans-3/LICENSE'),
  ),
);
for (const option of ['current', 'playbook']) {
  const optionCss =
    option === 'current' ? css : await standaloneFigureStyles(root, option);
  const optionPath = option === 'current' ? '' : 'playbook/';
  await mkdir(path.join(destination, optionPath), { recursive: true });
  for (const kind of ['overview', 'knowledge', 'protection', 'coordination']) {
    const source = await readFile(
      path.join(root, `src/assets/figures/${optionPath}${kind}.svg`),
      'utf8',
    );
    const svg = source
      .replaceAll('FIGURE', kind)
      .replace('</defs>', `</defs><style>${optionCss}</style>`);
    await writeFile(path.join(destination, optionPath, `${kind}.svg`), svg);
  }
}
console.log('Exported both sets of four self-contained SVG concept figures.');
