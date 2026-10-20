import type { DiagramData } from './types';

/** This portfolio's card and /how-it-works/: a person applies IAM, CI applies the site stack, which holds no IAM. */
export const iacSplit: DiagramData = {
  id: 'iac-split',
  width: 760,
  height: 300,
  label: 'A person applies the IAM stack; GitHub Actions applies the site stack, which holds no IAM',
  description:
    "From a laptop with admin sign-in, a person applies the IAM stack, which defines the GitHub OIDC provider and three scoped roles. GitHub Actions assumes one of those roles per job to plan and apply the site stack: the S3 bucket, CloudFront, the certificate and the Cloudflare DNS records. The site stack holds no IAM, so CI can't edit the roles it runs as.",
  nodes: [
    { x: 0, y: 40, w: 180, h: 72, lines: [{ text: 'Laptop', bold: true }, 'admin sign-in'] },
    { x: 290, y: 40, w: 180, h: 72, lines: [{ text: 'IAM stack', bold: true }, 'OpenTofu, by hand'] },
    { x: 580, y: 40, w: 180, h: 72, lines: [{ text: 'OIDC provider', bold: true }, 'three scoped roles'] },
    { x: 0, y: 188, w: 180, h: 72, lines: [{ text: 'GitHub Actions', bold: true }, 'one role per job'] },
    { x: 290, y: 188, w: 180, h: 72, lines: [{ text: 'Site stack', bold: true }, 'OpenTofu, in CI'], tone: 'accent' },
    {
      x: 580,
      y: 184,
      w: 180,
      h: 80,
      lines: [{ text: 'Site resources', bold: true }, 'S3, CloudFront,', 'ACM, Cloudflare DNS'],
    },
  ],
  edges: [
    { points: [[180, 76], [285, 76]] },
    { points: [[470, 76], [575, 76]] },
    { points: [[670, 112], [670, 150], [90, 150], [90, 183]], dashed: true },
    { points: [[180, 224], [285, 224]], tone: 'accent' },
    { points: [[470, 224], [575, 224]] },
  ],
  labels: [
    { x: 180, y: 50, w: 110, align: 'middle', lines: ['applies'] },
    { x: 470, y: 50, w: 110, align: 'middle', lines: ['defines'] },
    { x: 290, y: 124, w: 180, align: 'middle', lines: ['roles assumed per job'] },
    { x: 180, y: 198, w: 110, align: 'middle', tone: 'accent', lines: ['plan, apply'] },
    { x: 470, y: 198, w: 110, align: 'middle', lines: ['manages'] },
    { x: 290, y: 270, w: 180, align: 'middle', tone: 'accent', lines: ['holds no IAM'] },
  ],
};
