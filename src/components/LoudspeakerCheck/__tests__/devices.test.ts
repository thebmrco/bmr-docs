/// <reference types="node" />
/**
 * Real datasheets through the engine, entered the way a customer would: what is published, and "not stated"
 * ticked where the distance is missing. Every result must hold the shared invariants; the expectations below
 * are what the datasheets themselves imply.
 */
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DERIVED_SENSITIVITY_DB_W_M, DERIVED_SENSITIVITY_SPREAD_DB } from '../lib/constants'
import { EXAMPLES } from '../lib/examples'
import { score } from '../lib/scoring'
import type { Room, Speaker } from '../lib/types'
import { DEVICES, type DeviceSheet } from './fixtures/devices'
import { checkInvariants } from './invariants'

function asEntered(d: DeviceSheet): Speaker {
  return {
    ...EXAMPLES[0].speaker,
    name: d.name,
    spl_peak_db: d.spl_db,
    spl_ref_distance_m: d.spl_ref_m ?? 1,
    spl_ref_distance_stated: d.spl_ref_m !== null,
    freq_low_hz: d.freq_low_hz ?? 0,
    freq_high_hz: d.freq_high_hz ?? 0,
    power_watt: d.power_w,
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

  it('gives a room size exactly when the datasheet publishes a level or a wattage', () => {
    for (const d of DEVICES) {
      const r = score(asEntered(d), ROOMS[1])
      expect(r.headline === 'No room size').toBe(d.spl_db === null && d.power_w === null)
    }
  })

  /**
   * The saved query behind DERIVED_SENSITIVITY_DB_W_M. It is not a driver sensitivity: it is what a finished
   * loudspeaker reaches per watt, read off every datasheet here that publishes a maximum level, the distance it
   * was measured at and a wattage. An assumed driver sensitivity of 80 dB/W/m sized such loudspeakers about 8 dB
   * too high against BMR's own recordings, which is why the constant is read off datasheets and not guessed.
   *
   * One published figure counts once. Logitech prints the identical 99 dB / 0.5 m / 8 W for the Rally Bar and the
   * Rally Bar Mini, so it is one observation; counting it twice would put a manufacturer's copy-paste into the
   * constant. The rule is on the triple, not on a list of names, so a new datasheet cannot be dropped silently.
   */
  it('takes the level per watt from the datasheets that publish both, and its spread with it', () => {
    // A level published without its distance would enter the fit at an assumed 1 m, which is the one thing
    // sigma exists to stop. The filter says so rather than leaving it to which datasheets happen to be here.
    const qualifying = [...DEVICES.map(asEntered), ...EXAMPLES.map((e) => e.speaker)].filter(
      (s) => s.spl_peak_db !== null && s.spl_ref_distance_stated && s.power_watt,
    )
    const byFigure = new Map<string, { name: string; dbw: number }>()
    for (const s of qualifying) {
      const key = `${s.spl_peak_db}@${s.spl_ref_distance_m}/${s.power_watt}`
      if (!byFigure.has(key)) {
        byFigure.set(key, { name: s.name, dbw: s.spl_peak_db! + 20 * Math.log10(s.spl_ref_distance_m) - 10 * Math.log10(s.power_watt!) })
      }
    }
    expect(qualifying).toHaveLength(6) // both Rally Bars, and the Cisco bars publish no wattage
    expect([...byFigure.values()].map((p) => p.name).sort()).toEqual([
      'Beosound A1 2nd Gen',
      'Beosound Explore',
      'Logitech Rally Bar',
      'Marshall Middleton',
      'Teufel MYND',
    ])

    const v = [...byFigure.values()].map((p) => p.dbw).sort((a, b) => a - b)
    const median = v[(v.length - 1) / 2]
    const mean = v.reduce((a, b) => a + b, 0) / v.length
    const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (v.length - 1))
    expect(median).toBeCloseTo(DERIVED_SENSITIVITY_DB_W_M, 1)
    expect(sd).toBeCloseTo(DERIVED_SENSITIVITY_SPREAD_DB, 1)
    // Three of the five are 60 W devices: the wattage term is anchored, not tested. Say so where it is used.
    expect(v[v.length - 1] - v[0]).toBeGreaterThan(10)
  })

  it('still answers the frequency question with neither a level nor a wattage', () => {
    const d = DEVICES.find((x) => x.id === 'jabra-panacast-50')!
    expect([d.spl_db, d.power_w]).toEqual([null, null])
    const r = score(asEntered(d), ROOMS[1])
    expect(r.headline).toBe('No room size')
    expect(r.light).toBe('yellow')
    expect(r.bands.filter((b) => b.covered).length).toBeGreaterThan(0)
  })

  it('separates a 7 W portable from a 70 W one, as the wattage does', () => {
    const at = (w: number) => score({ ...EXAMPLES[0].speaker, spl_peak_db: null, power_watt: w, freq_low_hz: 50, freq_high_hz: 20000 }, ROOMS[1])
    expect(at(70).sweep_level_1m_db - at(7).sweep_level_1m_db).toBeCloseTo(10, 6)
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
