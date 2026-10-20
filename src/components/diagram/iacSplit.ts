import type { DiagramData } from './types';

/**
 * This portfolio's card and /how-it-works/: a person sets the ceiling in the bootstrap stack;
 * GitHub Actions applies the IAM and site stacks below it. Mirrors infra/README.md.
 */
export const iacSplit: DiagramData = {
  id: 'iac-split',
  width: 760,
  height: 300,
  label: 'A person sets the ceiling in the bootstrap stack; GitHub Actions applies the IAM and site stacks below it',
  description:
    "From a laptop, a person applies the bootstrap stack: the GitHub OIDC provider, a permissions boundary and the role that applies IAM. GitHub Actions applies the IAM stack, whose deploy, plan and apply roles all carry that boundary, and then the site stack: the S3 bucket, CloudFront, the certificate and the Cloudflare DNS records. CI can change its roles only below the boundary, and can't touch the boundary, the OIDC provider or the role it applies IAM with.",
  nodes: [
    { x: 0, y: 40, w: 180, h: 72, lines: [{ text: 'Laptop', bold: true }, 'admin sign-in'] },
    { x: 290, y: 40, w: 180, h: 72, lines: [{ text: 'Bootstrap stack', bold: true }, 'by hand, rarely'] },
    {
      x: 580,
      y: 36,
      w: 180,
      h: 80,
      lines: [{ text: 'The ceiling', bold: true }, 'permissions boundary', 'OIDC, IAM-apply role'],
      tone: 'accent',
    },
    { x: 0, y: 188, w: 180, h: 72, lines: [{ text: 'GitHub Actions', bold: true }, 'one role per job'] },
    { x: 290, y: 188, w: 180, h: 72, lines: [{ text: 'IAM stack', bold: true }, 'capped CI roles'] },
    {
      x: 580,
      y: 184,
      w: 180,
      h: 80,
      lines: [{ text: 'Site stack', bold: true }, 'S3, CloudFront,', 'ACM, Cloudflare DNS'],
    },
  ],
  edges: [
    { points: [[180, 76], [285, 76]] },
    { points: [[470, 76], [575, 76]] },
    { points: [[670, 116], [670, 150], [380, 150], [380, 183]], dashed: true },
    { points: [[180, 224], [285, 224]], tone: 'accent' },
    { points: [[470, 224], [575, 224]] },
  ],
  labels: [
    { x: 180, y: 50, w: 110, align: 'middle', lines: ['applies'] },
    { x: 470, y: 50, w: 110, align: 'middle', lines: ['defines'] },
    { x: 450, y: 126, w: 150, align: 'middle', lines: ['caps every CI role'] },
    { x: 180, y: 198, w: 110, align: 'middle', tone: 'accent', lines: ['applies'] },
    { x: 470, y: 198, w: 110, align: 'middle', lines: ['then'] },
    { x: 580, y: 270, w: 180, align: 'middle', lines: ['holds no IAM'] },
  ],
};
