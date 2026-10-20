import type { DiagramData } from './types';

/** 404 page: what happened to the request. S3 behind OAC answers 403 for a missing key; CloudFront serves /404.html as a 404. */
export const notFoundPath: DiagramData = {
  id: 'not-found',
  width: 760,
  height: 120,
  label: 'Your request went to CloudFront and the S3 bucket, which had no such page',
  description:
    'Your browser asked CloudFront for the page, and CloudFront looked it up in the S3 bucket. The bucket has no such page and answered 403, so CloudFront sent back this page with status 404.',
  nodes: [
    { x: 0, y: 30, w: 180, h: 72, lines: [{ text: 'Your browser', bold: true }, 'old or mistyped link'] },
    { x: 290, y: 30, w: 180, h: 72, lines: [{ text: 'CloudFront', bold: true }, 'sebastiansuarez.dev'], tone: 'accent' },
    { x: 580, y: 30, w: 180, h: 72, lines: [{ text: 'S3 bucket', bold: true }, 'no such page'] },
  ],
  edges: [
    { points: [[180, 52], [285, 52]] },
    { points: [[470, 52], [575, 52]] },
    { points: [[579, 82], [475, 82]], dashed: true },
    { points: [[289, 82], [185, 82]], tone: 'accent' },
  ],
  labels: [
    { x: 182, y: 26, w: 100, align: 'middle', lines: ['request'] },
    { x: 472, y: 26, w: 100, align: 'middle', lines: ['lookup'] },
    { x: 472, y: 92, w: 106, align: 'middle', lines: ['403, no key'] },
    { x: 182, y: 92, w: 106, align: 'middle', tone: 'accent', lines: ['this page, 404'] },
  ],
};
