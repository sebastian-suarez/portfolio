import type { DiagramData } from '../components/diagram/types';
import { milestones } from '../components/diagram/milestones';
import { reviewGate } from '../components/diagram/reviewGate';
import { rings } from '../components/diagram/rings';

export interface Project {
  slug: string;
  title: string;
  blurb: string;
  tags: string[];
  /** Public repository. Leave out while the repo is private; the card then shows no link. */
  repo?: string;
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
];
