/**
 * Stress test: many synthetic loudspeakers and rooms, plus extreme inputs, checked against invariants
 * the engine must hold whatever it is given. Seeded, so a failure reproduces.
 *
 * What it guards: NaN / Infinity reaching the page, a formula KaTeX cannot render, a headline that
 * contradicts the room check, room sizes that are not monotonic in noise or in the tier, and
 * statuses that disagree with their own margins.
 */
import { describe, expect, it } from 'vitest'
import { AREA_SEARCH_MAX_M2, TIERS } from '../lib/constants'
import { EXAMPLES } from '../lib/examples'
import { maxAreaM2, score } from '../lib/scoring'
import type { Room, Speaker } from '../lib/types'
import { checkInvariants } from './invariants'

function prng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const TEMPLATE = EXAMPLES[0].speaker

function synthSpeaker(r: () => number): Speaker {
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]
  const hasLevel = r() > 0.25
  return {
    ...TEMPLATE,
    name: 'synthetic',
    spl_peak_db: hasLevel ? Math.round(70 + r() * 45) : null,
    spl_ref_distance_m: pick([0.5, 1, 1, 2]),
    spl_ref_distance_stated: r() > 0.3,
    freq_low_hz: pick([20, 40, 52, 60, 80, 88, 95, 120, 150, 400]),
    freq_high_hz: pick([8000, 11000, 12000, 14000, 16000, 20000, 24000]),
    power_watt: hasLevel ? pick([null, 10, 40]) : pick([5, 10, 30, 60, 100, 200]),
    sensitivity_db_1w_1m: hasLevel ? null : Math.round(74 + r() * 16),
    sensitivity_estimated: r() > 0.5,
    woofer_mm: pick([null, 40, 58, 90, 130]),
    connection: pick(['bluetooth', 'wired', 'both', 'unknown'] as const),
  }
}

function synthRoom(r: () => number): Room {
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]
  return {
    class_key: 'custom',
    area_m2: pick([5, 10, 25, 35, 60, 100, 200, 400]),
    height_m: pick([2.3, 2.8, 3.5, 6]),
    noise_floor_db: pick([20, 25, 30, 35, 40, 45, 55]),
    tier: pick(['compatible', 'reliable', 'clean', 't30'] as const),
    usage: pick(['A2', 'A3', 'A4']),
    rt_override_s: pick([null, null, 0.3, 0.8, 1.5]),
  }
}

describe('fleet: 600 synthetic loudspeakers in synthetic rooms', () => {
  const r = prng(20260915)
  const cases = Array.from({ length: 600 }, () => [synthSpeaker(r), synthRoom(r)] as const)

  it('holds every invariant', () => {
    for (const [s, room] of cases) checkInvariants(score(s, room))
  })

  it('never lets more background noise enlarge the rooms it covers', () => {
    for (const [s, room] of cases.slice(0, 150)) {
      const quiet = score(s, room)
      const loud = score(s, { ...room, noise_floor_db: room.noise_floor_db + 3 })
      for (let i = 0; i < TIERS.length; i++) expect(loud.tiers[i].max_area_m2).toBeLessThanOrEqual(quiet.tiers[i].max_area_m2)
    }
  })

  it('never lets a louder loudspeaker shrink the rooms it covers', () => {
    for (const [s, room] of cases.slice(0, 150)) {
      if (s.spl_peak_db === null) continue
      const a = score(s, room)
      const b = score({ ...s, spl_peak_db: s.spl_peak_db + 3 }, room)
      for (let i = 0; i < TIERS.length; i++) expect(b.tiers[i].max_area_m2).toBeGreaterThanOrEqual(a.tiers[i].max_area_m2)
    }
  })
})

describe('fleet: the largest room is a boundary, not just a safe bound', () => {
  it('passes at the stated size and fails 5 m² above it', () => {
    const r = prng(7)
    let checked = 0
    for (let n = 0; n < 300 && checked < 80; n++) {
      const s = synthSpeaker(r)
      const room = { ...synthRoom(r), rt_override_s: null }
      const res = score(s, room)
      if (!Number.isFinite(res.spl_at_1m_db)) continue
      for (const t of res.tiers) {
        if (t.max_area_m2 < 10 || t.max_area_m2 >= AREA_SEARCH_MAX_M2 - 10) continue
        const at = score(s, { ...room, tier: t.key, area_m2: t.max_area_m2 })
        const above = score(s, { ...room, tier: t.key, area_m2: t.max_area_m2 + 5 })
        expect(at.margin_db).toBeGreaterThanOrEqual(-1e-6)
        expect(above.margin_db).toBeLessThan(0)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(40)
  })
})

describe('fleet: extreme inputs', () => {
  const room: Room = { class_key: 'custom', area_m2: 35, height_m: 2.8, noise_floor_db: 35, tier: 'reliable', usage: 'A3', rt_override_s: null }
  const s = TEMPLATE
  const extremes: [string, Speaker, Room][] = [
    ['very loud', { ...s, spl_peak_db: 150 }, room],
    ['very quiet', { ...s, spl_peak_db: 40 }, room],
    ['reference distance 1 cm', { ...s, spl_ref_distance_m: 0.01 }, room],
    ['reference distance 10 m', { ...s, spl_ref_distance_m: 10 }, room],
    ['tiny room', s, { ...room, area_m2: 1 }],
    ['huge room', s, { ...room, area_m2: 5000, height_m: 12 }],
    ['silent room', s, { ...room, noise_floor_db: 0 }],
    ['very noisy room', s, { ...room, noise_floor_db: 80 }],
    ['almost anechoic', s, { ...room, rt_override_s: 0.05 }],
    ['very reverberant', s, { ...room, rt_override_s: 5 }],
    ['sport hall usage', s, { ...room, usage: 'A5' }],
    ['unknown usage', s, { ...room, usage: 'X9' }],
    ['tiny room at sport-hall usage', s, { ...room, area_m2: 2, height_m: 2.3, usage: 'A5' }],
    ['no frequency range', { ...s, freq_low_hz: 0, freq_high_hz: 0 }, room],
    ['inverted frequency range', { ...s, freq_low_hz: 20000, freq_high_hz: 100 }, room],
    ['no level at all', { ...s, spl_peak_db: null, sensitivity_db_1w_1m: null, power_watt: null }, room],
    ['zero watts', { ...s, spl_peak_db: null, sensitivity_db_1w_1m: 85, power_watt: 0 }, room],
  ]

  for (const [name, sp, rm] of extremes) {
    it(`survives: ${name}`, () => checkInvariants(score(sp, rm)))
  }

  it('flags an unknown usage type and a very long reverberation time', () => {
    expect(score(s, { ...room, usage: 'X9' }).caveats.some((c) => c.id === 'unknown_usage')).toBe(true)
    expect(score(s, { ...room, rt_override_s: 2 }).caveats.some((c) => c.id === 'long_rt')).toBe(true)
  })

  it('caps the search at its maximum instead of looping', () => {
    expect(maxAreaM2(200, 0, 25, 2.8)).toBe(AREA_SEARCH_MAX_M2)
  })
})
