import type { CSSProperties, ReactNode } from 'react';
import type { DiagramData, DiagramEdge, DiagramLabel, DiagramNode, DiagramRegion, NodeLine } from './types';

const NODE_FONT = 15;
const NODE_LINE = 20;
const LABEL_FONT = 13;
const LABEL_LINE = 16;
/** Baseline sits this fraction of the font size below the line's vertical centre. */
const BASELINE = 0.36;
/** Arrowhead half-size in diagram units (the old 5-unit marker at stroke width 2). */
const HEAD = 4;

interface Props {
  data: DiagramData;
  /**
   * Floor for the host scale. The diagram scales with its container down to
   * `width * minScale`, then the host scrolls instead. 0 means pure scaling.
   */
  minScale?: number;
  className?: string;
}

/** Order index for the reveal stagger (see `.dg-wrap` in global.css). */
const order = (i: number) => ({ '--i': i }) as CSSProperties;

function normalise(line: NodeLine): { text: string; bold: boolean } {
  return typeof line === 'string' ? { text: line, bold: false } : { text: line.text, bold: Boolean(line.bold) };
}

/** Baseline y for line `i` of `n` lines vertically centred on `cy`. */
function baseline(cy: number, i: number, n: number, lineHeight: number, fontSize: number): number {
  return cy - ((n - 1) * lineHeight) / 2 + i * lineHeight + fontSize * BASELINE;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function pathOf(edge: DiagramEdge): string {
  return edge.points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
}

/** Triangle at the last point, pointing along the last segment, same size as the old marker. */
function headOf(edge: DiagramEdge): string {
  const [ex, ey] = edge.points[edge.points.length - 1];
  const [px, py] = edge.points[edge.points.length - 2];
  const len = Math.hypot(ex - px, ey - py) || 1;
  const ux = (ex - px) / len;
  const uy = (ey - py) / len;
  const tip = [ex + HEAD * ux, ey + HEAD * uy];
  const b1 = [ex - HEAD * ux - HEAD * uy, ey - HEAD * uy + HEAD * ux];
  const b2 = [ex - HEAD * ux + HEAD * uy, ey - HEAD * uy - HEAD * ux];
  return `M ${r2(tip[0])} ${r2(tip[1])} L ${r2(b1[0])} ${r2(b1[1])} L ${r2(b2[0])} ${r2(b2[1])} Z`;
}

function Region({ region, i }: { region: DiagramRegion; i: number }) {
  const className = `dg-region dg-region-${region.tone}`;
  if (region.shape === 'circle') {
    return <circle className={className} style={order(i)} cx={region.x + region.w / 2} cy={region.y + region.h / 2} r={region.w / 2} />;
  }
  return (
    <rect className={className} style={order(i)} x={region.x} y={region.y} width={region.w} height={region.h} rx={region.radius ?? 0} />
  );
}

function Edge({ edge, i }: { edge: DiagramEdge; i: number }) {
  const tone = edge.tone ?? 'muted';
  const d = pathOf(edge);
  // Solid edges draw in through a normalised dash; dashed ones keep their pattern and fade.
  const kind = edge.dashed ? 'dg-edge-dashed' : 'dg-edge-draw';
  return (
    <g className={`dg-edge-group dg-tone-${tone}`} style={order(i)} aria-hidden="true">
      <path
        className={`dg-edge ${kind}`}
        d={d}
        pathLength={edge.dashed ? undefined : 1}
        strokeDasharray={edge.dashed ? '6 6' : undefined}
      />
      {edge.arrow === false ? null : <path className="dg-head" d={headOf(edge)} />}
    </g>
  );
}

/** A dot that runs along an accent edge, rests, and runs again. Hidden under reduced motion. */
function Pulse({ edge }: { edge: DiagramEdge }) {
  return (
    <circle className="dg-pulse" r={4.5} cx={0} cy={0}>
      <animateMotion dur="3.2s" repeatCount="indefinite" path={pathOf(edge)} keyPoints="0;1;1" keyTimes="0;0.5;1" calcMode="linear" />
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.06;0.44;0.52;1" dur="3.2s" repeatCount="indefinite" />
    </circle>
  );
}

function Node({ node, i }: { node: DiagramNode; i: number }) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const lines = node.lines.map(normalise);
  return (
    <g className={`dg-node dg-node-${node.tone ?? 'default'}`} style={order(i)}>
      {node.shape === 'circle' ? (
        <circle className="dg-box" cx={cx} cy={cy} r={node.w / 2} />
      ) : (
        <rect className="dg-box" x={node.x} y={node.y} width={node.w} height={node.h} rx={10} />
      )}
      <text className="dg-text" textAnchor="middle" fontSize={NODE_FONT}>
        {lines.map((line, j) => (
          <tspan key={j} x={cx} y={baseline(cy, j, lines.length, NODE_LINE, NODE_FONT)} fontWeight={line.bold ? 600 : 400}>
            {line.text}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function Label({ label, i }: { label: DiagramLabel; i: number }) {
  const middle = label.align === 'middle';
  const x = middle ? label.x + (label.w ?? 0) / 2 : label.x;
  // Labels are placed by their top-left like the comp's text blocks.
  const cy = label.y + LABEL_LINE / 2;
  return (
    <text
      className={`dg-label dg-label-${label.tone ?? 'muted'}`}
      style={order(i)}
      textAnchor={middle ? 'middle' : 'start'}
      fontSize={LABEL_FONT}
    >
      {label.lines.map((text, j) => (
        <tspan key={j} x={x} y={cy + j * LABEL_LINE + LABEL_FONT * BASELINE}>
          {text}
        </tspan>
      ))}
    </text>
  );
}

interface HostProps {
  id: string;
  label: string;
  description: string;
  width: number;
  height: number;
  minScale: number;
  className?: string;
  children: ReactNode;
}

/**
 * Shared shell for every diagram and chart: one SVG that scales with its host,
 * a scroll floor for phones, and the hooks the reveal script uses.
 */
export function DiagramHost({ id, label, description, width, height, minScale, className, children }: HostProps) {
  const descId = `${id}-desc`;
  const style: CSSProperties = { minWidth: minScale > 0 ? Math.round(width * minScale) : undefined };
  // Below the floor the host scrolls, so it must be reachable and named for keyboard users.
  const scrollable = minScale > 0;
  const naming = { role: 'group' as const, 'aria-label': label, 'aria-describedby': descId };
  // One unit of padding keeps the 1px strokes of boxes on the viewBox edge from being clipped.
  const viewBox = `-1 -1 ${width + 2} ${height + 2}`;
  return (
    <div className={['dg-wrap', className].filter(Boolean).join(' ')}>
      <div className="dg-host" {...(scrollable ? { tabIndex: 0, ...naming } : {})}>
        <svg className="dg" viewBox={viewBox} style={style} {...(scrollable ? {} : naming)}>
          <desc id={descId}>{description}</desc>
          {children}
        </svg>
      </div>
      {scrollable ? <p className="dg-hint">Scroll sideways for the whole diagram.</p> : null}
    </div>
  );
}

/** Data-driven diagram: regions, edges, nodes and labels in the comp's coordinate space. */
export function Diagram({ data, minScale = 0, className }: Props) {
  const accentEdges = data.edges.filter((edge) => edge.tone === 'accent');
  return (
    <DiagramHost
      id={data.id}
      label={data.label}
      description={data.description}
      width={data.width}
      height={data.height}
      minScale={minScale}
      className={className}
    >
      {data.regions?.map((region, i) => <Region key={i} region={region} i={i} />)}
      {data.edges.map((edge, i) => <Edge key={i} edge={edge} i={i} />)}
      {data.nodes.map((node, i) => <Node key={i} node={node} i={i} />)}
      {data.labels?.map((label, i) => <Label key={i} label={label} i={i} />)}
      {accentEdges.length > 0 ? (
        <g className="dg-pulses" aria-hidden="true">
          {accentEdges.map((edge, i) => (
            <Pulse key={i} edge={edge} />
          ))}
        </g>
      ) : null}
    </DiagramHost>
  );
}
