import type { DiagramData } from './types';

/** /how-it-works/: from a local edit to production. Mirrors .github/workflows/ and the ruleset on main. */
export const pipeline: DiagramData = {
  id: 'pipeline',
  width: 760,
  height: 340,
  label: 'From an edit to production: local dev, a pull request, two required checks, the merge, then deploy or infrastructure apply',
  description:
    'Work starts locally with the Astro dev server and type checks, then goes up as a pull request into main. Two checks, Build and Terraform plan, must pass before the ruleset allows the merge. A merge that changes the site runs the deploy job, which syncs the build to S3 and invalidates CloudFront. A merge that changes infra/ runs the Terraform apply jobs, which update the IAM stack and then the site stack in AWS and Cloudflare.',
  nodes: [
    { x: 0, y: 20, w: 180, h: 72, lines: [{ text: 'Local dev', bold: true }, 'astro dev, check'] },
    { x: 290, y: 20, w: 180, h: 72, lines: [{ text: 'Pull request', bold: true }, 'into main'] },
    { x: 580, y: 20, w: 180, h: 72, lines: [{ text: 'Two checks', bold: true }, 'Build, Terraform plan'] },
    { x: 580, y: 150, w: 180, h: 72, lines: [{ text: 'Merge to main', bold: true }, 'ruleset enforced'], tone: 'accent' },
    { x: 290, y: 150, w: 180, h: 72, lines: [{ text: 'Deploy job', bold: true }, 'production env'] },
    { x: 0, y: 150, w: 180, h: 72, lines: [{ text: 'S3 + CloudFront', bold: true }, 'sync, invalidate'] },
    { x: 290, y: 260, w: 180, h: 72, lines: [{ text: 'Terraform applies', bold: true }, 'IAM, then site'] },
    { x: 0, y: 260, w: 180, h: 72, lines: [{ text: 'AWS + Cloudflare', bold: true }, 'IAM and site stacks'] },
  ],
  edges: [
    { points: [[180, 56], [285, 56]] },
    { points: [[470, 56], [575, 56]] },
    { points: [[670, 92], [670, 145]] },
    { points: [[580, 186], [475, 186]], tone: 'accent' },
    { points: [[290, 186], [185, 186]], tone: 'accent' },
    { points: [[670, 222], [670, 296], [475, 296]] },
    { points: [[290, 296], [185, 296]] },
  ],
  labels: [
    { x: 180, y: 30, w: 110, align: 'middle', lines: ['push'] },
    { x: 470, y: 30, w: 110, align: 'middle', lines: ['runs'] },
    { x: 682, y: 110, lines: ['both pass'] },
    { x: 470, y: 160, w: 110, align: 'middle', tone: 'accent', lines: ['site change'] },
    { x: 180, y: 160, w: 110, align: 'middle', tone: 'accent', lines: ['publish'] },
    { x: 480, y: 270, w: 100, align: 'middle', lines: ['infra/ change'] },
    { x: 180, y: 270, w: 110, align: 'middle', lines: ['apply'] },
  ],
};
