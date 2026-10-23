/**
 * Building blocks for BMR illustrations, in the design language of the BMR
 * presentation template: flat shapes, no outlines, three greens on an
 * off-white ground, devices with a near-black bezel.
 *
 * Every part is drawn at its own origin and placed with x/y, so scenes stay
 * short. Devices take children drawn in their screen's own coordinates:
 *   Phone           screen 36 × 92
 *   PhoneLandscape  screen 92 × 48
 *   Laptop          screen 112 × 66
 */
import React, {useId, type ReactNode} from 'react';

/** Template palette (theme "BMR Rooms"). Use these, not new colours. */
export const C = {
  paper: '#F3F5F0',
  wash: '#E4EEDD',
  light: '#BFE3AE',
  mid: '#4E9A58',
  dark: '#2E6B32',
  brand: '#206B31',
  ink: '#1F2A22',
  bezel: '#1C1C1E',
  silver: '#D5D8DC',
  silverShade: '#C3C7CC',
  grey: '#D9DDD5',
  warn: '#F45F0B',
  warnWash: '#FDE4D5',
};

function useClipId() {
  return 'clip' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

type At = {x?: number; y?: number};

/** A device screen: clip, ground colour, then the children on top. */
function Screen({w, h, rx, children}: {w: number; h: number; rx: number; children?: ReactNode}) {
  const id = useClipId();
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect width={w} height={h} rx={rx} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect width={w} height={h} fill={C.paper} />
        {children}
      </g>
    </>
  );
}

export function Phone({x = 0, y = 0, children}: At & {children?: ReactNode}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="44" height="100" rx="10" fill={C.bezel} />
      <g transform="translate(4 4)">
        <Screen w={36} h={92} rx={7}>{children}</Screen>
      </g>
    </g>
  );
}

export function PhoneLandscape({x = 0, y = 0, children}: At & {children?: ReactNode}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="100" height="56" rx="10" fill={C.bezel} />
      <g transform="translate(4 4)">
        <Screen w={92} h={48} rx={7}>{children}</Screen>
      </g>
    </g>
  );
}

export function Laptop({x = 0, y = 0, children}: At & {children?: ReactNode}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="120" height="74" rx="5" fill={C.bezel} />
      <g transform="translate(4 4)">
        <Screen w={112} h={66} rx={1}>
          <rect width="112" height="66" fill="#fff" />
          {children}
        </Screen>
      </g>
      <rect x="-10" y="74" width="140" height="6" rx="2" fill={C.silver} />
      <rect x="-10" y="77" width="140" height="3" rx="1.5" fill={C.silverShade} />
      <rect x="48" y="74" width="24" height="2" rx="1" fill="#9EA2A8" />
    </g>
  );
}

/** A meeting room seen through a camera, filling a w × h screen. */
export function RoomView({w, h, table = true}: {w: number; h: number; table?: boolean}) {
  const bx = w * 0.19, by = h * 0.27, bw = w * 0.62, bh = h * 0.29;
  const top = h * 0.16, low = h * 0.71, floorY = by + bh;
  const ty = floorY + (h - floorY) * 0.35, th = (h - floorY) * 0.25;
  return (
    <>
      <rect x={bx} y={by} width={bw} height={bh} fill={C.wash} />
      <polygon points={`0,${top} ${bx},${by} ${bx},${floorY} 0,${low}`} fill={C.light} />
      <polygon points={`${w},${top} ${bx + bw},${by} ${bx + bw},${floorY} ${w},${low}`} fill={C.light} />
      <polygon points={`${bx},${floorY} ${bx + bw},${floorY} ${w},${low} ${w},${h} 0,${h} 0,${low}`} fill={C.mid} />
      {table && (
        <polygon
          points={`${w * 0.3},${ty} ${w * 0.7},${ty} ${w * 0.78},${ty + th} ${w * 0.22},${ty + th}`}
          fill={C.dark}
        />
      )}
    </>
  );
}

