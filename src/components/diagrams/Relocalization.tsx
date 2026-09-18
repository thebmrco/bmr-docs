import React from 'react'

/**
 * Three steps: the feature points stored by the first scan, the same points seen
 * from a new viewpoint today, and the two aligned so the original axes are
 * recovered. The constellation is one shared set of points, rotated for step 2,
 * so the eye can see it is the same room rather than two random scatters.
 */
const POINTS: [number, number][] = [
  [45, 50], [95, 35], [150, 60], [70, 110], [125, 120], [175, 105], [100, 165],
]

/** Step 2 is the same constellation seen from a different angle. */
const rotate = ([x, y]: [number, number], deg = 16, cx = 110, cy = 100): [number, number] => {
  const r = (deg * Math.PI) / 180
  return [
    cx + (x - cx) * Math.cos(r) - (y - cy) * Math.sin(r),
    cy + (x - cx) * Math.sin(r) + (y - cy) * Math.cos(r),
  ]
}

const PANEL = { w: 210, h: 200, y: 85 }
const XS = [25, 275, 525]

function Axes({ x, y, className }: { x: number; y: number; className: string }) {
  return (
    <g className={className}>
      <line x1={x} y1={y} x2={x + 34} y2={y} markerEnd="url(#dgArrow2)" />
      <line x1={x} y1={y} x2={x} y2={y - 34} markerEnd="url(#dgArrow2)" />
    </g>
  )
}

export default function Relocalization() {
  return (
    <svg viewBox="0 0 760 400" className="bmr-diagram" role="img"
      aria-label="Three steps. One: the feature points stored by the first scan, with the room's original axes. Two: the same points seen today from a different angle through the phone's camera. Three: the two sets aligned, so the original axes are recovered and the room is verified.">
      <text x="380" y="34" textAnchor="middle" className="dg-title">Detecting the room recovers its coordinates</text>

      {XS.map((x, i) => <rect key={i} x={x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx="10" className={i === 2 ? 'dg-panel-active' : 'dg-panel'} />)}

      {/* 1 — stored */}
      <text x={XS[0] + PANEL.w / 2} y={PANEL.y - 14} textAnchor="middle" className="dg-step">1 · Stored by the first scan</text>
      <g transform={`translate(${XS[0]} ${PANEL.y})`}>
        {POINTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" className="dg-pt-stored" />)}
      </g>
      <Axes x={XS[0] + 30} y={PANEL.y + 175} className="dg-axis-ghost" />
      <text x={XS[0] + PANEL.w / 2} y={PANEL.y + PANEL.h + 20} textAnchor="middle" className="dg-muted">visual feature points + origin</text>

      {/* 2 — seen now */}
      <text x={XS[1] + PANEL.w / 2} y={PANEL.y - 14} textAnchor="middle" className="dg-step">2 · Seen now</text>
      <g transform={`translate(${XS[1]} ${PANEL.y})`}>
        {POINTS.map((p, i) => {
          const [x, y] = rotate(p)
          return <circle key={i} cx={x} cy={y} r="3.4" className="dg-pt-live" />
        })}
      </g>
      <text x={XS[1] + PANEL.w / 2} y={PANEL.y + PANEL.h + 20} textAnchor="middle" className="dg-muted">same features, new viewpoint</text>

      {/* 3 — aligned */}
      <text x={XS[2] + PANEL.w / 2} y={PANEL.y - 14} textAnchor="middle" className="dg-step">3 · Aligned</text>
      <g transform={`translate(${XS[2]} ${PANEL.y})`}>
        {POINTS.map(([x, y], i) => <circle key={`s${i}`} cx={x} cy={y} r="5.5" className="dg-pt-stored" />)}
        {POINTS.map(([x, y], i) => <circle key={`l${i}`} cx={x} cy={y} r="3" className="dg-pt-live" />)}
      </g>
      <Axes x={XS[2] + 30} y={PANEL.y + 175} className="dg-axis" />
      <text x={XS[2] + PANEL.w / 2} y={PANEL.y + PANEL.h + 20} textAnchor="middle" className="dg-muted">coordinates recovered</text>

      {/* flow between the panels */}
      <g className="dg-flow">
        <line x1="240" y1="185" x2="268" y2="185" markerEnd="url(#dgArrow2)" />
        <line x1="490" y1="185" x2="518" y2="185" markerEnd="url(#dgArrow2)" />
      </g>

      {/* the phone doing the matching */}
      <g transform="translate(360 322)">
        <rect x="0" y="0" width="40" height="30" rx="6" className="dg-device" />
        <circle cx="20" cy="15" r="6.5" className="dg-device-lens" />
        <text x="20" y="46" textAnchor="middle" className="dg-muted">live camera</text>
      </g>

      {/* verdict */}
      <g transform="translate(556 330)">
        <rect x="0" y="0" width="148" height="24" rx="12" className="dg-pill" />
        <text x="74" y="16" textAnchor="middle" className="dg-pill-text">Room verified ✓</text>
      </g>

      <defs>
        <marker id="dgArrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" className="dg-arrowhead" />
        </marker>
      </defs>
    </svg>
  )
}
