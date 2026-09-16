import { describe, expect, it } from 'vitest'
import {
  REQUIRED_OCTAVES,
  achievedFreeField,
  achievedInRoom,
  predictedSnr,
  bandCoverage,
  bandNoise,
  fullHalfWidths,
  fullMargins,
  fullOk,
  coveredOctaves,
  maxAreaM2,
  maxDistance,
  minDistance,
  roomGainDb,
  roomLevels,
  score,
  statusOf,
  splAt1m,
  targetRtDin18041,
} from '../lib/scoring'
import { EXAMPLES } from '../lib/examples'
import {
  REQUIRED_SPAN_HZ,
  ROOM_CLASSES,
  SNR_CLEAN_DB,
  SNR_GATE_DB,
  SNR_RELIABLE_DB,
  SNR_T30_DB,
  SWEEP_ANALYSIS_GAIN_DB,
  SWEEP_LEVEL_OFFSET_DB,
  BASS_RATIO_SAFE_SNR_DB,
  DERIVED_SENSITIVITY_SPREAD_DB,
  FEW_MEASUREMENTS_ABOVE_M2,
  MODEL_ERROR_DB,
  NOISE_PRESETS,
  SWEEP_OFFSET_UNCERTAINTY_DB,
  TIERS,
} from '../lib/constants'
import type { Room, Speaker } from '../lib/types'
import { PREDICTION_UNCERTAINTY_DB } from '../lib/constants'

const speaker = (id: string): Speaker => {
  const e = EXAMPLES.find((x) => x.id === id)
  if (!e) throw new Error(`no example ${id}`)
  return e.speaker
}

const room = (over: Partial<Room> = {}): Room => ({
  class_key: 'meeting',
  area_m2: 35,
  height_m: 2.8,
  noise_floor_db: 35,
  tier: 'reliable',
  usage: 'A3',
  rt_override_s: null,
  ...over,
})

// --- Layer 1: closed form. Catches transcription errors. --------------------

describe('level conversions', () => {
  it('refers a 0.5 m datasheet figure to 1 m by exactly 6.02 dB', () => {
    expect(splAt1m(88, 0.5)).toBeCloseTo(81.98, 2)
  })

  it('loses 6.02 dB per doubling in the free field', () => {
    expect(achievedFreeField(82, 2) - achievedFreeField(82, 4)).toBeCloseTo(6.02, 2)
  })

  it('returns the 1 m level at 1 m when the room is taken away', () => {
    expect(roomGainDb(1, 1e9, 1e-9)).toBeCloseTo(0, 3)
  })
})

describe("the SNR of the BMR analysis", () => {
  it('carries the sweep gain over the analysis window, minus one octave of the sweep', () => {
    // the gain of the measurement signal over the analysis window, minus one octave of its energy
    expect(SWEEP_ANALYSIS_GAIN_DB).toBeCloseTo(-3.91, 2)
  })

  it('loses exactly 1 dB per dB of background noise', () => {
    expect(predictedSnr(70, 35, 500) - predictedSnr(70, 36, 500)).toBeCloseTo(1, 9)
  })

  it('reads band noise from the A-weighted level with the database offsets', () => {
    expect(bandNoise(35, 500)).toBeCloseTo(30.3, 6)
    expect(bandNoise(35, 1000)).toBeCloseTo(27.8, 6)
  })

  it('puts all four tiers on the one SNR scale the BMR analysis gates on', () => {
    expect(TIERS.map((t) => t.snrDb)).toEqual([SNR_GATE_DB, SNR_RELIABLE_DB, SNR_CLEAN_DB, SNR_T30_DB])
    expect([SNR_GATE_DB, SNR_RELIABLE_DB, SNR_CLEAN_DB, SNR_T30_DB]).toEqual([25, 28, 35, 38])
  })
})

