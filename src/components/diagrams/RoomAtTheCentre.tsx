import React from 'react'

/**
 * Organisation and Location drawn as frames around the Room, because that is the
 * relationship: the outer levels exist to hold rooms, and the room is the only
 * level where anything is captured. Colours come from the .bmr-diagram palette.
 */
const HOLDS = ['3D scan + AR World Map', 'Markers', 'Acoustic measurements', 'Designs']

export default function RoomAtTheCentre() {
  return (
    <svg viewBox="0 0 760 400" className="bmr-diagram" role="img"
      aria-label="An Organisation frame contains a Location frame, which contains three rooms. The middle room is highlighted and lists what it holds: 3D scan and AR World Map, markers, acoustic measurements, and designs. The outer levels exist to hold rooms.">
      <text x="380" y="32" textAnchor="middle" className="dg-title">It all comes down to the room</text>

      {/* Organisation frame */}
      <rect x="30" y="52" width="700" height="292" rx="16" className="dg-frame" />
      <text x="52" y="78" className="dg-frame-label">Organisation</text>

      {/* Location frame */}
      <rect x="64" y="94" width="632" height="228" rx="14" className="dg-frame dg-frame--inner" />
      <text x="86" y="120" className="dg-frame-label">Location</text>

      {/* Other rooms — present, but not the point of this picture */}
      <g className="dg-room-quiet">
        <rect x="92" y="170" width="120" height="112" rx="10" />
        <text x="152" y="230" textAnchor="middle">Room</text>
      </g>
      <g className="dg-room-quiet">
        <rect x="564" y="170" width="120" height="112" rx="10" />
        <text x="624" y="230" textAnchor="middle">Room</text>
      </g>

      {/* The room */}
      <rect x="248" y="140" width="280" height="172" rx="12" className="dg-room-focus" />
      <text x="388" y="170" textAnchor="middle" className="dg-room-focus-title">Room</text>
      {HOLDS.map((h, i) => (
        <g key={h}>
          <rect x="268" y={184 + i * 30} width="240" height="24" rx="12" className="dg-room-pill" />
          <text x="388" y={200 + i * 30} textAnchor="middle" className="dg-room-pill-text">{h}</text>
        </g>
      ))}

      <text x="380" y="370" textAnchor="middle" className="dg-foot">
        Organisations and locations group and summarise. The room is where every capture lives.
      </text>
    </svg>
  )
}
