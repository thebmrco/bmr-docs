/**
 * The named illustrations. Each scene is one idea, drawn from the parts in
 * parts.tsx. Small scenes use a 160 × 110 canvas; the two homepage scenes
 * ("field-work", "admin-work") use 320 × 170.
 *
 * To add one: draw it here from existing parts, give it a short kebab-case
 * name and an accessible label, and it appears in the gallery at
 * /docs/contributing/illustrations.
 */
import React, {type ReactNode} from 'react';
import {
  C, Phone, PhoneLandscape, Laptop, RoomView, ScanFrame, Pin, Speaker, Waves,
  Ring, Box3D, CheckBadge, Person, CutTile, TextLine,
} from './parts';

export type Scene = {label: string; wide?: boolean; draw: () => ReactNode};

export const Scenes: Record<string, Scene> = {
  /* ---------- Field work: on site with BMR Mobile ---------- */

  'find-room': {
    label: 'A phone listing rooms, one selected',
    draw: () => (
      <Phone x={58} y={5}>
        <rect x="3" y="7" width="30" height="8" rx="4" fill="#fff" />
        <circle cx="8" cy="11" r="2" fill="none" stroke={C.mid} strokeWidth="1.2" />
        {[23, 37, 51, 65].map((y) => (
          <rect key={y} x="3" y={y} width="30" height="10" rx="2" fill={y === 37 ? C.brand : '#fff'} />
        ))}
      </Phone>
    ),
  },
  scan: {
    label: 'A phone scanning a meeting room',
    draw: () => (
      <Phone x={58} y={5}>
        <RoomView w={36} h={92} />
        <ScanFrame x={5} y={23} w={26} h={30} />
      </Phone>
    ),
  },
  markers: {
    label: 'A phone showing a room with marker pins on the walls',
    draw: () => (
      <>
        <Phone x={58} y={5}>
          <RoomView w={36} h={92} table={false} />
          <Pin x={5} y={46} size={0.5} />
          <Pin x={18} y={40} size={0.5} />
          <Pin x={31} y={50} size={0.5} />
        </Phone>
        <Pin x={127} y={45} />
      </>
    ),
  },
  'save-scan': {
    label: 'A phone showing the finished 3D scan with a save button',
    draw: () => (
      <Phone x={58} y={5}>
        <Box3D x={18} y={22} s={14} />
        <rect x="4" y="73" width="28" height="11" rx="5.5" fill={C.brand} />
        <path d="M13 78.5 l3 3 l6 -6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Phone>
    ),
  },
  acoustics: {
    label: 'A speaker playing sound towards a phone that is measuring',
    draw: () => (
      <>
        <Phone x={40} y={5}>
          <Ring cx={18} cy={35} r={12} value={0.75} />
          <TextLine x={4} y={57} w={28} />
          <TextLine x={4} y={65} w={20} />
        </Phone>
        <Waves x={108} y={55} />
        <Speaker x={114} y={35} />
      </>
    ),
  },
  'room-photo': {
    label: 'A phone held sideways, photographing the whole room',
    draw: () => (
      <PhoneLandscape x={30} y={27}>
        <RoomView w={92} h={48} />
        <circle cx="86" cy="24" r="4.5" fill="#fff" />
      </PhoneLandscape>
    ),
  },
  'ar-design': {
    label: 'A phone placing a piece of equipment into the room in AR',
    draw: () => (
      <>
        <Phone x={58} y={5}>
          <RoomView w={36} h={92} table={false} />
          <Box3D x={18} y={42} s={11} />
        </Phone>
        <CheckBadge cx={120} cy={40} />
      </>
    ),
  },
  account: {
    label: 'A phone showing a sign-in screen',
    draw: () => (
      <Phone x={58} y={5}>
        <circle cx="18" cy="22" r="8" fill={C.light} />
        <rect x="4" y="40" width="28" height="8" rx="2" fill="#fff" />
        <rect x="4" y="52" width="28" height="8" rx="2" fill="#fff" />
        <rect x="4" y="66" width="28" height="9" rx="4.5" fill={C.brand} />
      </Phone>
    ),
  },

  /* ---------- Manage & Design: on the web ---------- */

  'room-state': {
    label: 'A laptop listing rooms with a status each, one flagged',
    draw: () => (
      <Laptop x={20} y={10}>
        <rect width="112" height="8" fill={C.brand} />
        {[16, 28, 40, 52].map((y, i) => {
          const flagged = i === 2;
          return (
            <g key={y}>
              <rect x="6" y={y} width="100" height="9" rx="1.5" fill={flagged ? C.warnWash : C.paper} />
              <TextLine x={12} y={y + 2.5} w={[44, 36, 50, 30][i]} color={flagged ? '#E9A27C' : C.grey} />
              <circle cx="98" cy={y + 4.5} r="3" fill={flagged ? C.warn : C.mid} />
            </g>
          );
        })}
      </Laptop>
    ),
  },
  analyse: {
    label: 'A laptop showing acoustic results: a sound decaying over time, and reverberation per frequency against its target band, one frequency too high',
    draw: () => {
      // A sound dying away: a sine wave whose amplitude decays, as in an RT60 measurement.
      const wave = Array.from({length: 61}, (_, i) => {
        const x = 8 + i * 1.6;
        const y = 22 - 10 * Math.exp(-i / 11) * Math.sin(i * 0.9);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(' ');
      // Reverberation per frequency band against the target (tolerance) band.
      const xs = [14, 31, 48, 65, 82, 99];
      const ys = [50, 47, 45, 37, 46, 48];
      return (
        <Laptop x={20} y={10}>
          <rect width="112" height="8" fill={C.brand} />
          <path d={wave} fill="none" stroke={C.mid} strokeWidth="1.6" strokeLinejoin="round" />
          <polygon points="8,40 104,42 104,54 8,52" fill={C.light} opacity="0.75" />
          <rect x="8" y="60" width="96" height="1" fill={C.grey} />
          <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(' ')} fill="none" stroke={C.dark} strokeWidth="1.6" />
          {xs.map((x, i) => (
            <circle key={x} cx={x} cy={ys[i]} r="2.6" fill={i === 3 ? C.warn : C.dark} />
          ))}
        </Laptop>
      );
    },
  },
  'design-studio': {
    label: 'A laptop showing a 3D room design',
    draw: () => (
      <Laptop x={20} y={10}>
        <polygon points="56,14 92,32 56,50 20,32" fill={C.wash} />
        <polygon points="20,32 56,14 56,4 20,22" fill={C.light} />
        <polygon points="56,14 92,32 92,22 56,4" fill={C.mid} />
        <polygon points="68,9 80,15 80,10 68,4" fill={C.bezel} />
        <Box3D x={56} y={26} s={10} />
      </Laptop>
    ),
  },
  organise: {
    label: 'An organisation holding locations, each holding rooms',
    draw: () => (
      <>
        <path d="M80 30 V42 M48 42 H112 M48 42 V54 M112 42 V54 M48 72 V80 M30 80 H66 M30 80 V86 M66 80 V86 M112 72 V80 M94 80 H130 M94 80 V86 M130 80 V86"
          fill="none" stroke={C.grey} strokeWidth="2" />
        <CutTile x={64} y={8} w={32} h={22} />
        <CutTile x={34} y={54} w={28} h={18} fill={C.mid} />
        <CutTile x={98} y={54} w={28} h={18} fill={C.mid} />
        {[22, 58, 86, 122].map((x) => (
          <CutTile key={x} x={x} y={86} w={16} h={14} cut={4} fill={C.light} />
        ))}
      </>
    ),
  },
  invite: {
    label: 'Two people, one being invited',
    draw: () => (
      <>
        <Person x={52} y={34} color={C.brand} />
        <Person x={84} y={40} color={C.light} />
        <circle cx="110" cy="40" r="10" fill={C.mid} />
        <path d="M110 34 v12 M104 40 h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
  deploy: {
    label: 'A finished room design marked as installed',
    draw: () => (
      <>
        <polygon points="76,34 120,56 76,78 32,56" fill={C.wash} />
        <polygon points="32,56 76,34 76,18 32,40" fill={C.light} />
        <polygon points="76,34 120,56 120,40 76,18" fill={C.mid} />
        <Box3D x={76} y={46} s={11} />
        <CheckBadge cx={126} cy={24} r={11} />
      </>
    ),
  },
  catalog: {
    label: 'A library of equipment as boxes',
    draw: () => (
      <>
        <Box3D x={58} y={44} s={16} />
        <Box3D x={102} y={44} s={16} />
        <Box3D x={80} y={16} s={16} />
      </>
    ),
  },
  integrations: {
    label: 'BMR connected to other services',
    draw: () => (
      <>
        <path d="M80 55 L36 28 M80 55 L124 28 M80 55 L80 92" stroke={C.grey} strokeWidth="2" />
        {[[24, 18], [112, 18], [68, 84]].map(([x, y]) => (
          <rect key={`${x}`} x={x} y={y} width="24" height="20" rx="4" fill={x === 68 ? C.mid : C.light} />
        ))}
        <CutTile x={66} y={42} w={28} h={26} />
      </>
    ),
  },
  security: {
    label: 'A shield with a tick',
    draw: () => (
      <>
        <path d="M80 12 L110 22 V50 C110 72 95 86 80 94 C65 86 50 72 50 50 V22 Z" fill={C.brand} />
        <path d="M80 12 L110 22 V50 C110 72 95 86 80 94 Z" fill={C.dark} />
        <path d="M68 52 l8 8 l16 -18" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },

  /* ---------- For everyone ---------- */

  updates: {
    label: 'A stack of release notes, the newest on top',
    draw: () => (
      <>
        <rect x="56" y="10" width="64" height="76" rx="4" fill={C.light} />
        <rect x="48" y="16" width="64" height="76" rx="4" fill={C.wash} />
        <rect x="40" y="22" width="64" height="76" rx="4" fill="#fff" stroke={C.grey} strokeWidth="1.5" />
        <CutTile x={48} y={30} w={26} h={10} cut={3} />
        <TextLine x={48} y={48} w={46} />
        <TextLine x={48} y={58} w={38} />
        <TextLine x={48} y={68} w={42} />
      </>
    ),
  },
  help: {
    label: 'A question in a speech bubble',
    draw: () => (
      <>
        <path d="M44 18 H116 a8 8 0 0 1 8 8 V66 a8 8 0 0 1 -8 8 H76 L60 90 V74 H44 a8 8 0 0 1 -8 -8 V26 a8 8 0 0 1 8 -8z" fill={C.brand} />
        <path d="M72 38 a8 8 0 1 1 12 7 c-3 2 -4 3 -4 7" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="80" cy="62" r="3" fill="#fff" />
      </>
    ),
  },

  /* ---------- Homepage: the two guides ---------- */

  'field-work': {
    label: 'A phone scanning a meeting room, with a loudspeaker playing towards it',
    wide: true,
    draw: () => (
      <>
        <Waves x={208} y={114} />
        <Speaker x={216} y={84} />
        <g transform="translate(100 10) scale(1.5)">
          <Phone>
            <RoomView w={36} h={92} />
            <ScanFrame x={5} y={23} w={26} h={30} />
          </Phone>
        </g>
      </>
    ),
  },
  'admin-work': {
    label: 'A laptop showing the state of every room: acoustic results with one frequency out of range, and a room list with one room flagged',
    wide: true,
    draw: () => (
      <g transform="translate(70 4) scale(1.5)">
        <Laptop>
          <rect width="112" height="8" fill={C.brand} />
          {/* the same acoustics chart as the "analyse" scene, smaller */}
          <path
            d={Array.from({length: 31}, (_, i) =>
              `${i === 0 ? 'M' : 'L'}${(6 + i * 1.1).toFixed(1)} ${(23 - 8 * Math.exp(-i / 6) * Math.sin(i * 0.9)).toFixed(1)}`,
            ).join(' ')}
            fill="none" stroke={C.mid} strokeWidth="1.3" strokeLinejoin="round"
          />
          <polygon points="6,38 40,39 40,49 6,48" fill={C.light} opacity="0.75" />
          <rect x="6" y="56" width="34" height="0.8" fill={C.grey} />
          <polyline points="9,45 17,43 25,34 33,44" fill="none" stroke={C.dark} strokeWidth="1.3" />
          {[[9, 45], [17, 43], [25, 34], [33, 44]].map(([x, y], i) => (
            <circle key={x} cx={x} cy={y} r="2" fill={i === 2 ? C.warn : C.dark} />
          ))}
          {[14, 26, 38, 50].map((y, i) => {
            const flagged = i === 2;
            return (
              <g key={y}>
                <rect x="46" y={y} width="60" height="9" rx="1.5" fill={flagged ? C.warnWash : C.paper} />
                <TextLine x={51} y={y + 2.5} w={[30, 24, 34, 20][i]} color={flagged ? '#E9A27C' : C.grey} />
                <circle cx="100" cy={y + 4.5} r="2.5" fill={flagged ? C.warn : C.mid} />
              </g>
            );
          })}
        </Laptop>
      </g>
    ),
  },
};

export const illustrationNames = Object.keys(Scenes);