describe('borderline zone', () => {
  it('is yes at or above +b, borderline inside ±b, no below −b', () => {
    expect(statusOf(3, 3)).toBe('yes')
    expect(statusOf(2.9, 3)).toBe('borderline')
    expect(statusOf(-3, 3)).toBe('borderline')
    expect(statusOf(-3.1, 3)).toBe('no')
  })

  it('counts an open datasheet against the loudspeaker: the level drops by σ, the borderline zone does not widen', () => {
    expect(score(speaker('teufel-mynd'), room()).band_db).toBeCloseTo(PREDICTION_UNCERTAINTY_DB, 9)
    const bar = score(speaker('cisco-room-bar'), room())
    expect(bar.band_db).toBeCloseTo(PREDICTION_UNCERTAINTY_DB, 9)
    expect(bar.sweep_level_1m_db).toBeCloseTo(93 + SWEEP_LEVEL_OFFSET_DB - 3, 9)
  })

  it('does not size a 7 W portable estimated from watts above a speakerphone with a published level', () => {
    const clip = score(speaker('jbl-clip-5'), room())
    const jabra = score(speaker('jabra-speak2-75'), room())
    expect(clip.speaker.power_watt).toBe(7)
    expect(clip.sweep_level_1m_db).toBeLessThan(jabra.sweep_level_1m_db)
  })

  /**
   * The color follows how often BMR's recordings actually lost the 125 Hz T20 (5.3 % at 28 dB or more), not the
   * width of the borderline zone. That width is 10.6 dB, of which 8.4 dB is the room-mode spread at 125 Hz, so the
   * old rule made a loudspeaker amber for something it cannot influence: 7 of the 9 worked examples, one by 0.1 dB.
   */
  it('colors the Bass Ratio on the measured failure rate, not on the borderline zone', () => {
    const jbl = score(speaker('jbl-xtreme-4'), room())
    expect(jbl.snr_125_db).toBeGreaterThan(BASS_RATIO_SAFE_SNR_DB)
    expect(jbl.full.status).toBe('borderline') // the zone is still wider than the margin ...
    expect(jbl.full.margins.b125).toBeLessThan(Math.hypot(jbl.band_db, 8.4))
    expect(jbl.room_light).toBe('green') // ... and the color no longer follows it
    expect(jbl.room_recommendation).not.toContain('Bass Ratio')

    const weak = score(speaker('jbl-portable-average'), room())
    expect(weak.snr_125_db).toBeLessThan(BASS_RATIO_SAFE_SNR_DB)
    expect(weak.room_light).toBe('yellow')
    expect(weak.room_recommendation).toContain('125 Hz band may drop out')
    // A missing Bass Ratio is never red: a reverberation time still comes back. Red stays "no measurement".
    for (const id of ['jbl-clip-5', 'jbl-portable-average']) expect(score(speaker(id), room()).room_light).not.toBe('red')
  })

  it('answers for the chosen room in the header, and calls a room above 500 m³ outside the check', () => {
    expect(score(speaker('jabra-speak2-75'), room()).room_headline).toMatch(/ in the selected 35 m² room$/)
    const big = score(speaker('teufel-mynd'), room({ area_m2: 200, height_m: 5 }))
    expect(big.room_verdict).toBe('Outside this check')
    expect(big.room_headline).toBe('The selected room (1000 m³) is outside this check')
  })
})

describe('room geometry', () => {
  it('takes half the diagonal of a square room from its area', () => {
    expect(maxDistance(36)).toBeCloseTo(4.2426, 3)
  })

  it('reproduces the DIN 18041 A3 target the BMR analysis uses', () => {
    expect(targetRtDin18041(100, 'A3')).toBeCloseTo(0.47, 2)
  })

  it('reproduces the near-microphone limit of the BMR analysis', () => {
    expect(minDistance(100, 0.5)).toBeCloseTo(2 * Math.sqrt(100 / 171.5), 6)
  })
})

