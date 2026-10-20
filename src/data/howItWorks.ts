/** When the claims on /how-it-works/ were last checked against the live AWS, Cloudflare and GitHub setup. */
export const setupCheckedOn = { iso: '2026-10-20', label: '20 October 2026' } as const;

export const repoUrl = 'https://github.com/sebastian-suarez/portfolio';

export interface ServiceStage {
  id: string;
  title: string;
  items: Array<{ name: string; role: string }>;
}

/** Every service the site uses, in the order a change meets them: from the first edit to your screen. */
export const services: ServiceStage[] = [
  {
    id: 'develop',
    title: 'Develop',
    items: [
      { name: 'Astro 7', role: 'builds static HTML and CSS' },
      { name: 'React 19', role: 'components rendered at build time only' },
      { name: 'Tailwind CSS 4', role: 'styles' },
      { name: 'TypeScript', role: 'types, checked by astro check' },
      { name: 'Node.js 24 and npm', role: 'runtime and packages' },
      { name: 'GSAP', role: 'scroll effects where CSS has no scroll timelines' },
    ],
  },
  {
    id: 'review',
    title: 'Review and CI',
    items: [
      { name: 'GitHub', role: 'public repository; main takes pull requests only' },
      { name: 'GitHub Actions', role: 'CI, Infra and Deploy workflows' },
      { name: 'GitHub environments', role: 'production and infra, main only' },
      { name: 'Dependabot', role: 'weekly grouped updates' },
      { name: 'Secret scanning', role: 'with push protection' },
    ],
  },
  {
    id: 'iac',
    title: 'Infrastructure as code',
    items: [
      { name: 'OpenTofu 1.13', role: 'the site stack and the IAM stack' },
      { name: 'S3 state bucket', role: 'versioned, encrypted, native locking' },
      { name: 'AWS Resource Group', role: 'lists what is tagged for the project' },
    ],
  },
  {
    id: 'serve',
    title: 'Serve',
    items: [
      { name: 'Cloudflare', role: 'registrar, DNS with DNSSEC, proxy and TLS' },
      { name: 'CloudFront', role: 'CDN, viewer-request function, origin access control' },
      { name: 'S3', role: 'private, versioned site bucket' },
      { name: 'ACM', role: 'certificate for the apex and www' },
      { name: 'iCloud+', role: 'mail for the domain' },
    ],
  },
  {
    id: 'access',
    title: 'Access',
    items: [
      { name: 'IAM Identity Center', role: 'sign-in for people' },
      { name: 'IAM OIDC provider', role: 'GitHub Actions without stored keys' },
      { name: 'IAM roles', role: 'deploy, plan and apply, one per job context' },
      { name: 'Cloudflare API tokens', role: 'two, limited to this zone' },
    ],
  },
  {
    id: 'watch',
    title: 'Watch',
    items: [
      { name: 'CloudTrail', role: 'organization trail, every Region' },
      { name: 'CloudWatch and SNS', role: 'alarms and email' },
      { name: 'GuardDuty and EventBridge', role: 'threat findings to email' },
      { name: 'Security Hub, Config, Inspector', role: 'posture and vulnerability checks' },
      { name: 'IAM Access Analyzer', role: 'external and unused access' },
      { name: 'Budgets, Cost Anomaly Detection', role: 'spend alerts' },
    ],
  },
];
