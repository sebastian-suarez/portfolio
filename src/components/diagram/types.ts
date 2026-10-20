export type Tone = 'muted' | 'accent';
export type NodeTone = 'default' | 'accent' | 'accent-fill';
export type Shape = 'rect' | 'circle';
/** Region looks live in CSS: a tinted glass panel, or the two rings of the architecture diagram. */
export type RegionTone = 'panel' | 'ring' | 'ring-inner';

/** A plain string is a regular line; an object can be bold. */
export type NodeLine = string | { text: string; bold?: boolean };

/** Background panel or ring. */
export interface DiagramRegion {
  shape?: Shape;
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
  tone: RegionTone;
}

/** A labelled box (or disc). Lines are explicit: SVG text does not wrap. */
export interface DiagramNode {
  shape?: Shape;
  x: number;
  y: number;
  w: number;
  h: number;
  lines: NodeLine[];
  tone?: NodeTone;
}

/**
 * A polyline. Arrowhead on the last point unless `arrow` is false.
 * Accent edges carry the travelling pulse.
 */
export interface DiagramEdge {
  points: Array<[number, number]>;
  arrow?: boolean;
  dashed?: boolean;
  tone?: Tone;
}

/** Free text. With `align: 'middle'` the text centres inside `w`. */
export interface DiagramLabel {
  x: number;
  y: number;
  w?: number;
  lines: string[];
  align?: 'start' | 'middle';
  tone?: Tone;
}

export interface DiagramData {
  /** Unique per page; namespaces the SVG ids. */
  id: string;
  width: number;
  height: number;
  /** Accessible name for the whole diagram. */
  label: string;
  /** One or two sentences spelling out the relationships the arrows encode. */
  description: string;
  regions?: DiagramRegion[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  labels?: DiagramLabel[];
}