describe('octave band coverage', () => {
  it('reports the seven bands the app plots', () => {
    expect(bandCoverage(20, 20000).map((b) => b.centre_hz)).toEqual([125, 250, 500, 1000, 2000, 4000, 8000])
  })

  it('keeps a band whose centre is inside the stated range, marked partial', () => {
    // 125 Hz octave: 88.4–176.8 Hz. A stated limit is a −3 dB point, not a cutoff.
    expect(bandCoverage(95, 20000)[0]).toMatchObject({ covered: true, partial: true })
    expect(bandCoverage(88, 20000)[0]).toMatchObject({ covered: true, partial: false })
  })

  it('drops a band whose centre is outside the stated range', () => {
    expect(bandCoverage(150, 20000)[0].covered).toBe(false)
    expect(bandCoverage(126, 20000)[0].covered).toBe(false)
    expect(bandCoverage(60, 5000)[5]).toMatchObject({ centre_hz: 4000, covered: true, partial: true }) // 4 kHz octave ends at 5657 Hz
    expect(bandCoverage(60, 5000)[6]).toMatchObject({ centre_hz: 8000, covered: false })
  })

  it('counts coverage in octaves, so the bottom band costs as much as the top one', () => {
    const noBottom = coveredOctaves(REQUIRED_SPAN_HZ[0] * 2, 20000)
    const noTop = coveredOctaves(20, REQUIRED_SPAN_HZ[1] / 2)
    expect(noBottom).toBeCloseTo(noTop, 6)
    expect(REQUIRED_OCTAVES).toBeCloseTo(7, 6)
  })
})

// --- Layer 2: recompute by a different route. Catches wrong physics. --------

describe('cross-checks against an independent route', () => {
  it('agrees with the speech level anchor of the BMR analysis', () => {
    // The speech level anchor of the BMR analysis: 68 dB source constant, Q = 2, r = 2 m, dead room -> 54.0 dB.
    const spl1m = 68 + 10 * Math.log10(2 / (4 * Math.PI))
    expect(achievedInRoom(spl1m, 2, 1e9, 0.5, 2)).toBeCloseTo(54.0, 1)
  })

  it('collapses onto the free field when the reverberant term vanishes', () => {
    expect(achievedInRoom(95, 4, 1e8, 0.3, 2)).toBeCloseTo(achievedFreeField(95, 4), 2)
  })

  it('reproduces the Jabra Speak2 75 measurement the sweep offset was read from', () => {
    // BMR measurements 2026-07-22: 6.96 × 4.14 × 2.37 m, T20mid 0.45 s, measured band noise 33.85 dB (500 Hz)
    // and 28.95 dB (1 kHz), implied sweep level 68.3 / 71.2 dB at 1 m; measured SNR 31.1 and 39.0 dB.
    // A regression pin on equations (6) and (8) with the measured noise, not an independent validation.
    const d = maxDistance(27.67)
    const snr = (L: number, noise: number) => achievedInRoom(L, d, 65.4, 0.45) - noise + SWEEP_ANALYSIS_GAIN_DB
    expect(Math.abs(snr(68.3, 33.85) - 31.1)).toBeLessThan(1)
    expect(Math.abs(snr(71.2, 28.95) - 39.0)).toBeLessThan(1)
  })

  it('solves the largest area at the edge of the condition it states', () => {
    const L = 80
    const A = maxAreaM2(L, 35, 35, 2.8)
    const net = (a: number) => roomLevels(L, a, 2.8, 35, 'A3', null).snr_rt
    expect(net(A)).toBeGreaterThanOrEqual(35)
    expect(net(A + 5)).toBeLessThan(35)
  })
})

// --- Behaviour ----------------------------------------------------------------

describe('the ladder', () => {
  it('tier margins differ by exactly the threshold differences', () => {
    const r = score(speaker('teufel-mynd'), room())
    for (let i = 1; i < r.tiers.length; i++) expect(r.tiers[i - 1].margin_db - r.tiers[i].margin_db).toBeCloseTo(r.tiers[i].snrDb - r.tiers[i - 1].snrDb, 9)
  })

  it('gives every tier its own area for the same room, stricter tiers smaller', () => {
    const r = score(speaker('jabra-speak2-75'), room())
    for (let i = 1; i < r.tiers.length; i++) expect(r.tiers[i - 1].max_area_m2).toBeGreaterThanOrEqual(r.tiers[i].max_area_m2)
  })

  it('does not change the per-tier areas when the user switches tier', () => {
    const a = score(speaker('jabra-speak2-75'), room({ tier: 'compatible' }))
    const b = score(speaker('jabra-speak2-75'), room({ tier: 't30' }))
    expect(a.tiers.map((t) => t.max_area_m2)).toEqual(b.tiers.map((t) => t.max_area_m2))
  })

  it('applies the sweep offset once', () => {
    const r = score(speaker('teufel-mynd'), room())
    expect(r.sweep_level_1m_db).toBeCloseTo(95 + SWEEP_LEVEL_OFFSET_DB, 9)
  })
})

