import type { DiagramData } from './types';

/** Hero and /how-it-works/: a merge publishes to S3; CloudFront serves it to you through Cloudflare. */
export const siteFlow: DiagramData = {
  id: 'site-flow',
  width: 600,
  height: 440,
  label: 'How this site works: a merged pull request publishes to S3, and CloudFront serves it to you through Cloudflare',
  description:
    'A pull request that passed its checks merges into main, and GitHub Actions builds the site and syncs it to a private S3 bucket. CloudFront reads that bucket with signed requests, and Cloudflare proxies the pages to your browser.',
  regions: [
    { x: 0, y: 32, w: 600, h: 168, radius: 16, tone: 'panel' },
    { x: 0, y: 264, w: 600, h: 168, radius: 16, tone: 'panel' },
  ],
  nodes: [
    { x: 20, y: 96, w: 150, h: 72, lines: [{ text: 'Pull request', bold: true }, 'checks must pass'] },
    { x: 225, y: 96, w: 150, h: 72, lines: [{ text: 'GitHub Actions', bold: true }, 'OIDC, no keys'] },
    { x: 430, y: 96, w: 150, h: 72, lines: [{ text: 'S3 bucket', bold: true }, 'private'] },
    { x: 430, y: 328, w: 150, h: 72, lines: [{ text: 'CloudFront', bold: true }, 'cache, HTTPS'] },
    { x: 225, y: 328, w: 150, h: 72, lines: [{ text: 'Cloudflare', bold: true }, 'DNS, proxy, TLS'] },
    { x: 20, y: 328, w: 150, h: 72, lines: [{ text: 'Your browser', bold: true }, 'this page'], tone: 'accent' },
  ],
  edges: [
    { points: [[170, 132], [220, 132]] },
    { points: [[375, 132], [425, 132]] },
    { points: [[505, 168], [505, 323]] },
    { points: [[430, 364], [380, 364]] },
    { points: [[225, 364], [175, 364]], tone: 'accent' },
  ],
  labels: [
    { x: 16, y: 44, lines: ['Publish: merge to main'] },
    { x: 16, y: 276, lines: ['Serve: every visit'] },
    { x: 170, y: 104, w: 55, align: 'middle', lines: ['merge'] },
    { x: 375, y: 104, w: 55, align: 'middle', lines: ['sync'] },
    { x: 517, y: 224, lines: ['signed reads'] },
    { x: 375, y: 336, w: 55, align: 'middle', lines: ['HTTPS'] },
    { x: 170, y: 336, w: 55, align: 'middle', tone: 'accent', lines: ['proxied'] },
  ],
};
