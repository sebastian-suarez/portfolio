import type { DiagramData } from './types';

/** /how-it-works/: the three hops of a request and what each does. Mirrors infra/ and the zone settings. */
export const requestPath: DiagramData = {
  id: 'request-path',
  width: 760,
  height: 206,
  label: 'A request: your browser to Cloudflare to CloudFront to the S3 bucket',
  description:
    "Your browser reaches Cloudflare, which answers from DNSSEC-signed DNS, runs its edge checks and proxies the request to CloudFront over Full (strict) TLS, adding a secret header. CloudFront refuses HTTPS requests without that header, redirects www to the apex, maps folder paths to index.html and adds security headers, then reads the page from the private S3 bucket with requests signed through origin access control. When the bucket has no such page, CloudFront sends the site's 404 page.",
  nodes: [
    { x: 0, y: 20, w: 160, h: 72, lines: [{ text: 'Your browser', bold: true }, 'any device'] },
    { x: 200, y: 20, w: 160, h: 72, lines: [{ text: 'Cloudflare', bold: true }, 'DNS, edge'] },
    { x: 400, y: 20, w: 160, h: 72, lines: [{ text: 'CloudFront', bold: true }, 'CDN'] },
    { x: 600, y: 20, w: 160, h: 72, lines: [{ text: 'S3 bucket', bold: true }, 'origin'] },
  ],
  edges: [
    { points: [[160, 56], [195, 56]], tone: 'accent' },
    { points: [[360, 56], [395, 56]], tone: 'accent' },
    { points: [[560, 56], [595, 56]], tone: 'accent' },
  ],
  labels: [
    { x: 0, y: 108, w: 160, align: 'middle', lines: ['asks for', 'sebastiansuarez.dev'] },
    { x: 200, y: 108, w: 160, align: 'middle', lines: ['DNSSEC-signed DNS', 'Full (strict) TLS', 'bot and AI checks', 'adds a secret header'] },
    {
      x: 400,
      y: 108,
      w: 160,
      align: 'middle',
      lines: ['checks that header', 'www → apex, 301', '/dir → index.html', 'security headers', '404 page on misses'],
    },
    { x: 600, y: 108, w: 160, align: 'middle', lines: ['public access blocked', 'reads signed by OAC', 'versions for 30 days'] },
  ],
};
