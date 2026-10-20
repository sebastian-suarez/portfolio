import type { DiagramData } from './types';

/** VSebCode: the review-gate harness. AGENTS.md feeds both sides. */
export const reviewGate: DiagramData = {
  id: 'review-gate',
  width: 760,
  height: 250,
  label: 'Review gate: Claude Code implements, Codex reviews, VSebCode merges; AGENTS.md feeds both',
  description:
    'Claude Code sends a patch to the Codex review gate, which either sends it back or approves it into the VSebCode merge. AGENTS.md, imported from CLAUDE.md, feeds both Claude Code and the review gate, and Antigravity reads the same file.',
  nodes: [
    { x: 0, y: 48, w: 180, h: 72, lines: [{ text: 'Claude Code', bold: true }, 'implements'] },
    {
      x: 290,
      y: 48,
      w: 180,
      h: 72,
      lines: [{ text: 'Codex review gate', bold: true }, 'GPT-6 Astra, xhigh'],
      tone: 'accent',
    },
    { x: 580, y: 48, w: 180, h: 72, lines: [{ text: 'VSebCode', bold: true }, 'merge'] },
    { x: 280, y: 180, w: 200, h: 64, lines: [{ text: 'AGENTS.md', bold: true }, 'imported from CLAUDE.md'] },
    { x: 580, y: 180, w: 180, h: 64, lines: [{ text: 'Antigravity', bold: true }, 'reads the same file'] },
  ],
  edges: [
    { points: [[180, 72], [285, 72]] },
    { points: [[289, 96], [185, 96]], dashed: true },
    { points: [[470, 84], [575, 84]], tone: 'accent' },
    { points: [[380, 180], [380, 125]] },
    { points: [[380, 150], [90, 150], [90, 125]] },
    { points: [[480, 212], [575, 212]] },
  ],
  labels: [
    { x: 211, y: 44, w: 48, align: 'middle', lines: ['patch'] },
    { x: 199, y: 108, w: 72, align: 'middle', lines: ['sent back'] },
    { x: 493, y: 56, w: 64, align: 'middle', tone: 'accent', lines: ['approved'] },
  ],
};
