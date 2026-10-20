import type { CSSProperties } from 'react';
import type { DiagramData, DiagramEdge, DiagramLabel, DiagramNode, DiagramRegion, NodeLine } from './types';

const NODE_FONT = 15;
const NODE_LINE = 20;
const LABEL_FONT = 13;
const LABEL_LINE = 16;
/** Baseline sits this fraction of the font size below the line's vertical centre. */
const BASELINE = 0.36;

interface Props {
  data: DiagramData;
  /**
   * Floor for the host scale. The diagram scales with its container down to
   * `width * minScale`, then the host scrolls instead. 0 means pure scaling.
   */
  minScale?: number;
  className?: string;
}

function normalise(line: NodeLine): { text: string; bold: boolean } {
  return typeof line === 'string' ? { text: line, bold: false } : { text: line.text, bold: Boolean(line.bold) };
}

/** Baseline y for line `i` of `n` lines vertically centred on `cy`. */
function baseline(cy: number, i: number, n: number, lineHeight: number, fontSize: number): number {
  return cy - ((n - 1) * lineHeight) / 2 + i * lineHeight + fontSize * BASELINE;
}

function Region({ region }: { region: DiagramRegion }) {
  const common = { className: 'dg-region', fill: region.fill, stroke: region.stroke, strokeWidth: 1 };
  if (region.shape === 'circle') {
    return <circle cx={region.x + region.w / 2} cy={region.y + region.h / 2} r={region.w / 2} {...common} />;
  }
  return <rect x={region.x} y={region.y} width={region.w} height={region.h} rx={region.radius ?? 0} {...common} />;
}

function Edge({ edge, markers }: { edge: DiagramEdge; markers: Record<'muted' | 'accent', string> }) {
  const tone = edge.tone ?? 'muted';
  const d = edge.points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  return (
    <path
      className={`dg-edge dg-edge-${tone}`}
      d={d}
      strokeDasharray={edge.dashed ? '6 6' : undefined}
      markerEnd={edge.arrow === false ? undefined : `url(#${markers[tone]})`}
      aria-hidden="true"
    />
  );
}

function Node({ node }: { node: DiagramNode }) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const lines = node.lines.map(normalise);
  return (
    <g className={`dg-node dg-node-${node.tone ?? 'default'}`}>
      {node.shape === 'circle' ? (
        <circle className="dg-box" cx={cx} cy={cy} r={node.w / 2} />
      ) : (
        <rect className="dg-box" x={node.x} y={node.y} width={node.w} height={node.h} rx={8} />
      )}
      <text className="dg-text" textAnchor="middle" fontSize={NODE_FONT}>
        {lines.map((line, i) => (
          <tspan
            key={i}
            x={cx}
            y={baseline(cy, i, lines.length, NODE_LINE, NODE_FONT)}
            fontWeight={line.bold ? 600 : 400}
          >
            {line.text}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function Label({ label }: { label: DiagramLabel }) {
  const middle = label.align === 'middle';
  const x = middle ? label.x + (label.w ?? 0) / 2 : label.x;
  // Labels are placed by their top-left like the comp's text blocks.
  const cy = label.y + LABEL_LINE / 2;
  return (
    <text
      className={`dg-label dg-label-${label.tone ?? 'muted'}`}
      textAnchor={middle ? 'middle' : 'start'}
      fontSize={LABEL_FONT}
    >
      {label.lines.map((text, i) => (
        <tspan key={i} x={x} y={cy + i * LABEL_LINE + LABEL_FONT * BASELINE}>
          {text}
        </tspan>
      ))}
    </text>
  );
}

/**
 * Data-driven diagram: regions, edges, nodes and labels in the comp's
 * coordinate space, rendered as one SVG that scales with its host.
 */
export function Diagram({ data, minScale = 0, className }: Props) {
  const markers = { muted: `${data.id}-arrow-muted`, accent: `${data.id}-arrow-accent` };
  const descId = `${data.id}-desc`;
  const style: CSSProperties = {
    minWidth: minScale > 0 ? Math.round(data.width * minScale) : undefined,
    ...(data.nodeFill ? ({ '--dg-node-fill': data.nodeFill } as CSSProperties) : {}),
  };
  // Below the floor the host scrolls, so it must be reachable and named for keyboard users.
  const scrollable = minScale > 0;
  const naming = { role: 'group' as const, 'aria-label': data.label, 'aria-describedby': descId };
  // One unit of padding keeps the 1px strokes of boxes on the viewBox edge from being clipped.
  const viewBox = `-1 -1 ${data.width + 2} ${data.height + 2}`;
  return (
    <div className={['dg-wrap', className].filter(Boolean).join(' ')}>
      <div className="dg-host" {...(scrollable ? { tabIndex: 0, ...naming } : {})}>
        <svg className="dg" viewBox={viewBox} style={style} {...(scrollable ? {} : naming)}>
        <desc id={descId}>{data.description}</desc>
        <defs>
          <marker id={markers.muted} markerWidth="5" markerHeight="5" refX="2" refY="2" orient="auto" overflow="visible">
            <path className="dg-head-muted" d="M0 0 L4 2 L0 4 Z" />
          </marker>
          <marker id={markers.accent} markerWidth="5" markerHeight="5" refX="2" refY="2" orient="auto" overflow="visible">
            <path className="dg-head-accent" d="M0 0 L4 2 L0 4 Z" />
          </marker>
        </defs>
        {data.regions?.map((region, i) => (
          <Region key={i} region={region} />
        ))}
        {data.edges.map((edge, i) => (
          <Edge key={i} edge={edge} markers={markers} />
        ))}
        {data.nodes.map((node, i) => (
          <Node key={i} node={node} />
        ))}
        {data.labels?.map((label, i) => (
          <Label key={i} label={label} />
        ))}
        </svg>
      </div>
      {scrollable ? <p className="dg-hint">Scroll sideways for the whole diagram.</p> : null}
    </div>
  );
}
