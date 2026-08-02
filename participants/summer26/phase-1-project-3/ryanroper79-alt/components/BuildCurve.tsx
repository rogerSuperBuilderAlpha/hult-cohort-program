import { buildCurveCaption, buildCurvePoints } from '@/data/build-curve';

const W = 640;
const H = 220;
const PAD = { top: 24, right: 24, bottom: 48, left: 48 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;
const maxY = Math.max(1, ...buildCurvePoints.map((p) => p.shippedCount));

function yScale(v: number) {
  return PAD.top + chartH - (v / maxY) * chartH;
}

function xScale(i: number) {
  const step = chartW / (buildCurvePoints.length - 1 || 1);
  return PAD.left + i * step;
}

export function BuildCurve() {
  const linePoints = buildCurvePoints
    .map((p, i) => `${xScale(i)},${yScale(p.shippedCount)}`)
    .join(' ');

  const areaPoints = [
    ...buildCurvePoints.map((p, i) => `${xScale(i)},${yScale(p.shippedCount)}`),
    `${xScale(buildCurvePoints.length - 1)},${PAD.top + chartH}`,
    `${xScale(0)},${PAD.top + chartH}`,
  ].join(' ');

  return (
    <figure className="rounded-lg border border-ceal-line bg-ceal-panel p-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-2xl"
        role="img"
        aria-label={buildCurveCaption}
      >
        <defs>
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3D9B5F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3D9B5F" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1].map((tick) => {
          const y = PAD.top + chartH - (tick / maxY) * chartH;
          return (
            <line
              key={tick}
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="#D4E8DC"
              strokeWidth="1"
            />
          );
        })}
        <polygon points={areaPoints} fill="url(#curveFill)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#1F5C45"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {buildCurvePoints.map((p, i) => (
          <g key={p.week}>
            <circle cx={xScale(i)} cy={yScale(p.shippedCount)} r="6" fill="#F4B942" stroke="#1F5C45" strokeWidth="2" />
            <text
              x={xScale(i)}
              y={H - 12}
              textAnchor="middle"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#5A7A6E' }}
            >
              W{p.week}
            </text>
            <text
              x={xScale(i)}
              y={yScale(p.shippedCount) - 12}
              textAnchor="middle"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#1F5C45' }}
            >
              {p.shippedCount}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 font-mono text-xs text-ceal-muted">{buildCurveCaption}</figcaption>
    </figure>
  );
}
