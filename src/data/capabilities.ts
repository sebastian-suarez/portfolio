export type PaneTone = 'default' | 'alt' | 'accent';

export interface Capability {
  title: string;
  blurb: string;
  chips: string[];
  tone: PaneTone;
}

export const capabilities: Capability[] = [
  {
    title: 'Backend',
    blurb: 'Node.js and TypeScript services with Clean Architecture boundaries and DDD vocabulary.',
    chips: ['Node.js', 'TypeScript', 'Express', 'Prisma', 'DDD'],
    tone: 'default',
  },
  {
    title: 'Data',
    blurb: 'PostgreSQL and MongoDB schemas modeled around real access patterns.',
    chips: ['PostgreSQL', 'MongoDB', 'Prisma'],
    tone: 'alt',
  },
  {
    title: 'Cloud',
    blurb: 'AWS, from IAM hardening to production services.',
    chips: ['AWS', 'IAM', 'CLI tooling'],
    tone: 'default',
  },
  {
    title: 'Hardware',
    blurb: 'Rust on embedded targets, plus the CAD, FDM printing and carbon fiber to build the enclosure.',
    chips: ['Rust', 'Arduino', 'hidapi', 'CAD', 'FDM', 'Carbon fiber'],
    tone: 'accent',
  },
  {
    title: 'Agent tooling',
    blurb: 'MCP servers, multi-model review harnesses and an agentic OS in Swift.',
    chips: ['MCP', 'Claude Code', 'Codex', 'Antigravity', 'Swift'],
    tone: 'alt',
  },
];
