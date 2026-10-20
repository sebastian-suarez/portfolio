import type { DiagramData } from './types';

/** Intive: the two services between the client CMS and the mobile apps. Facts from the CV only. */
export const cmsPipeline: DiagramData = {
  id: 'cms-pipeline',
  width: 760,
  height: 200,
  label: 'Client CMS to fetch service to transform service to mobile apps',
  description:
    "The client CMS feeds a fetch service that pulls its data. A transform service reshapes that data, including comments and reading time, into the mobile team's existing schema and serves the mobile apps. Both services were mine; changes to the pipeline cut response payload size by 10%.",
  regions: [{ x: 180, y: 10, w: 402, h: 170, radius: 16, tone: 'panel' }],
  nodes: [
    { x: 0, y: 52, w: 150, h: 76, lines: [{ text: 'Client CMS', bold: true }, 'modules, packages'] },
    { x: 196, y: 52, w: 160, h: 76, lines: [{ text: 'Fetch service', bold: true }, 'pulls CMS data'] },
    { x: 406, y: 52, w: 160, h: 76, lines: [{ text: 'Transform service', bold: true }, 'fits mobile schema'], tone: 'accent' },
    { x: 610, y: 52, w: 150, h: 76, lines: [{ text: 'Mobile apps', bold: true }, 'existing schema'] },
  ],
  edges: [
    { points: [[150, 90], [191, 90]] },
    { points: [[356, 90], [401, 90]] },
    { points: [[566, 90], [605, 90]], tone: 'accent' },
  ],
  labels: [
    { x: 196, y: 22, lines: ['Owned both services'] },
    { x: 0, y: 140, w: 150, align: 'middle', lines: ['traced, documented'] },
    { x: 406, y: 140, w: 160, align: 'middle', lines: ['comments, reading time,', 'other metadata'] },
    { x: 610, y: 140, w: 150, align: 'middle', tone: 'accent', lines: ['payload size −10%'] },
  ],
};
