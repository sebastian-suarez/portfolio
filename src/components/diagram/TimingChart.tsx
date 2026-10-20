import type { CSSProperties } from 'react';
import type { TimingData } from '../../data/clientWork';
import { DiagramHost } from './Diagram';

const WIDTH = 820;
const HEIGHT = 168;
const BAR_X = 110;
const BAR_W = 600;
const BAR_H = 36;
const ROW_GAP = 20;
const AXIS_Y = 2 * BAR_H + ROW_GAP + 40;
/** A real 20 ms bar is 2 units wide; never draw it thinner than that. */
const MIN_BAR = 2;

interface Props {
  data: TimingData;
  minScale?: number;
}

/** Before/after bars on a linear axis, styled and revealed like the diagrams. */
export function TimingChart({ data, minScale = 0 }: Props) {
  const x = (value: number) => BAR_X + (value / data.axisMax) * BAR_W;
  return (
    <DiagramHost
      id={data.id}
      label={data.label}
      description={data.description}
      width={WIDTH}
      height={HEIGHT}
      minScale={minScale}
      className="dg-chart"
    >
      <g className="dg-axis" aria-hidden="true">
        <line className="dg-axis-line" x1={BAR_X} x2={BAR_X + BAR_W} y1={AXIS_Y} y2={AXIS_Y} />
        {data.ticks.map((tick) => (
          <g key={tick.value}>
            <line className="dg-axis-line" x1={x(tick.value)} x2={x(tick.value)} y1={AXIS_Y} y2={AXIS_Y + 6} />
            <text className="dg-label" x={x(tick.value)} y={AXIS_Y + 22} textAnchor="middle" fontSize={13}>
              {tick.text}
            </text>
          </g>
        ))}
      </g>
      {data.rows.map((row, i) => {
        const y = 12 + i * (BAR_H + ROW_GAP);
        const w = Math.max(MIN_BAR, x(row.value) - BAR_X);
        const tone = row.tone ?? 'muted';
        return (
          <g key={row.name} className={`dg-bar-row dg-tone-${tone}`} style={{ '--i': i } as CSSProperties}>
            <text className="dg-text" x={0} y={y + BAR_H / 2 + 15 * 0.36} fontSize={15} fontWeight={600}>
              {row.name}
            </text>
            <rect className="dg-bar-track" x={BAR_X} y={y} width={BAR_W} height={BAR_H} rx={10} />
            <rect className="dg-bar" x={BAR_X} y={y} width={w} height={BAR_H} rx={Math.min(10, w / 2)} />
            <text className={`dg-label dg-label-${tone} dg-bar-value`} x={BAR_X + w + 12} y={y + BAR_H / 2 + 13 * 0.36} fontSize={13}>
              {row.text}
            </text>
          </g>
        );
      })}
    </DiagramHost>
  );
}
