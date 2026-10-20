// Fails when a built page still carries handoff placeholders.
// Run after `astro build`, before uploading dist/.
import { readFileSync } from 'node:fs';

const pages = ['index.html', 'resume/index.html'];
const placeholders = [
  ['email', /mailto:\[YOUR-EMAIL\]/g],
  ['LinkedIn URL', /href="https:\/\/www\.linkedin\.com\/"/g],
  ['GitHub URL', /href="https:\/\/github\.com\/"/g],
];

let failed = false;
for (const page of pages) {
  const html = readFileSync(new URL(`../dist/${page}`, import.meta.url), 'utf8');
  const left = placeholders
    .map(([name, re]) => [name, (html.match(re) ?? []).length])
    .filter(([, n]) => n > 0);
  if (left.length > 0) {
    failed = true;
    console.error(`Placeholders still in dist/${page}:`);
    for (const [name, n] of left) console.error(`  ${name}: ${n}`);
  }
}
if (failed) process.exit(1);
console.log(`No placeholders left in ${pages.map((p) => `dist/${p}`).join(', ')}.`);