/** Corner brackets around an area being scanned. */
export function ScanFrame({x, y, w, h, s = 6}: {x: number; y: number; w: number; h: number; s?: number}) {
  return (
    <path
      d={`M${x} ${y + s} v${-s} h${s} M${x + w - s} ${y} h${s} v${s} M${x + w} ${y + h - s} v${s} h${-s} M${x + s} ${y + h} h${-s} v${-s}`}
      fill="none" stroke={C.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  );
}

/** A map-style marker pin; its point is at (x, y). */
export function Pin({x, y, size = 1, color = C.brand}: {x: number; y: number; size?: number; color?: string}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path d="M0 0 c0 0 -9 -8 -9 -15 a9 9 0 0 1 18 0 c0 7 -9 15 -9 15z" fill={color} />
      <circle cx="0" cy="-15" r="3.5" fill="#fff" />
    </g>
  );
}

/** A portable loudspeaker, 20 × 40. */
export function Speaker({x = 0, y = 0}: At) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="20" height="40" rx="4" fill="#fff" stroke={C.grey} strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3.5" fill={C.bezel} />
      <circle cx="10" cy="27" r="7" fill={C.bezel} />
    </g>
  );
}

/** Sound waves leaving (x, y), opening to the left. */
export function Waves({x, y}: {x: number; y: number}) {
  return (
    <path
      d={`M${x} ${y - 9} q-6 9 0 18 M${x - 8} ${y - 15} q-11 15 0 30`}
      fill="none" stroke={C.brand} strokeWidth="3" strokeLinecap="round"
    />
  );
}

/** A score ring; value 0–1. */
export function Ring({cx, cy, r, value, width = 5}: {cx: number; cy: number; r: number; value: number; width?: number}) {
  const len = 2 * Math.PI * r;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.wash} strokeWidth={width} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.mid} strokeWidth={width}
        strokeDasharray={`${len * value} ${len}`} transform={`rotate(-90 ${cx} ${cy})`} />
    </>
  );
}

/** An isometric box (a scan, a product), centred on its top corner. */
export function Box3D({x, y, s = 14}: {x: number; y: number; s?: number}) {
  const h = s * 1.25;
  return (
    <>
      <polygon points={`${x},${y} ${x + s},${y + s * 0.55} ${x},${y + s * 1.1} ${x - s},${y + s * 0.55}`} fill={C.light} />
      <polygon points={`${x - s},${y + s * 0.55} ${x},${y + s * 1.1} ${x},${y + s * 1.1 + h} ${x - s},${y + s * 0.55 + h}`} fill={C.mid} />
      <polygon points={`${x + s},${y + s * 0.55} ${x},${y + s * 1.1} ${x},${y + s * 1.1 + h} ${x + s},${y + s * 0.55 + h}`} fill={C.dark} />
    </>
  );
}

/** A tick in a filled circle. */
export function CheckBadge({cx, cy, r = 9, color = C.brand}: {cx: number; cy: number; r?: number; color?: string}) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <path d={`M${cx - r * 0.42} ${cy} l${r * 0.3} ${r * 0.32} l${r * 0.55} ${-r * 0.6}`}
        fill="none" stroke="#fff" strokeWidth={r * 0.22} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** A person: head and shoulders, 24 wide. */
export function Person({x = 0, y = 0, color = C.mid}: At & {color?: string}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="12" cy="8" r="8" fill={color} />
      <path d="M0 34 a12 12 0 0 1 24 0z" fill={color} />
    </g>
  );
}

/** A tile with the logo's cut top-left corner. */
export function CutTile({x, y, w, h, cut = 6, fill = C.brand}: {x: number; y: number; w: number; h: number; cut?: number; fill?: string}) {
  return <polygon points={`${x + cut},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h} ${x},${y + cut}`} fill={fill} />;
}

/** A grey text line placeholder. */
export function TextLine({x, y, w, color = C.grey}: {x: number; y: number; w: number; color?: string}) {
  return <rect x={x} y={y} width={w} height="4" rx="2" fill={color} />;
}

/**
 * The template's corner facets. Place absolutely behind content; it fills
 * its box and stays anchored to the right edge.
 */
export function Facets({className}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 320 180" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <polygon points="133,0 320,0 320,99" fill={C.light} />
      <polygon points="275,76 320,99 214,180" fill={C.mid} />
      <polygon points="320,99 320,180 214,180" fill={C.dark} />
    </svg>
  );
}
