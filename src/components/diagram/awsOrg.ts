import type { DiagramData } from './types';

/**
 * /how-it-works/: the AWS Organization. Guardrails at the root apply to the site's member account;
 * AWS never applies them to the management account. Live state, 21 Oct 2026.
 */
export const awsOrg: DiagramData = {
  id: 'aws-org',
  width: 760,
  height: 300,
  label: 'AWS Organization: guardrails at the root apply to the site account, not to the management account',
  description:
    "Service control policies at the organization root keep regional API calls and new S3 buckets in us-east-1, stop member accounts from switching off the trail, Config, GuardDuty or Security Hub, and stop them leaving the organization. A resource control policy lets only the organization's identities and AWS services reach S3 in member accounts. Both apply to the portfolio account, which holds the site, its OpenTofu state and its CI roles and has no root credentials. AWS doesn't apply them to the management account, which holds Organizations, billing, Identity Center and the organization trail, and whose root user signs in with a hardware key.",
  regions: [{ x: 0, y: 12, w: 300, h: 276, radius: 16, tone: 'panel' }],
  nodes: [
    {
      x: 14,
      y: 44,
      w: 272,
      h: 112,
      lines: [
        { text: 'SCPs', bold: true },
        'regional calls: us-east-1',
        'audit and detection stay on',
        'new buckets: us-east-1',
        'no leaving the organization',
      ],
    },
    {
      x: 14,
      y: 176,
      w: 272,
      h: 96,
      lines: [{ text: 'RCP', bold: true }, 'S3 in member accounts:', 'organization identities', 'and AWS services only'],
    },
    {
      x: 480,
      y: 28,
      w: 280,
      h: 104,
      lines: [
        { text: 'Management account', bold: true },
        'Organizations, billing',
        'Identity Center, org trail',
        'root: hardware key',
      ],
    },
    {
      x: 480,
      y: 160,
      w: 280,
      h: 120,
      lines: [
        { text: 'portfolio account', bold: true },
        'Workloads OU',
        'the site, its state, CI roles',
        'security services',
        'no root credentials',
      ],
      tone: 'accent',
    },
  ],
  // Both edges leave the root panel from one point: the guardrails apply, or not, as a set.
  edges: [
    { points: [[300, 150], [340, 150], [340, 80], [475, 80]], dashed: true },
    { points: [[300, 150], [340, 150], [340, 220], [475, 220]], tone: 'accent' },
  ],
  labels: [
    { x: 14, y: 22, lines: ['Organization root'] },
    { x: 345, y: 56, w: 130, align: 'middle', lines: ['not applied'] },
    { x: 345, y: 196, w: 130, align: 'middle', tone: 'accent', lines: ['applied'] },
  ],
};
