/// <reference types="node" />
/**
 * Real datasheets through the engine, entered the way a customer would: what is published, "not stated"
 * ticked where the distance is missing, and — where only watts are published — the estimated-sensitivity
 * path the form offers. Every result must hold the shared invariants; the expectations below are what
 * the datasheets themselves imply.
 */
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { EXAMPLES } from '../lib/examples'
import { score } from '../lib/scoring'
import type { Room, Speaker } from '../lib/types'
import { DEVICES, type DeviceSheet } from './fixtures/devices'
import { checkInvariants } from './invariants'

/** The form's own default for a guessed sensitivity when only watts are published. */
const ESTIMATED_SENSITIVITY_DB = 80

function asEntered(d: DeviceSheet): Speaker {
  const onlyWatts = d.spl_db === null && d.power_w !== null
  return {
    ...EXAMPLES[0].speaker,
    name: d.name,
    spl_peak_db: d.spl_db,
    spl_ref_distance_m: d.spl_ref_m ?? 1,
    spl_ref_distance_stated: d.spl_ref_m !== null,
    freq_low_hz: d.freq_low_hz ?? 0,
    freq_high_hz: d.freq_high_hz ?? 0,
    power_watt: d.power_w,
    power_mode: d.category === 'portable' ? 'battery' : 'mains',
    sensitivity_db_1w_1m: d.sensitivity_db ?? (onlyWatts ? ESTIMATED_SENSITIVITY_DB : null),
    sensitivity_estimated: d.sensitivity_db === null && onlyWatts,
    woofer_mm: d.woofer_mm,
    connection: d.category === 'portable' ? 'bluetooth' : 'wired',
  }
}

const ROOMS: Room[] = [25, 35, 60, 100].flatMap((area) =>
  [30, 35, 40].map((noise) => ({ class_key: 'custom', area_m2: area, height_m: 2.8, noise_floor_db: noise, tier: 'reliable' as const, usage: 'A3', rt_override_s: null })),
)

describe('real datasheets', () => {
  for (const d of DEVICES) {
    it(`${d.name}: holds every invariant in ${ROOMS.length} rooms`, () => {
      for (const room of ROOMS) checkInvariants(score(asEntered(d), room))
    })
  }

  it('says "not enough information" only when neither a level nor watts are published', () => {
    for (const d of DEVICES) {
      const r = score(asEntered(d), ROOMS[1])
      const noInput = d.spl_db === null && d.power_w === null
      expect(r.headline === 'Not enough information').toBe(noInput)
    }
  })

  it('never calls a missing frequency range "does not work"', () => {
    for (const d of DEVICES.filter((x) => x.freq_low_hz === null || x.freq_high_hz === null)) {
      const r = score(asEntered(d), ROOMS[1])
      expect(r.headline).not.toBe('Does not work')
      if (Number.isFinite(r.spl_at_1m_db)) expect(r.caveats.some((c) => c.id === 'freq_unknown')).toBe(true)
    }
  })

  it('carries the missing-distance doubt for every level published without a distance', () => {
    for (const d of DEVICES.filter((x) => x.spl_db !== null && x.spl_ref_m === null)) {
      expect(score(asEntered(d), ROOMS[1]).margin_uncertainty_db).toBeCloseTo(3, 9)
    }
  })

  it('keeps the 125 Hz band, weaker, for room systems rated from 100 Hz, and in full for 70 Hz', () => {
    // A ±3 dB point is not a cutoff. BMR measurements: the Room Kit EQ, rated 100 Hz – 20 kHz, measured 23.7–33.7 dB
    // SNR at 125 Hz against 0.3–3.2 dB at 63 Hz (BMR measurement records, 2026-09-15).
    const band125 = (id: string) => score(asEntered(DEVICES.find((x) => x.id === id)!), ROOMS[1]).bands[0]
    for (const id of ['cisco-room-bar', 'cisco-room-kit-eq']) {
      expect(band125(id).covered).toBe(true)
      expect(band125(id).partial).toBe(true)
    }
    expect(band125('cisco-room-bar-pro')).toMatchObject({ covered: true, partial: false })
  })

  it('ranks by published level: Room Bar Pro ≥ Room Bar ≥ Room Kit EQ', () => {
    const area = (id: string) => score(asEntered(DEVICES.find((x) => x.id === id)!), ROOMS[1]).tiers.find((t) => t.key === 'reliable')!.max_area_m2
    expect(area('cisco-room-bar-pro')).toBeGreaterThanOrEqual(area('cisco-room-bar'))
    expect(area('cisco-room-bar')).toBeGreaterThanOrEqual(area('cisco-room-kit-eq'))
  })

  it('writes the answers for review when REPORT_OUT is set', () => {
    const out = process.env.REPORT_OUT
    if (!out) return
    const rows = DEVICES.map((d) => {
      const r = score(asEntered(d), ROOMS[1])
      const t = r.tiers
      return `| ${d.name} | ${r.light} | ${r.headline} | ${Number.isFinite(r.spl_at_1m_db) ? r.spl_at_1m_db.toFixed(1) : '—'} | ±${r.margin_uncertainty_db.toFixed(0)} | ${t.map((x) => x.max_area_m2).join(' / ')} | ${r.bands.filter((b) => !b.covered).map((b) => b.centre_hz).join(', ') || '—'} | ${r.caveats.map((c) => c.id).join(', ')} |`
    })
    writeFileSync(out, ['| device | light | headline | L1m | σ | area C / R / T30 | missing bands | caveats |', '|---|---|---|---|---|---|---|---|', ...rows].join('\n'))
  })
})
