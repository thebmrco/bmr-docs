/** Invariants every result must hold, shared by the fleet and the real-device tests. */
import katex from 'katex'
import { expect } from 'vitest'
import { MAX_VOLUME_M3 } from '../lib/constants'
import { lineTex } from '../lib/trace'
import type { Result } from '../lib/types'

const TEXT_FIELDS = (x: Result) => [x.headline, x.headline_text, x.headline_range, x.room_verdict, x.room_recommendation, ...x.caveats.map((c) => c.text)]

export function checkInvariants(x: Result) {
  // Text never shows a broken number.
  for (const t of TEXT_FIELDS(x)) expect(t).not.toMatch(/NaN|undefined|Infinity/)

  // Every line of the working renders, and none of the steps that lead to the verdict has gone missing
  // (a refactor once dropped the margin line and 65 tests stayed green).
  for (const line of x.trace) expect(() => katex.renderToString(lineTex(line), { throwOnError: true })).not.toThrow()
  const labels = x.trace.map((t) => t.label)
  for (const needed of ['Datasheet level at 1 m', 'Sweep level at the microphone, direct + reverberant', 'SNR, 500 Hz band', 'SNR, 1 kHz band', 'Margin to the threshold', 'Borderline within']) {
    expect(labels).toContain(needed)
  }

  const hasLevel = Number.isFinite(x.spl_at_1m_db)
  const missingRt = x.bands.some((b) => b.critical && !b.covered)
  if (!hasLevel) {
    // No published maximum level: no size, no SNR, and nothing that reads as a verdict on the room.
    expect(x.light).toBe(missingRt ? 'red' : 'yellow')
    expect(x.headline).toBe(missingRt ? 'Does not work' : 'No room size')
    expect(x.speaker.spl_peak_db === null && !x.speaker.power_watt).toBe(true)
    expect(x.headline_range).toBe('')
    expect(x.reach).toHaveLength(0)
    for (const t of x.tiers) expect(t.max_area_m2).toBe(0)
    expect(x.full.max_area_m2).toBe(0)
    return
  }

  // Reverberation time is physical: positive, whatever the room size.
  expect(x.expected_rt_s).toBeGreaterThan(0)

  for (const v of [x.sweep_level_1m_db, x.level_at_mic_db, x.snr_500_db, x.snr_1000_db, x.margin_db, x.band_db, x.distance_m, x.volume_m3, x.expected_rt_s]) {
    expect(Number.isFinite(v)).toBe(true)
  }

  // The RT bands decide: the lower of 500 Hz and 1 kHz, not the higher.
  expect(x.snr_rt_db).toBe(Math.min(x.snr_500_db, x.snr_1000_db))

  // Tiers: margins one threshold apart, statuses from a literal rule (not the engine's own statusOf),
  // areas ordered and bracketed.
  for (let i = 0; i < x.tiers.length; i++) {
    const t = x.tiers[i]
    const literal = t.margin_db >= x.band_db ? 'yes' : t.margin_db >= -x.band_db ? 'borderline' : 'no'
    expect(t.status).toBe(literal)
    expect(t.margin_db).toBeCloseTo(x.snr_rt_db - t.snrDb, 9)
    expect(t.area_range_m2[0]).toBeLessThanOrEqual(t.max_area_m2)
    expect(t.area_range_m2[1]).toBeGreaterThanOrEqual(t.max_area_m2)
    if (i > 0) {
      expect(x.tiers[i - 1].margin_db - t.margin_db).toBeCloseTo(t.snrDb - x.tiers[i - 1].snrDb, 9)
      expect(x.tiers[i - 1].max_area_m2).toBeGreaterThanOrEqual(t.max_area_m2)
    }
  }

  // Room ladder never improves with size.
  for (let i = 1; i < x.reach.length; i++) expect(x.reach[i].margin_db).toBeLessThanOrEqual(x.reach[i - 1].margin_db + 1e-9)

  // The headline and the room check cannot contradict each other: with the same T model, a room no
  // larger than the headline size reaches the threshold.
  const selected = x.tiers.find((t) => t.key === x.room.tier)!
  if (x.room.rt_override_s === null && selected.max_area_m2 > 0 && x.room.area_m2 <= selected.max_area_m2 && x.room.area_m2 >= 5) {
    expect(x.margin_db).toBeGreaterThanOrEqual(-1e-6)
  }

  // A result whose bands were not checked is never green.
  if (x.caveats.some((c) => c.id === 'freq_unknown')) expect(x.light).not.toBe('green')

  // Red means: no RT bands, or not even Compatible in any room.
  expect(x.light === 'red').toBe(missingRt || x.tiers[0].max_area_m2 === 0)

  // The headline is the full result (RT bands at 28 dB plus the Bass Ratio bands) and stops at the volume cap.
  const cap = x.max_area_display_m2
  expect(cap).toBe(Math.floor(MAX_VOLUME_M3 / Math.max(x.room.height_m, 1) / 5) * 5)
  const lowCovered = x.bands.filter((b) => b.centre_hz <= 250).every((b) => b.covered)
  if (!missingRt && x.tiers[0].max_area_m2 > 0) {
    const tail = lowCovered ? '' : ', without Bass Ratio'
    if (x.full.max_area_m2 >= cap) expect(x.headline).toBe(`Rooms up to ${cap} m²${tail}`)
    else if (x.full.max_area_m2 > 0) expect(x.headline).toBe(`Rooms up to about ${x.full.max_area_m2} m²${tail}`)
  }
  // The full result is never larger than a reverberation time with margin alone, and its range brackets it.
  expect(x.full.max_area_m2).toBeLessThanOrEqual(x.tiers.find((t) => t.key === 'reliable')!.max_area_m2)
  expect(x.full.area_range_m2[0]).toBeLessThanOrEqual(x.full.max_area_m2)
  expect(x.full.area_range_m2[1]).toBeGreaterThanOrEqual(x.full.max_area_m2)
  // Without a 125 Hz or 250 Hz band there is no Bass Ratio, and the headline says so; the size still follows the level.
  expect(x.full.bass_ratio_possible).toBe(lowCovered)
  if (!lowCovered && !missingRt && x.tiers[0].max_area_m2 > 0) expect(x.headline).toContain('without Bass Ratio')
  // A size is never stated without its range, and never beyond the cap.
  if (/^(Rooms up to|Small rooms only|No full result)/.test(x.headline)) expect(x.headline_range).toMatch(/^Rough estimate: (\d+ to \d+\+? m²|\d+\+ m²|up to \d+\+? m², not certain even in a small room)\.$/)
  // Never a range whose two ends are the same number.
  expect(x.headline_range).not.toMatch(/(\d+) to \1\+? m²/)
  // The headline never states a reverberation-time-only size larger than the full result.
  expect(x.headline_text).not.toMatch(/reverberation time alone/)
  // No band is named as missing twice.
  for (const b of [125, 250]) expect((x.headline_text.match(new RegExp(`${b} Hz band`, 'g')) ?? []).length).toBeLessThanOrEqual(1)
  const stated = x.headline.match(/(\d+) m²/)
  if (stated) expect(Number(stated[1])).toBeLessThanOrEqual(cap)
  // A band inside the range is never reported missing, and partial implies covered.
  for (const b of x.bands) if (b.partial) expect(b.covered).toBe(true)
  expect(x.headline + x.headline_text).not.toMatch(/over \d+ m²/)
}

