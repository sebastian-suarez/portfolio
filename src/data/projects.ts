import type { DiagramData } from '../components/diagram/types';
import { iacSplit } from '../components/diagram/iacSplit';
import { milestones } from '../components/diagram/milestones';
import { reviewGate } from '../components/diagram/reviewGate';
import { rings } from '../components/diagram/rings';
import { repoUrl } from './howItWorks';

export interface Project {
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  /** Public repository. Leave out while the repo is private; the card then shows no link. */
  repo?: string;
  /** A page on this site with the full story. Root-absolute, since pages are served at rewritten paths. */
  page?: { href: string; label: string };
  diagram: DiagramData;
}

export const projects: Project[] = [
  {
    slug: 'rs50-bridge',
    title: 'RS50 force-feedback bridge',
    blurb:
      'Force feedback for a Logitech RS50 under Wine on Apple Silicon. A DirectInput proxy inside the bottle, a Rust daemon on the host, GPL-2.0.',
    tags: ['Rust', 'hidapi', 'DirectInput', 'Wine'],
    diagram: milestones,
  },
  {
    slug: 'vsebcode',
    title: 'VSebCode',
    blurb:
      "A fork of microsoft/vscode following VSCodium's patch set. The first repo run through my multi-model harness: Claude Code implements, Codex reviews, nothing merges unreviewed.",
    tags: ['TypeScript', 'Electron', 'Claude Code', 'Codex'],
    repo: 'https://github.com/sebastian-suarez/VSebCode',
    diagram: reviewGate,
  },
  {
    slug: 'clean-architecture-template',
    title: 'Clean Architecture template',
    blurb:
      'A Clean Architecture and DDD template with an AGENTS.md kernel, mapped to six target types from MCP servers to embedded. The base for my Obsidian MCP server.',
    tags: ['TypeScript', 'Node.js', 'DDD', 'MCP'],
    repo: 'https://github.com/sebastian-suarez/Clean-architecture-template',
    diagram: rings,
  },
  {
    slug: 'portfolio',
    title: 'This portfolio',
    blurb:
      "The site you are reading. Static Astro pages in a private S3 bucket behind CloudFront and Cloudflare, infrastructure in OpenTofu, and CI that can't edit the IAM roles it runs as.",
    tags: ['Astro', 'OpenTofu', 'AWS', 'Cloudflare', 'GitHub Actions'],
    repo: repoUrl,
    page: { href: '/how-it-works/', label: 'How it works' },
    diagram: iacSplit,
  },
];
