import type { DiagramData } from './types';

/** Hero: torque path of the RS50 force-feedback bridge, Wine bottle to wheel. */
export const torquePath: DiagramData = {
  id: 'torque',
  width: 600,
  height: 440,
  label: 'Torque path of the RS50 force-feedback bridge',
  description:
    'Inside the Wine bottle, Assetto Corsa sends DirectInput calls to a dinput8.dll proxy. The proxy passes force requests to the rs50d daemon on the macOS host, which drives the Logitech RS50 with torque at 1 kHz.',
  nodeFill: '#222222',
  regions: [
    { x: 0, y: 32, w: 600, h: 168, radius: 16, fill: '#191919', stroke: '#2a2a2a' },
    { x: 0, y: 264, w: 600, h: 168, radius: 16, fill: '#191919', stroke: '#2a2a2a' },
  ],
  nodes: [
    { x: 32, y: 90, w: 200, h: 72, lines: [{ text: 'Assetto Corsa', bold: true }, 'DirectInput client'] },
    { x: 368, y: 90, w: 200, h: 72, lines: [{ text: 'dinput8.dll proxy', bold: true }, 'inside the bottle'] },
    { x: 368, y: 322, w: 200, h: 72, lines: [{ text: 'rs50d daemon', bold: true }, 'Rust, hidapi'] },
    {
      x: 32,
      y: 322,
      w: 200,
      h: 72,
      lines: [{ text: 'Logitech RS50', bold: true }, 'force interface'],
      tone: 'accent',
    },
  ],
  edges: [
    { points: [[232, 126], [363, 126]] },
    { points: [[468, 162], [468, 317]] },
    { points: [[368, 358], [237, 358]], tone: 'accent' },
  ],
  labels: [
    { x: 16, y: 44, lines: ['Wine bottle, Highball'] },
    { x: 16, y: 276, lines: ['macOS host'] },
    { x: 236, y: 98, w: 128, align: 'middle', lines: ['DirectInput calls'] },
    { x: 480, y: 234, w: 112, lines: ['force requests'] },
    { x: 244, y: 370, w: 112, align: 'middle', tone: 'accent', lines: ['torque at 1 kHz'] },
  ],
};
