import type { DiagramData } from './types';

/** /how-it-works/: who can act in the AWS account, what watches it, and where alerts go. Live state, 20 Oct 2026. */
export const awsAccount: DiagramData = {
  id: 'aws-account',
  width: 760,
  height: 320,
  label: 'AWS account: who can act, what watches, and where the alerts go',
  description:
    'Three kinds of identity can act in the account: the root user, with MFA and no keys; people, through IAM Identity Center; and GitHub Actions, through short-lived OIDC roles. CloudTrail records their sign-ins and management actions, and alarms on it send email. GuardDuty emails high-severity findings, and the budget and anomaly detection email about spend.',
  regions: [{ x: 0, y: 12, w: 180, h: 296, radius: 16, tone: 'panel' }],
  nodes: [
    { x: 10, y: 48, w: 160, h: 64, lines: [{ text: 'Root user', bold: true }, 'MFA, no keys'] },
    { x: 10, y: 140, w: 160, h: 64, lines: [{ text: 'People', bold: true }, 'Identity Center'] },
    { x: 10, y: 232, w: 160, h: 64, lines: [{ text: 'GitHub Actions', bold: true }, 'OIDC roles'] },
    { x: 280, y: 48, w: 200, h: 64, lines: [{ text: 'Threat detection', bold: true }, 'GuardDuty'] },
    { x: 280, y: 140, w: 200, h: 64, lines: [{ text: 'CloudTrail', bold: true }, 'org trail, 4 alarms'] },
    { x: 280, y: 232, w: 200, h: 64, lines: [{ text: 'Cost controls', bold: true }, 'budget, anomalies'] },
    { x: 600, y: 48, w: 160, h: 248, lines: [{ text: 'Email', bold: true }, 'through SNS'], tone: 'accent' },
  ],
  edges: [
    { points: [[170, 172], [275, 172]] },
    { points: [[170, 80], [205, 80], [205, 172]], arrow: false },
    { points: [[170, 264], [205, 264], [205, 172]], arrow: false },
    { points: [[480, 80], [595, 80]], tone: 'accent' },
    { points: [[480, 172], [595, 172]], tone: 'accent' },
    { points: [[480, 264], [595, 264]], tone: 'accent' },
  ],
  labels: [
    { x: 14, y: 22, lines: ['Who can act'] },
    { x: 210, y: 146, w: 65, align: 'middle', lines: ['logged'] },
    { x: 480, y: 54, w: 115, align: 'middle', tone: 'accent', lines: ['high severity'] },
    { x: 480, y: 146, w: 115, align: 'middle', tone: 'accent', lines: ['alarms'] },
    { x: 480, y: 238, w: 115, align: 'middle', tone: 'accent', lines: ['spend alerts'] },
  ],
};