describe('the headline answers which room sizes', () => {
  it('names the largest room with the full result, not the 25 dB gate or the RT bands alone', () => {
    const r = score(speaker('jabra-speak2-75'), room())
    const works = r.tiers.find((t) => t.key === 'reliable')!
    expect(works.snrDb).toBe(28)
    expect(r.full.max_area_m2).toBeLessThan(works.max_area_m2)
    expect(r.headline).toBe(`Rooms up to about ${r.full.max_area_m2} m²`)
    expect(r.headline_text).toContain('35 dB(A)')
    expect(r.headline_text).toContain('Bass Ratio')
  })

  it('uses the 28 dB tier whichever tier the user selected', () => {
    const a = score(speaker('jabra-speak2-75'), room({ tier: 'compatible' }))
    const b = score(speaker('jabra-speak2-75'), room({ tier: 't30' }))
    expect(a.headline).toBe(b.headline)
  })

  it('states the size with its range', () => {
    const r = score(speaker('jabra-speak2-75'), room())
    const [lo, hi] = r.full.area_range_m2
    const upper = hi >= r.max_area_display_m2 ? `${r.max_area_display_m2}+` : `${hi}`
    expect(r.headline_range).toBe(lo > 0 ? `Rough estimate: ${lo} to ${upper} m².` : `Rough estimate: up to ${upper} m², not certain even in a small room.`)
  })

  it('says 175+ m² instead of "175 to 175+ m²" when even the cautious end reaches the cap, and names the cap in the details', () => {
    const r = score(speaker('teufel-mynd'), room({ noise_floor_db: 25 }))
    expect(r.full.area_range_m2[0]).toBeGreaterThanOrEqual(r.max_area_display_m2)
    expect(r.headline_range).toBe(`Rough estimate: ${r.max_area_display_m2}+ m².`)
    expect(r.caveats.some((c) => c.id === 'check_cap')).toBe(true)
  })

  /**
   * Over every room preset and noise preset, not one room: the clauses about a weak edge band and a missing band
   * are appended AFTER the sentence is built, so a check at 35 m² / 35 dB(A) alone never saw the long cases.
   * 160 characters is about three lines in the card at phone width.
   */
  it('keeps the headline text short, and always says where the noise warning stands', () => {
    let checked = 0
    for (const e of EXAMPLES) {
      for (const rc of ROOM_CLASSES) {
        for (const n of NOISE_PRESETS) {
          const where = `${e.id} ${rc.area_m2} m² ${n.db} dB(A)`
          const r = score(e.speaker, room({ class_key: rc.key, area_m2: rc.area_m2, height_m: rc.height_m, noise_floor_db: n.db }))
          expect(r.headline_text.length, where).toBeLessThanOrEqual(160)
          if (r.full.max_area_m2 > 0 && r.full.bass_ratio_possible) expect(r.headline_text, where).toMatch(/noise warning/)
          checked++
        }
      }
    }
    // And the branch the room presets never reach: a room past the volume cap.
    const big = score(EXAMPLES[0].speaker, room({ area_m2: 200, height_m: 2.8 }))
    expect(big.headline_text).toMatch(/noise warning/)
    expect(big.headline_text.length).toBeLessThanOrEqual(160)
    expect(checked).toBe(EXAMPLES.length * ROOM_CLASSES.length * NOISE_PRESETS.length)
  })

  it('builds the borderline zone from the model error and the sweep offset, and from nothing else', () => {
    expect(SWEEP_OFFSET_UNCERTAINTY_DB).toBeCloseTo(15.7 / Math.sqrt(12), 9)
    expect(MODEL_ERROR_DB).toBe(4.7) // pooled within-session SD of predicted against stored SNR (saved query)
    expect(score(speaker('teufel-mynd'), room()).band_db).toBeCloseTo(6.53, 2)
  })

  it('brackets that size with the borderline zone', () => {
    for (const t of score(speaker('jabra-speak2-75'), room()).tiers) {
      expect(t.area_range_m2[0]).toBeLessThanOrEqual(t.max_area_m2)
      expect(t.area_range_m2[1]).toBeGreaterThanOrEqual(t.max_area_m2)
    }
  })

  it('does not depend on the room the user entered, only on its noise and height', () => {
    const a = score(speaker('jabra-speak2-75'), room({ area_m2: 5 }))
    const b = score(speaker('jabra-speak2-75'), room({ area_m2: 150 }))
    expect(a.headline).toBe(b.headline)
    expect(a.room_verdict).not.toBe(b.room_verdict)
  })

  it('stops at 500 m³, the top of the DIN 18041 A4 volume range, as a floor area for the room height', () => {
    expect(score(speaker('teufel-mynd'), room()).headline).toBe('Rooms up to 175 m²') // 500 / 2.8 = 178.6
    expect(score(speaker('teufel-mynd'), room({ height_m: 5 })).headline).toBe('Rooms up to 100 m²')
    expect(score(speaker('teufel-mynd'), room({ area_m2: 200 })).caveats.some((c) => c.id === 'beyond_volume')).toBe(true)
  })
})

