import React from 'react';

const GREEN = '#206B31';
const ORANGE = '#D4870E';
const RED = '#C0392B';

type Level = {
  label: string;
  range: string;
  /** Fraction of the arc to fill (0–1) */
  fill: number;
  color: string;
};

const levels: Level[] = [
  { label: 'Poor',      range: '0 – 2.9',   fill: 0.25, color: RED },
  { label: 'Fair',      range: '3.0 – 3.5',  fill: 0.50, color: ORANGE },
  { label: 'Good',      range: '3.6 – 4.5',  fill: 0.75, color: GREEN },
  { label: 'Excellent', range: '4.6 – 5.0',  fill: 1.0,  color: GREEN },
];

function ArcGauge({ fill, color, size = 48 }: { fill: number; color: string; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc spans 240° (from 150° to 390°)
  const startAngle = 150;
  const totalArc = 240;
  const endAngle = startAngle + totalArc * fill;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const pointOnArc = (deg: number) => ({
    x: cx + radius * Math.cos(toRad(deg)),
    y: cy + radius * Math.sin(toRad(deg)),
  });

  const bgStart = pointOnArc(startAngle);
  const bgEnd = pointOnArc(startAngle + totalArc);
  const bgLargeArc = totalArc > 180 ? 1 : 0;
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${bgLargeArc} 1 ${bgEnd.x} ${bgEnd.y}`;

  const fillArc = totalArc * fill;
  const fStart = pointOnArc(startAngle);
  const fEnd = pointOnArc(endAngle);
  const fLargeArc = fillArc > 180 ? 1 : 0;
  const fillPath = `M ${fStart.x} ${fStart.y} A ${radius} ${radius} 0 ${fLargeArc} 1 ${fEnd.x} ${fEnd.y}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={bgPath} fill="none" stroke="#E5E5E5" strokeWidth={stroke} strokeLinecap="round" />
      <path d={fillPath} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
}

export default function MosScaleVisual() {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
      margin: '1.5rem 0',
      padding: '1rem 1.5rem',
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #E5E5D5',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    }}>
      {levels.map((level) => (
        <div key={level.label} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 0.75rem',
        }}>
          <ArcGauge fill={level.fill} color={level.color} size={40} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
            <span style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: level.color,
              fontFamily: 'var(--ifm-font-family-base)',
            }}>
              {level.label}
            </span>
            <span style={{
              fontSize: '0.78rem',
              color: '#666',
              fontFamily: 'var(--ifm-font-family-base)',
            }}>
              {level.range}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
