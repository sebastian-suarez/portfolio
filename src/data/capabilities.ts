export type PaneTone = 'default' | 'alt' | 'accent';

export interface Capability {
  title: string;
  blurb: string;
  chips: string[];
  tone: PaneTone;
}

// The site's capabilities merged with the CV's skill groups.
export const capabilities: Capability[] = [
  {
    title: 'Backend',
    blurb: 'Node.js and TypeScript services with Clean Architecture boundaries and DDD vocabulary. Java and Spring before that.',
    chips: ['Node.js', 'TypeScript', 'Express.js', 'NestJS', 'Java', 'Spring', 'REST APIs', 'Microservices', 'DDD'],
    tone: 'default',
  },
  {
    title: 'Frontend & mobile',
    blurb: 'React and React Native apps, with feature flags and permissions deciding what each user can reach.',
    chips: ['React', 'React Native', 'Material UI', 'Feature flags', 'Permissions'],
    tone: 'alt',
  },
  {
    title: 'Data & cloud',
    blurb: 'PostgreSQL and MongoDB schemas modeled around real access patterns. AWS, from IAM hardening to production services.',
    chips: ['PostgreSQL', 'MongoDB', 'Prisma', 'AWS', 'IAM', 'Docker'],
    tone: 'default',
  },
  {
    title: 'Delivery',
    blurb: 'GitHub Actions pipelines, automated tests and OpenAPI contracts.',
    chips: ['Git', 'GitHub Actions', 'CI/CD', 'Automated testing', 'OpenAPI', 'Postman', 'Linux'],
    tone: 'alt',
  },
  {
    title: 'Hardware',
    blurb: 'Rust on embedded targets, plus the CAD, FDM printing and carbon fiber to build the enclosure.',
    chips: ['Rust', 'Arduino', 'hidapi', 'CAD', 'FDM', 'Carbon fiber'],
    tone: 'accent',
  },
  {
    title: 'Agent tooling',
    blurb: 'MCP servers, multi-model review harnesses and an agentic OS in Swift. AI-assisted development every day.',
    chips: ['MCP', 'Claude Code', 'Codex', 'Antigravity', 'Swift'],
    tone: 'default',
  },
];