describe('room reach', () => {
  it('lists every preset class', () => {
    expect(score(speaker('teufel-mynd'), room()).reach.map((x) => x.class_key)).toEqual(ROOM_CLASSES.map((c) => c.key))
  })

  it('is monotonic: a bigger room never helps', () => {
    const r = score(speaker('jabra-speak2-75'), room())
    for (let i = 1; i < r.reach.length; i++) expect(r.reach[i].margin_db).toBeLessThan(r.reach[i - 1].margin_db)
  })

})

describe('inputs and uncertainty', () => {
  it('1 dB of room noise costs exactly 1 dB of margin', () => {
    const a = score(speaker('teufel-mynd'), room({ noise_floor_db: 35 }))
    const b = score(speaker('teufel-mynd'), room({ noise_floor_db: 36 }))
    expect(a.margin_db - b.margin_db).toBeCloseTo(1, 9)
  })

  it('a fully specified datasheet carries no uncertainty', () => {
    expect(score(speaker('teufel-mynd'), room()).margin_uncertainty_db).toBe(0)
    expect(score(speaker('bo-beosound-explore'), room()).margin_uncertainty_db).toBe(0)
  })

  it('an SPL with no reference distance carries 3 dB and says so', () => {
    const r = score(speaker('cisco-room-bar'), room())
    expect(r.margin_uncertainty_db).toBeCloseTo(3, 9)
    expect(r.caveats.some((c) => c.id === 'assumed_ref_distance')).toBe(true)
  })

  /**
   * Out-of-sample check on DERIVED_SENSITIVITY_DB_W_M: the JBL Xtreme 4 is not one of the datasheets the
   * constant is read from, and BMR has 73 calibrated recordings of it. Those imply a sweep level of 74.4 dB at
   * 1 m as played — a lower bound, the volume setting was never recorded. Devices with a published maximum level
   * sit at −11.3, +0.7 and +1.8 dB on the same comparison, so the estimate has to land in that family, not 8 dB
   * above it as the assumed 80 dB/W/m did.
   */
  it('lands within 3 dB of what 73 BMR recordings imply for the JBL Xtreme 4', () => {
    const r = score(speaker('jbl-xtreme-4'), room())
    expect(r.spl_at_1m_provenance).toBe('derived')
    expect(r.margin_uncertainty_db).toBeCloseTo(DERIVED_SENSITIVITY_SPREAD_DB, 9)
    expect(r.sweep_level_1m_db - 74.4).toBeGreaterThan(0)
    expect(r.sweep_level_1m_db - 74.4).toBeLessThan(3)
  })

  /**
   * The caveat follows the largest size the answer STATES, not the room the customer typed. A loud loudspeaker
   * in a small room still gets a headline of 175 m², and BMR's largest measured room is 140 m², so the answer
   * has to say that on its face rather than only when someone types a big room.
   */
  it('says when BMR has few measurements at the size it is quoting', () => {
    const fires = (id: string, over = {}) => score(speaker(id), room(over)).caveats.some((c) => c.id === 'few_measurements')
    expect(fires('teufel-mynd', { area_m2: 60 })).toBe(true) // the room is large
    expect(fires('teufel-mynd')).toBe(true) // the room is not, but the headline says 175 m²

    // The quiet ones too: the JBL Clip 5's headline is about 10 m², and its range still reads "up to 175+ m²".
    const clip = score(speaker('jbl-clip-5'), room())
    expect(clip.full.max_area_m2).toBeLessThan(FEW_MEASUREMENTS_ABOVE_M2)
    expect(clip.headline_range).toContain('175+')
    expect(fires('jbl-clip-5')).toBe(true)

    // Only when the answer states no size above 45 m² anywhere does it go quiet.
    const noisy = score(speaker('jbl-clip-5'), room({ noise_floor_db: 45 }))
    expect(Math.max(noisy.full.area_range_m2[1], noisy.tiers.find((t) => t.key === 'reliable')!.max_area_m2)).toBeLessThan(FEW_MEASUREMENTS_ABOVE_M2)
    expect(noisy.caveats.some((c) => c.id === 'few_measurements')).toBe(false)
  })
})

