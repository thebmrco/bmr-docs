import React from 'react';

// Rating colors — matched to the MOS score circle shown in BMR Mobile.
const ORANGE = '#C2571E'; // Poor
const GOLD = '#C79A1E'; // Fair
const GREEN_DARK = '#2E6B3E'; // Good
const GREEN = '#3E9E55'; // Excellent

type Level = {
  label: string;
  range: string;
  /** Fraction of the ring to fill (0–1) */
  fill: number;
  color: string;
};

const levels: Level[] = [
  { label: 'Poor',      range: '0 – 2.9',   fill: 0.25, color: ORANGE },
  { label: 'Fair',      range: '3.0 – 3.5', fill: 0.50, color: GOLD },
  { label: 'Good',      range: '3.6 – 4.5', fill: 0.75, color: GREEN_DARK },
  { label: 'Excellent', range: '4.6 – 5.0', fill: 1.0,  color: GREEN },
];

/** A full 360° ring, filled clockwise from the top — matching the app's MOS score circle. */
function RingGauge({ fill, color, size = 40 }: { fill: number; color: string; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, fill));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden="true">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E5E5E5" strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
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
          <RingGauge fill={level.fill} color={level.color} size={40} />
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
