// Fails when the built page still carries handoff placeholders.
// Run after `astro build`, before uploading dist/.
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const placeholders = [
  ['email', /mailto:\[YOUR-EMAIL\]/g],
  ['LinkedIn URL', /href="https:\/\/www\.linkedin\.com\/"/g],
  ['GitHub URL', /href="https:\/\/github\.com\/"/g],
];

const left = placeholders
  .map(([name, re]) => [name, (html.match(re) ?? []).length])
  .filter(([, n]) => n > 0);

if (left.length > 0) {
  console.error('Placeholders still in dist/index.html:');
  for (const [name, n] of left) console.error(`  ${name}: ${n}`);
  process.exit(1);
}
console.log('No placeholders left in dist/index.html.');