describe('the full result: the bands the Bass Ratio needs', () => {
  it('predicts the low bands weaker than 500 Hz by the noise offset and the measured low-band shortfall', () => {
    const r = score(speaker('teufel-mynd'), room())
    // noise: 125 Hz +0.1 against 500 Hz −4.7 dB; level: −3.6 dB (from BMR measurements)
    expect(r.snr_500_db - r.snr_125_db).toBeCloseTo(0.1 + 4.7 + 3.6, 9)
    expect(r.snr_500_db - r.snr_250_db).toBeCloseTo(-1.7 + 4.7 + 1.6, 9)
  })

  it('reproduces the Jabra Speak2 75 in that room: the Bass Ratio at the edge', () => {
    // BMR measurements 2026-07-22, 27.67 m², 2.37 m, T20mid 0.45 s, 37.3–39.0 dB(A): 125 Hz SNR 29.8 and 23.6 dB, so one of the
    // two recordings returned no T20 at 125 Hz and its MOS score lost the Bass Ratio.
    const r = score(speaker('jabra-speak2-75'), room({ area_m2: 27.67, height_m: 2.37, noise_floor_db: 38.15, rt_override_s: 0.45 }))
    expect(r.full.status).toBe('borderline')
    expect(r.full.binding).toBe(125)
    expect(Math.abs(r.snr_125_db - (29.8 + 23.6) / 2)).toBeLessThan(3)
  })

  it('gives the Jabra Speak2 75 a much smaller headline room than the RT bands alone, and never rules out that room', () => {
    // Field: a reverberation time in a 28 m² BMR meeting room and in about 40 m², with warnings; the full result there in one
    // of two recordings. Its own recordings scaled by BMR room absorption put 125 Hz at 28 dB near 34 m² at 35 dB(A)
    // (from BMR measurements); the pooled low-band shortfall makes the tool more cautious than that.
    const r = score(speaker('jabra-speak2-75'), room())
    expect(r.full.max_area_m2).toBeGreaterThanOrEqual(30)
    expect(r.full.max_area_m2).toBeLessThanOrEqual(r.tiers.find((t) => t.key === 'reliable')!.max_area_m2 / 3)
    expect(r.full.area_range_m2[1]).toBeGreaterThanOrEqual(40)
  })

  it('has no Bass Ratio when 125 Hz or 250 Hz is outside the range, and says so', () => {
    const r = score({ ...speaker('teufel-mynd'), freq_low_hz: 300 }, room())
    expect(r.full.bass_ratio_possible).toBe(false)
    expect(r.full.status).toBe('no')
    expect(r.headline).toContain('without Bass Ratio')
    expect(r.caveats.some((c) => c.id === 'no_bass_ratio')).toBe(true)
  })

  it('does not give a speaker a bigger room for switching a band off: speak mode keeps the music-mode size', () => {
    const music = score(speaker('jabra-speak2-75'), room())
    const speak = score(speaker('jabra-speak2-75-speak'), room())
    expect(speak.full.max_area_m2).toBe(music.full.max_area_m2)
    expect(speak.headline).toBe(`${music.headline}, without Bass Ratio`)
  })

  it('holds the RT bands to 28 dB and the Bass Ratio bands to the 25 dB gate: the caution sits in k, not in a third margin', () => {
    const r = score(speaker('teufel-mynd'), room())
    expect(r.full.margins.b125).toBeCloseTo(r.snr_125_db - 25, 9)
    expect(r.full.margins.b250).toBeCloseTo(r.snr_250_db - 25, 9)
    expect(r.full.margins.rt).toBeCloseTo(r.snr_rt_db - 28, 9)
  })

  it('widens the half-width of each low band in quadrature by its measured spread, 8.4 dB and 3.9 dB', () => {
    const w = fullHalfWidths(6)
    expect(w.rt).toBe(6)
    expect(w.b125).toBeCloseTo(Math.hypot(6, 8.4), 9)
    expect(w.b250).toBeCloseTo(Math.hypot(6, 3.9), 9)
  })

  it('fails the full result when only 250 Hz is short, and when only 125 Hz is short', () => {
    const lv = roomLevels(80, 30, 2.8, 30, 'A3', null)
    const good = { ...lv, snr_rt: 60, snr_125: 60, snr_250: 60 }
    expect(fullOk(good, 6, 1, true)).toBe(true)
    expect(fullOk({ ...good, snr_250: 24.9 }, 6, 0, true)).toBe(false)
    expect(fullOk({ ...good, snr_125: 24.9 }, 6, 0, true)).toBe(false)
    expect(fullOk({ ...good, snr_rt: 27.9 }, 6, 0, true)).toBe(false)
    expect(fullOk({ ...good, snr_250: 25 + 7 }, 6, 1, true)).toBe(false) // inside the widened half-width √(6² + 3.9²) = 7.2
    expect(fullOk({ ...good, snr_250: 25 + 7.2 }, 6, 1, true)).toBe(true)
    expect(fullMargins(good).b250).toBe(35)
  })
})

