import type { ReactNode } from 'react'
import { NOISE_BAND_OFFSET_DB, ROOM_CLASSES, SNR_CLEAN_DB, SNR_GATE_DB, SNR_RELIABLE_DB, SNR_T30_DB } from './lib/constants'
import { EXAMPLES } from './lib/examples'
import { score } from './lib/scoring'
import { SOURCES } from './lib/sources'
import type { Room } from './lib/types'
import { Working } from './Working'
import styles from './styles.module.css'

export { Tex } from './Tex'

const WORKED: Room = { class_key: 'meeting', area_m2: 35, height_m: 2.8, noise_floor_db: 35, tier: 'reliable', usage: 'A3', rt_override_s: null }

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function TierTable() {
  return (
    <Table
      head={['Tier', 'SNR', 'Below it']}
      rows={[
        ['Minimum', `${SNR_GATE_DB} dB`, 'no reverberation time; the app asks for a re-record'],
        ['Works', `${SNR_RELIABLE_DB} dB`, 'no margin: a few dB less and the measurement fails'],
        ['No noise warning', `${SNR_CLEAN_DB} dB`, '"close to noise floor" warning'],
        ['T30 available', `${SNR_T30_DB} dB`, 'no T30'],
      ]}
    />
  )
}

export function NoiseOffsetTable() {
  const bands = Object.keys(NOISE_BAND_OFFSET_DB)
  return (
    <Table
      head={['Band', ...bands.map((f) => (Number(f) >= 1000 ? `${Number(f) / 1000} kHz` : `${f} Hz`))]}
      rows={[['ΔN (dB)', ...Object.values(NOISE_BAND_OFFSET_DB).map((v) => v.toFixed(1))]]}
    />
  )
}

export function RoomPresetTable() {
  return (
    <Table
      head={['Class', 'People', 'Area', 'Height', 'Volume', 'Far corner']}
      rows={ROOM_CLASSES.map((c) => [c.label, c.people, `${c.area_m2} m²`, `${c.height_m} m`, `${(c.area_m2 * c.height_m).toFixed(0)} m³`, `${Math.sqrt(c.area_m2 / 2).toFixed(1)} m`])}
    />
  )
}

export function WorkedExample() {
  const w = score(EXAMPLES[0].speaker, WORKED)
  return (
    <div className={styles.root} style={{ margin: '1rem 0' }}>
      <p>
        <strong>{w.speaker.name}</strong> in a {ROOM_CLASSES.find((c) => c.key === WORKED.class_key)!.label.toLowerCase()}, {WORKED.area_m2} m², {WORKED.noise_floor_db} dB(A),
        28 dB line.
      </p>
      <Working trace={w.trace} />
    </div>
  )
}

export function SourcesList() {
  return (
    <ol>
      {SOURCES.map((s) => (
        <li key={s.id} style={{ marginBottom: '1rem' }}>
          <strong>{s.citation}</strong>
          <br />
          <span style={{ fontSize: '0.9em' }}>{s.what}</span>
          {s.url && (
            <>
              <br />
              <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85em', wordBreak: 'break-all' }}>
                {s.url}
              </a>
            </>
          )}
        </li>
      ))}
    </ol>
  )
}

// Constants the engine gains with the full-result criterion. Read through the namespace so the page renders
// on either engine version; a missing value shows as a dash instead of breaking the build.
import * as C from './lib/constants'
const K = C as unknown as Record<string, unknown>

function num(v: unknown, digits = 1): string {
  return typeof v === 'number' && Number.isFinite(v) ? Math.abs(v).toFixed(digits) : '—'
}
export function MaxVolume() {
  return <>{num(K.MAX_VOLUME_M3, 0)} m³</>
}
