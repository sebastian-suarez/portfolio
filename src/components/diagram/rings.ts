import type { DiagramData } from './types';

/** Clean Architecture template: three rings fanning out to six target types. */
export const rings: DiagramData = {
  id: 'rings',
  width: 760,
  height: 320,
  label: 'Domain, application and infrastructure rings, fanning out to six target types',
  description:
    'The domain core sits inside the application ring, which sits inside the infrastructure and interfaces ring. From the outer ring, arrows fan out to six target types: MCP servers, CLI tools and embedded Rust on one side, mobile, desktop and libraries on the other.',
  regions: [
    { shape: 'circle', x: 240, y: 20, w: 280, h: 280, fill: '#1a1a1a', stroke: '#3a3a3a' },
    { shape: 'circle', x: 285, y: 65, w: 190, h: 190, fill: '#222222', stroke: '#454545' },
  ],
  nodes: [
    { shape: 'circle', x: 330, y: 110, w: 100, h: 100, lines: [{ text: 'Domain', bold: true }], tone: 'accent-fill' },
    { x: 0, y: 40, w: 150, h: 48, lines: ['MCP servers'] },
    { x: 0, y: 136, w: 150, h: 48, lines: ['CLI tools'] },
    { x: 0, y: 232, w: 150, h: 48, lines: ['Embedded, Rust'] },
    { x: 610, y: 40, w: 150, h: 48, lines: ['Mobile'] },
    { x: 610, y: 136, w: 150, h: 48, lines: ['Desktop'] },
    { x: 610, y: 232, w: 150, h: 48, lines: ['Libraries'] },
  ],
  edges: [
    { points: [[277, 64], [155, 64]] },
    { points: [[239, 160], [155, 160]] },
    { points: [[277, 256], [155, 256]] },
    { points: [[482, 64], [605, 64]] },
    { points: [[521, 160], [605, 160]] },
    { points: [[482, 256], [605, 256]] },
  ],
  labels: [
    { x: 280, y: 40, w: 200, align: 'middle', lines: ['Infrastructure, interfaces'] },
    { x: 330, y: 76, w: 100, align: 'middle', lines: ['Application'] },
  ],
};