describe('devices', () => {
  it('reproduces what the Jabra Speak2 75 did in that room: Compatible, Reliable borderline', () => {
    // BMR measurements 2026-07-22, a 27.67 m² room, 2.37 m, T20mid 0.45 s, 37.3–39.0 dB(A).
    // Measured 500 Hz SNR 30.7 / 31.5 dB with "close to noise floor" warnings.
    const r = score(speaker('jabra-speak2-75'), room({ area_m2: 27.67, height_m: 2.37, noise_floor_db: 38.15, rt_override_s: 0.45 }))
    expect(r.tiers[0].status).toBe('yes')
    expect(r.tiers[1].status).toBe('borderline')
    expect(r.room_verdict).toBe('Borderline in this room')
  })

  it('Jabra speak mode loses 125 Hz at the same level', () => {
    const music = score(speaker('jabra-speak2-75'), room())
    const speak = score(speaker('jabra-speak2-75-speak'), room())
    expect(music.bands[0].covered).toBe(true)
    expect(speak.bands[0].covered).toBe(false)
    expect(speak.margin_db).toBeCloseTo(music.margin_db, 9)
  })

  it('the JBL Clip 5 cannot be green: 125 Hz at the edge of its range on a 45 mm driver', () => {
    const r = score(speaker('jbl-clip-5'), room())
    expect(r.bands[0]).toMatchObject({ covered: true, partial: true })
    expect(r.light).not.toBe('green')
    expect(r.caveats.find((c) => c.id === 'partial_bands')!.text).toContain('125 Hz')
    expect(r.caveats.map((c) => c.id)).toContain('small_woofer')
  })

  it('a speaker without 500 Hz or 1 kHz is red however loud it is', () => {
    const r = score({ ...speaker('teufel-mynd'), freq_low_hz: 700 }, room())
    expect(r.light).toBe('red')
    expect(r.headline).toBe('Does not work')
  })

  it('a speaker that clears no tier is red and says how far short it is', () => {
    const r = score({ ...speaker('teufel-mynd'), spl_peak_db: 60 }, room())
    expect(r.best_tier).toBeNull()
    expect(r.room_light).toBe('red')
    expect(r.room_recommendation).toContain('short')
  })
})
