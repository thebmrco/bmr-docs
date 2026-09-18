import React from 'react'

/**
 * Top-down plan of a room with its origin, metre grid and three captured items,
 * each shown with the (x, y, z) it is stored as. Colours come from CSS variables
 * on .bmr-diagram so the drawing follows the site's light/dark theme.
 */
const M = 63 // pixels per metre
const X0 = 90 // svg x of room origin
const Y0 = 330 // svg y of room origin (floor plan y grows upward)

const px = (m: number) => X0 + m * M
const py = (m: number) => Y0 - m * M

const ITEMS = [
  { n: 1, x: 2, y: 0, label: 'Power outlet marker', coord: '(2.0, 0.0, 0.4)' },
  { n: 2, x: 3, y: 2, label: 'Acoustic measurement', coord: '(3.0, 2.0, 1.2)' },
  { n: 3, x: 4.5, y: 4, label: 'AR-placed display', coord: '(4.5, 4.0, 1.6)' },
]

export default function CoordinateSpace() {
  return (
    <svg viewBox="0 0 760 420" className="bmr-diagram" role="img"
      aria-label="Top-down plan of a 6 by 4 metre room with a metre grid. The origin sits in one corner with x and y axes. A power outlet marker on the near wall, an acoustic measurement in the middle of the room, and a display on the far wall are each numbered and listed with their x, y, z coordinates.">
      <text x="380" y="34" textAnchor="middle" className="dg-title">One coordinate space per room</text>

      {/* room */}
      <rect x={X0} y={py(4)} width={6 * M} height={4 * M} rx="4" className="dg-room" />

      {/* metre grid */}
      <g className="dg-grid">
        {[1, 2, 3, 4, 5].map((m) => <line key={`v${m}`} x1={px(m)} y1={py(4)} x2={px(m)} y2={Y0} />)}
        {[1, 2, 3].map((m) => <line key={`h${m}`} x1={X0} y1={py(m)} x2={px(6)} y2={py(m)} />)}
      </g>

      {/* axes out of the origin */}
      <g className="dg-axis">
        <line x1={X0} y1={Y0} x2={px(1.1)} y2={Y0} markerEnd="url(#dgArrow)" />
        <line x1={X0} y1={Y0} x2={X0} y2={py(1.1)} markerEnd="url(#dgArrow)" />
        <circle cx={X0} cy={Y0} r="5" className="dg-origin" />
      </g>
      <text x={X0 - 10} y={Y0 + 20} textAnchor="end" className="dg-muted">origin (0, 0, 0)</text>

      {/* scale ticks */}
      <g className="dg-tick">
        {[0, 1, 2, 3, 4, 5, 6].map((m) => <text key={`xt${m}`} x={px(m)} y={Y0 + 20} textAnchor="middle">{m}</text>)}
        {[1, 2, 3, 4].map((m) => <text key={`yt${m}`} x={X0 - 12} y={py(m) + 4} textAnchor="end">{m}</text>)}
      </g>
      <text x={px(3)} y={Y0 + 42} textAnchor="middle" className="dg-muted">x — width (m)</text>
      <text x={X0 - 34} y={py(2)} textAnchor="middle" className="dg-muted" transform={`rotate(-90 ${X0 - 34} ${py(2)})`}>y — depth (m)</text>

      {/* captured items */}
      {ITEMS.map((it) => (
        <g key={it.n}>
          <circle cx={px(it.x)} cy={py(it.y)} r="11" className="dg-dot" />
          <text x={px(it.x)} y={py(it.y) + 4} textAnchor="middle" className="dg-dot-num">{it.n}</text>
        </g>
      ))}

      {/* legend */}
      <g>
        <rect x="500" y="92" width="232" height="168" rx="10" className="dg-panel" />
        {ITEMS.map((it, i) => (
          <g key={it.n} transform={`translate(518 ${118 + i * 42})`}>
            <circle cx="10" cy="-4" r="10" className="dg-dot" />
            <text x="10" y="0" textAnchor="middle" className="dg-dot-num">{it.n}</text>
            <text x="30" y="-7" className="dg-label">{it.label}</text>
            <text x="30" y="9" className="dg-mono">{it.coord}</text>
          </g>
        ))}
        <text x="518" y="242" className="dg-muted">z = height above the floor</text>
      </g>

      <text x="380" y="398" textAnchor="middle" className="dg-foot">
        The first LiDAR scan fixes the origin and axes — everything captured later uses the same numbers.
      </text>

      <defs>
        <marker id="dgArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" className="dg-arrowhead" />
        </marker>
      </defs>
    </svg>
  )
}
