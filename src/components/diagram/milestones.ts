import type { DiagramData } from './types';

/** RS50 bridge: milestone gate. Status as of 17 Sep 2026; refresh before publishing. */
export const milestones: DiagramData = {
  id: 'milestones',
  width: 760,
  height: 180,
  label: 'Milestone plan: Spike 0, then M1, M2, M3',
  description:
    'Four gates in sequence. Spike 0, raw force packets from user space, passed when the wheel moved on 16 Sep 2026. M1, the rs50d daemon, is built and waits for its first wheel run. M2, the DirectInput proxy DLL, and M3, Assetto Corsa end to end, are planned.',
  nodes: [
    {
      x: 0,
      y: 32,
      w: 160,
      h: 88,
      lines: [{ text: 'Spike 0', bold: true }, 'raw force packets', 'from user space'],
      tone: 'accent',
    },
    { x: 200, y: 32, w: 160, h: 88, lines: [{ text: 'M1', bold: true }, 'rs50d daemon'] },
    { x: 400, y: 32, w: 160, h: 88, lines: [{ text: 'M2', bold: true }, 'DirectInput', 'proxy DLL'] },
    { x: 600, y: 32, w: 160, h: 88, lines: [{ text: 'M3', bold: true }, 'Assetto Corsa,', 'end to end'] },
  ],
  edges: [
    { points: [[160, 76], [195, 76]] },
    { points: [[360, 76], [395, 76]] },
    { points: [[560, 76], [595, 76]] },
  ],
  labels: [
    { x: 0, y: 136, w: 160, align: 'middle', tone: 'accent', lines: ['go: wheel moved,', '16 Sep 2026'] },
    { x: 200, y: 136, w: 160, align: 'middle', lines: ['built,', 'first wheel run next'] },
    { x: 400, y: 136, w: 160, align: 'middle', lines: ['planned'] },
    { x: 600, y: 136, w: 160, align: 'middle', lines: ['planned'] },
  ],
};
