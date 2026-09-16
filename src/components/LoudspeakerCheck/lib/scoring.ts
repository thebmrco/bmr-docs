/**
 * Loudspeaker Check — the scoring engine.
 *
 *   Step 1  what the BMR analysis requires: an SNR threshold, on the BMR analysis's own scale
 *   Step 2  what reaches the microphone: datasheet level → conservative sweep level →
 *           direct sound plus reverberant field at the far corner
 *   Step 3  the SNR the BMR analysis will compute from that, against the threshold; within
 *           ±PREDICTION_UNCERTAINTY_DB (widened by datasheet uncertainty) it is borderline
 *
 * Every constant is imported from `constants.ts`, which carries its provenance.
 * The method page (components/Methodology.tsx) states the same equations.
 */
import {
  AREA_SEARCH_MAX_M2,
  DERIVED_SENSITIVITY_DB_W_M,
  DERIVED_SENSITIVITY_SPREAD_DB,
  BASS_RATIO_BANDS_HZ,
  BASS_RATIO_SAFE_SNR_DB,
  LOW_BAND_LEVEL_OFFSET_DB,
  LOW_BAND_SNR_DB,
  LOW_BAND_SPREAD_DB,
  MAX_VOLUME_M3,
  SNR_RELIABLE_DB,
  CENTER_FREQUENCIES,
  FEW_MEASUREMENTS_ABOVE_M2,
  LARGEST_MEASURED_ROOM_M2,
  LONG_RT_S,
  DEFAULT_Q,
  DIFFUSE_COEFF,
  DIN18041_LONG_DISTANCE_M,
  DIN18041_TARGET_RT,
  DIN18041_VOLUME_RANGE,
  NOISE_BAND_OFFSET_DB,
  REPORTED_BAND_INDICES,
  REQUIRED_SPAN_HZ,
  ROOM_CLASSES,
  RT_BAND_INDICES,
  SABINE_COEFF,
  PREDICTION_UNCERTAINTY_DB,
  SMALL_WOOFER_MM,
  SNR_CLEAN_DB,
  SNR_GATE_DB,
  SPEED_OF_SOUND_MS,
  SWEEP_ANALYSIS_GAIN_DB,
  SWEEP_LEVEL_OFFSET_DB,
  TIERS,
  bandEdges,
} from './constants'
import type { BandCoverage, Caveat, FullResult, Provenance, Result, Room, RoomReach, Speaker, Status, TierResult, TraceLine } from './types'

const log10 = (x: number) => Math.log10(x)
const round = (x: number, d = 1) => Number(x.toFixed(d))
/** A signed term for LaTeX: "+ 3.0" or "- 12.0". */
const term = (x: number, d = 1) => (x >= 0 ? `+ ${x.toFixed(d)}` : `- ${Math.abs(x).toFixed(d)}`)

// ---------------------------------------------------------------------------
// Geometry and the room
// ---------------------------------------------------------------------------

/**
 * Worst-case source-to-microphone distance: source centred, microphone in the farthest
 * corner of a square room, d = √A·√2/2 = √(A/2). BMR measurements: the distance BMR users actually
 * measure at has its p90 at about this value, so it is the far end of practice, not beyond it.
 */
export function maxDistance(area_m2: number): number {
  return Math.sqrt(Math.max(area_m2, 1) / 2)
}

/** DIN 18041:2016-03 4.2.3 — T_soll = a·log10(V) + b. Same formula the BMR analysis MOS score uses. */
export function targetRtDin18041(volume_m3: number, usage = 'A3'): number {
  const [a, b] = DIN18041_TARGET_RT[usage] ?? DIN18041_TARGET_RT.A3
  return a * log10(Math.max(volume_m3, 1)) + b
}

/** Inside this distance the BMR analysis shifts its regression range down. */
export function minDistance(volume_m3: number, rt_s: number): number {
  return 2 * Math.sqrt(volume_m3 / (SPEED_OF_SOUND_MS * Math.max(rt_s, 0.05)))
}

/** Reverberation radius: r_H = sqrt(Q·A / 16π) with Sabine A = 0.161·V/T. */
export function reverberationRadius(volume_m3: number, rt_s: number, Q = DEFAULT_Q): number {
  const A = (SABINE_COEFF * volume_m3) / Math.max(rt_s, 0.05)
  return Math.sqrt((Q * A) / (16 * Math.PI))
}

// ---------------------------------------------------------------------------
// Step 2 — level
// ---------------------------------------------------------------------------

/** Datasheet SPL at its reference distance -> SPL at 1 m, 6 dB per doubling. */
export function splAt1m(spl_db: number, ref_distance_m: number): number {
  return spl_db - 20 * log10(1 / Math.max(ref_distance_m, 0.01))
}

/** Direct sound alone at distance. Shown for comparison; the SNR of the BMR analysis sees the total. */
export function achievedFreeField(spl_1m_db: number, distance_m: number): number {
  return spl_1m_db - 20 * log10(Math.max(distance_m, 1))
}

/**
 * Level at distance relative to the on-axis 1 m level, direct plus reverberant:
 *
 *     G = −10·log10(Q/4π) + 10·log10( Q/(4πr²) + 25·T/V )
 *
 * The model the BMR analysis predicts speech level with. BMR measurements: at
 * fixed volume the measured level falls far less with distance than the direct sound alone (slope
 * near 0 against −1). This model predicts −0.3 to −0.5 there, so its distance dependence is not
 * confirmed either.
 */
export function roomGainDb(distance_m: number, volume_m3: number, rt_s: number, Q = DEFAULT_Q): number {
  const direct = Q / (4 * Math.PI * Math.max(distance_m, 0.1) ** 2)
  const diffuse = (DIFFUSE_COEFF * rt_s) / Math.max(volume_m3, 1)
  return -10 * log10(Q / (4 * Math.PI)) + 10 * log10(direct + diffuse)
}

export function achievedInRoom(spl_1m_db: number, distance_m: number, volume_m3: number, rt_s: number, Q = DEFAULT_Q) {
  return spl_1m_db + roomGainDb(distance_m, volume_m3, rt_s, Q)
}

// ---------------------------------------------------------------------------
// Step 3 — the SNR of the BMR analysis
// ---------------------------------------------------------------------------

/** Octave-band background noise from an A-weighted reading (offsets from BMR measurements). */
export function bandNoise(noise_dba: number, centre_hz: number): number {
  return noise_dba + (NOISE_BAND_OFFSET_DB[centre_hz] ?? 0)
}

/**
 * SNR the BMR analysis returns for a sweep arriving at this broadband level. In the low bands the sweep
 * arrives weaker than a flat loudspeaker would (LOW_BAND_LEVEL_OFFSET_DB, from BMR recordings).
 */
export function predictedSnr(level_at_mic_db: number, noise_dba: number, centre_hz: number): number {
  return level_at_mic_db - bandNoise(noise_dba, centre_hz) + SWEEP_ANALYSIS_GAIN_DB + (LOW_BAND_LEVEL_OFFSET_DB[centre_hz] ?? 0)
}

/** Largest floor area the check covers at this ceiling height: MAX_VOLUME_M3 / height, floored to 5 m². */
export function maxDisplayAreaM2(height_m: number): number {
  return Math.floor(MAX_VOLUME_M3 / Math.max(height_m, 1) / 5) * 5
}

/** yes / borderline / no for a margin, given the half-width of the borderline zone. */
export function statusOf(margin_db: number, band_db: number): Status {
  if (!Number.isFinite(margin_db)) return 'no'
  return margin_db >= band_db ? 'yes' : margin_db >= -band_db ? 'borderline' : 'no'
}

/** Everything a room of this size does to the sweep, up to the SNR of the BMR analysis in the RT bands. */
export function roomLevels(
  sweep_1m_db: number,
  area_m2: number,
  height_m: number,
  noise_dba: number,
  usage: string,
  rt_override_s: number | null,
) {
  const volume_m3 = area_m2 * height_m
  // Below its stated volume range the DIN formula runs to zero and then negative (1 m² × 2.8 m gives
  // −0.03 s), so it is evaluated at the bottom of the range instead.
  const [dinLo] = DIN18041_VOLUME_RANGE[usage] ?? DIN18041_VOLUME_RANGE.A3
  const rt_s = rt_override_s ?? targetRtDin18041(Math.max(volume_m3, dinLo), usage)
  const d = maxDistance(area_m2)
  const level = achievedInRoom(sweep_1m_db, d, volume_m3, rt_s)
  const snr_500 = predictedSnr(level, noise_dba, 500)
  const snr_1000 = predictedSnr(level, noise_dba, 1000)
  return {
    snr_125: predictedSnr(level, noise_dba, 125),
    snr_250: predictedSnr(level, noise_dba, 250),
    volume_m3,
    rt_s,
    d,
    level,
    snr_500,
    snr_1000,
    snr_rt: Math.min(snr_500, snr_1000),
    binding: (snr_500 <= snr_1000 ? 500 : 1000) as 500 | 1000,
  }
}

/**
 * Largest floor area at which the predicted SNR still reaches a threshold. Solved by bisection — the
 * SNR falls with area above about 9 m³, where T/V starts to fall under DIN 18041 A3. Floored to a
 * 5 m² step. Returns AREA_SEARCH_MAX_M2 when even that is reached.
 */
export function maxAreaM2(
  sweep_1m_db: number,
  noise_dba: number,
  target_snr_db: number,
  height_m: number,
  usage = 'A3',
): number {
  if (!Number.isFinite(sweep_1m_db)) return 0
  const ok = (A: number) => roomLevels(sweep_1m_db, A, height_m, noise_dba, usage, null).snr_rt >= target_snr_db
  const MIN = 5
  if (!ok(MIN)) return 0
  if (ok(AREA_SEARCH_MAX_M2)) return AREA_SEARCH_MAX_M2
  let lo = MIN
  let hi = AREA_SEARCH_MAX_M2
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (ok(mid)) lo = mid
    else hi = mid
  }
  return Math.floor(lo / 5) * 5
}

/**
 * The full result: a reverberation time with margin in 500 Hz and 1 kHz, and a T20 in 125 Hz and 250 Hz so the
 * MOS score gets its Bass Ratio. Margins per part, each against its own half-width: the low bands add their
 * measured spread in quadrature. `shift` moves every part by that many half-widths (−1: the optimistic edge,
 * +1: the cautious edge), which is how the size range is found.
 */
export function fullMargins(lv: ReturnType<typeof roomLevels>) {
  return { rt: lv.snr_rt - SNR_RELIABLE_DB, b125: lv.snr_125 - LOW_BAND_SNR_DB, b250: lv.snr_250 - LOW_BAND_SNR_DB }
}

export function fullHalfWidths(band_db: number) {
  return { rt: band_db, b125: Math.hypot(band_db, LOW_BAND_SPREAD_DB[125]), b250: Math.hypot(band_db, LOW_BAND_SPREAD_DB[250]) }
}

export function fullOk(lv: ReturnType<typeof roomLevels>, band_db: number, shift: number, lowBands: boolean): boolean {
  const m = fullMargins(lv)
  const w = fullHalfWidths(band_db)
  return m.rt >= shift * w.rt && (!lowBands || (m.b125 >= shift * w.b125 && m.b250 >= shift * w.b250))
}

/** Largest floor area (5 m² steps) at which the full result holds, by bisection; the same search as maxAreaM2. */
export function maxFullAreaM2(
  sweep_1m_db: number,
  noise_dba: number,
  height_m: number,
  usage: string,
  band_db: number,
  shift = 0,
  lowBands = true,
): number {
  if (!Number.isFinite(sweep_1m_db)) return 0
  const ok = (A: number) => fullOk(roomLevels(sweep_1m_db, A, height_m, noise_dba, usage, null), band_db, shift, lowBands)
  const MIN = 5
  if (!ok(MIN)) return 0
  if (ok(AREA_SEARCH_MAX_M2)) return AREA_SEARCH_MAX_M2
  let lo = MIN
  let hi = AREA_SEARCH_MAX_M2
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (ok(mid)) lo = mid
    else hi = mid
  }
  return Math.floor(lo / 5) * 5
}

// ---------------------------------------------------------------------------
// Frequency coverage
// ---------------------------------------------------------------------------

/**
 * Which octave bands the speaker excites, and the SNR the BMR analysis would see in each for a flat
 * loudspeaker. A datasheet limit is a −3 dB (sometimes −10 dB) point, not a cutoff, so a band counts
 * as covered when its centre lies inside the stated range: at least half of it, in octaves, is then in
 * the passband. It is `partial` when the stated limit falls inside the band. DESIGN CHOICE, own; BMR measurements
 * agree at 125 Hz: devices rated from 100 Hz (Room Kit EQ, Jabra Speak2 40) measured 24–34 dB there,
 * a device rated from 250 Hz (Jabra Speak 510) 3–23 dB (BMR measurement records, 2026-09-15).
 */
export function bandCoverage(
  freq_low_hz: number,
  freq_high_hz: number,
  level_at_mic_db = Number.NaN,
  noise_dba = Number.NaN,
): BandCoverage[] {
  return REPORTED_BAND_INDICES.map((i) => {
    const centre = CENTER_FREQUENCIES[i]
    const [low, high] = bandEdges(centre)
    return {
      centre_hz: centre,
      low_hz: round(low),
      high_hz: round(high),
      covered: freq_low_hz <= centre && freq_high_hz >= centre,
      partial: freq_low_hz <= centre && freq_high_hz >= centre && (freq_low_hz > low || freq_high_hz < high),
      critical: (RT_BAND_INDICES as readonly number[]).includes(i),
      snr_db: predictedSnr(level_at_mic_db, noise_dba, centre),
    }
  })
}

/** Coverage in octaves, not hertz: octave bands are constant-percentage-bandwidth. */
export function coveredOctaves(freq_low_hz: number, freq_high_hz: number): number {
  const lo = Math.max(freq_low_hz, REQUIRED_SPAN_HZ[0])
  const hi = Math.min(freq_high_hz, REQUIRED_SPAN_HZ[1])
  return hi <= lo ? 0 : Math.log2(hi / lo)
}

export const REQUIRED_OCTAVES = Math.log2(REQUIRED_SPAN_HZ[1] / REQUIRED_SPAN_HZ[0])

// ---------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------

export function score(speaker: Speaker, room: Room): Result {
  const trace: TraceLine[] = []
  const caveats: Caveat[] = []

  // --- the level the datasheet implies at 1 m ------------------------------
  // A published maximum level first. Failing that, the wattage, through the level-per-watt that finished
  // loudspeakers actually reach (DERIVED_SENSITIVITY_DB_W_M) — not a driver sensitivity, which is what the
  // earlier version used and which sized these loudspeakers about 8 dB too high.
  let spl_at_1m_db = Number.NaN
  let spl_at_1m_provenance: Provenance = 'datasheet'
  if (speaker.spl_peak_db !== null) {
    spl_at_1m_db = splAt1m(speaker.spl_peak_db, speaker.spl_ref_distance_m)
    spl_at_1m_provenance = speaker.spl_ref_distance_stated ? 'datasheet' : 'assumed'
  } else if (speaker.power_watt) {
    spl_at_1m_db = DERIVED_SENSITIVITY_DB_W_M + 10 * log10(speaker.power_watt)
    spl_at_1m_provenance = 'derived'
  }

  // --- uncertainty on that level, in dB, before anything else uses it ------
  if (spl_at_1m_provenance === 'assumed') {
    caveats.push({
      id: 'assumed_ref_distance',
      text: 'The datasheet does not say at what distance its level was measured, so 1 m was assumed. If it was 0.5 m, every level here is 6 dB too high — carried as ±3 dB.',
      uncertainty_db: 3,
    })
  }
  if (spl_at_1m_provenance === 'derived') {
    caveats.push({
      id: 'derived_spl',
      text: `No maximum sound level is published, so the level was estimated from the ${speaker.power_watt} W rating at ${DERIVED_SENSITIVITY_DB_W_M} dB per watt at 1 m, the median of the datasheets that publish both. Those spread across about 15 dB, so ${DERIVED_SENSITIVITY_SPREAD_DB} dB is taken off and the size is an estimate rather than a specification.`,
      uncertainty_db: DERIVED_SENSITIVITY_SPREAD_DB,
    })
  }
  if (spl_at_1m_provenance === 'derived' && speaker.power_kind === 'speaker') {
    caveats.push({
      id: 'driver_watts',
      text: `${speaker.power_watt} W is entered as driver power, but the estimate is built from datasheets that give a total device rating, so this reads low. One loudspeaker here publishes both and they are four times apart. Use the total figure if the datasheet has one.`,
      uncertainty_db: 0,
    })
  }
  if (!Number.isFinite(spl_at_1m_db)) {
    caveats.push({
      id: 'no_published_level',
      text: 'The datasheet gives neither a maximum sound level nor a wattage, so there is nothing to size a room from. Everything below about the frequency bands still holds.',
      uncertainty_db: 0,
    })
  }
  const margin_uncertainty_db = Math.sqrt(caveats.reduce((acc, c) => acc + c.uncertainty_db ** 2, 0))
  // What the datasheet leaves open counts against the loudspeaker: the level is taken at the cautious end of the
  // guess instead of widening the borderline zone, so the borderline zone stays one number for every loudspeaker.
  const sweep_level_1m_db = spl_at_1m_db + SWEEP_LEVEL_OFFSET_DB - margin_uncertainty_db

  // --- the room -------------------------------------------------------------
  const r = roomLevels(sweep_level_1m_db, room.area_m2, room.height_m, room.noise_floor_db, room.usage, room.rt_override_s)
  const rt_provenance: Provenance = room.rt_override_s ? 'datasheet' : 'derived'
  const min_distance_m = minDistance(r.volume_m3, r.rt_s)
  const direct_db = achievedFreeField(sweep_level_1m_db, r.d)
  const band_db = PREDICTION_UNCERTAINTY_DB
  const noise_500_db = bandNoise(room.noise_floor_db, 500)
  const noise_1000_db = bandNoise(room.noise_floor_db, 1000)

  const tierDef = TIERS.find((t) => t.key === room.tier) ?? TIERS[1]
  const target_snr_db = tierDef.snrDb
  const margin_db = r.snr_rt - target_snr_db

  // --- trace: the working, as LaTeX ---------------------------------------
  trace.push({
    step: 1,
    label: `SNR required (${tierDef.label})`,
    tex: `\\mathrm{SNR}_\\mathrm{req} = \\textbf{${target_snr_db} dB}`,
    value: `${target_snr_db} dB`,
    result_tex: '',
    source: 'bmr_analysis',
  })
  trace.push({
    step: 2,
    label: 'Datasheet level at 1 m',
    tex:
      spl_at_1m_provenance === 'derived'
        ? `L_{1\\,\\mathrm{m}} = ${DERIVED_SENSITIVITY_DB_W_M} + 10\\log_{10} ${speaker.power_watt}`
        : Number.isFinite(spl_at_1m_db)
          ? `L_{1\\,\\mathrm{m}} = ${speaker.spl_peak_db} - 20\\log_{10}\\frac{1}{${speaker.spl_ref_distance_m}}`
          : `L_{1\\,\\mathrm{m}} = \\text{neither a level nor a wattage}`,
    value: Number.isFinite(spl_at_1m_db) ? `${round(spl_at_1m_db)} dB` : '—',
    result_tex: Number.isFinite(spl_at_1m_db) ? undefined : '',
    source: spl_at_1m_provenance === 'derived' ? 'derived' : undefined,
  })
  trace.push({
    step: 2,
    label: 'Sweep level at full volume, conservative',
    tex: `L_\\mathrm{sw} = L_{1\\,\\mathrm{m}} ${term(SWEEP_LEVEL_OFFSET_DB, 0)}${margin_uncertainty_db > 0 ? ` ${term(-margin_uncertainty_db)}` : ''}`,
    value: `${round(sweep_level_1m_db)} dB`,
    source: 'sweep_offset',
  })
  trace.push({
    step: 2,
    label: 'Farthest microphone position',
    tex: `d = \\sqrt{A/2} = \\sqrt{${round(room.area_m2)}/2}`,
    value: `${round(r.d, 2)} m`,
  })
  trace.push({
    step: 2,
    label: rt_provenance === 'derived' ? `Reverberation time, DIN 18041 ${room.usage}` : 'Reverberation time, measured',
    tex:
      rt_provenance === 'derived'
        ? `T = ${DIN18041_TARGET_RT[room.usage]?.[0] ?? 0.32}\\log_{10} ${round(r.volume_m3)} ${term(DIN18041_TARGET_RT[room.usage]?.[1] ?? -0.17, 2)}`
        : `T = ${r.rt_s}`,
    value: `${round(r.rt_s, 2)} s`,
    source: rt_provenance === 'derived' ? 'din18041' : undefined,
  })
  trace.push({
    step: 2,
    label: 'Sweep level at the microphone, direct + reverberant',
    tex: `L_\\mathrm{mic} = ${round(sweep_level_1m_db)} - 10\\log_{10}\\frac{2}{4\\pi} + 10\\log_{10}\\!\\left(\\frac{2}{4\\pi\\,${round(r.d, 2)}^2} + \\frac{25 \\cdot ${round(r.rt_s, 2)}}{${round(r.volume_m3)}}\\right)`,
    value: `${round(r.level)} dB SPL`,
    source: 'room_level',
  })
  for (const [band, noise, snr] of [
    [500, noise_500_db, r.snr_500],
    [1000, noise_1000_db, r.snr_1000],
  ] as const) {
    trace.push({
      step: 3,
      label: `Background noise, ${band === 1000 ? '1 kHz' : '500 Hz'} band`,
      tex: `L_{N,${band}} = ${room.noise_floor_db} ${term(NOISE_BAND_OFFSET_DB[band])}`,
      value: `${round(noise)} dB`,
      source: 'bmr_data',
    })
    trace.push({
      step: 3,
      label: `SNR, ${band === 1000 ? '1 kHz' : '500 Hz'} band`,
      tex: `\\mathrm{SNR}_{${band}} = L_\\mathrm{mic} - L_{N,${band}} ${term(SWEEP_ANALYSIS_GAIN_DB, 2)} = ${round(r.level)} - ${round(noise)} ${term(SWEEP_ANALYSIS_GAIN_DB, 2)}`,
      value: `${round(snr)} dB`,
      source: 'bmr_analysis',
    })
  }
  for (const [band, snr] of [
    [125, r.snr_125],
    [250, r.snr_250],
  ] as const) {
    trace.push({
      step: 3,
      label: `SNR, ${band} Hz band (Bass Ratio)`,
      tex: `\\mathrm{SNR}_{${band}} = L_\\mathrm{mic} - L_{N,${band}} ${term(SWEEP_ANALYSIS_GAIN_DB, 2)} ${term(LOW_BAND_LEVEL_OFFSET_DB[band])} = ${round(r.level)} - ${round(bandNoise(room.noise_floor_db, band))} ${term(SWEEP_ANALYSIS_GAIN_DB, 2)} ${term(LOW_BAND_LEVEL_OFFSET_DB[band])}`,
      value: `${round(snr)} dB`,
      source: 'bmr_data',
    })
  }
  trace.push({
    step: 3,
    label: 'Margin to the threshold',
    tex: `\\min(\\mathrm{SNR}_{500}, \\mathrm{SNR}_{1000}) - \\mathrm{SNR}_\\mathrm{req} = ${round(r.snr_rt)} - ${target_snr_db}`,
    value: `${margin_db >= 0 ? '+' : ''}${round(margin_db)} dB`,
  })
  trace.push({
    step: 3,
    label: 'Borderline within',
    tex: `\\pm ${PREDICTION_UNCERTAINTY_DB.toFixed(1)}`,
    value: `±${round(band_db)} dB`,
    result_tex: `= \\pm\\,\\textbf{${round(band_db)} dB}`,
    source: 'bmr_data',
  })

  // --- tiers and reach ------------------------------------------------------
  const tiers: TierResult[] = TIERS.map((t) => {
    const m = r.snr_rt - t.snrDb
    return {
      ...t,
      status: statusOf(m, band_db),
      cleared: statusOf(m, band_db) === 'yes',
      margin_db: m,
      max_area_m2: maxAreaM2(sweep_level_1m_db, room.noise_floor_db, t.snrDb, room.height_m, room.usage),
      area_range_m2: [
        maxAreaM2(sweep_level_1m_db, room.noise_floor_db, t.snrDb + band_db, room.height_m, room.usage),
        maxAreaM2(sweep_level_1m_db, room.noise_floor_db, t.snrDb - band_db, room.height_m, room.usage),
      ] as [number, number],
    }
  })
  const cleared = tiers.filter((t) => t.status === 'yes')
  const best_tier = cleared.length ? cleared[cleared.length - 1] : null

  const reach: RoomReach[] = Number.isFinite(sweep_level_1m_db)
    ? ROOM_CLASSES.map((rc) => {
        const lv = roomLevels(sweep_level_1m_db, rc.area_m2, rc.height_m, room.noise_floor_db, room.usage, null)
        const m = lv.snr_rt - target_snr_db
        return {
          class_key: rc.key,
          label: rc.label,
          people: rc.people,
          area_m2: rc.area_m2,
          snr_db: lv.snr_rt,
          status: statusOf(m, band_db),
          margin_db: m,
        }
      })
    : []

  const selected = tiers.find((t) => t.key === tierDef.key)!
  const max_area_m2 = selected.max_area_m2
  const status = selected.status

  // --- frequency ----------------------------------------------------------
  // A datasheet without a loudspeaker frequency range is common (UE, Logitech, Poly). That is missing
  // information, not a speaker that cannot play 500 Hz: the bands are then not checked, and flagged.
  const freqKnown = speaker.freq_low_hz > 0 && speaker.freq_high_hz > speaker.freq_low_hz
  const bands = bandCoverage(freqKnown ? speaker.freq_low_hz : 1, freqKnown ? speaker.freq_high_hz : 1e6, r.level, room.noise_floor_db)
  const covered_octaves = coveredOctaves(speaker.freq_low_hz, speaker.freq_high_hz)
  trace.push({
    step: 3,
    label: 'Octave bands inside the speaker\'s range',
    tex: `\\log_2\\frac{\\min(${speaker.freq_high_hz},\\,${round(REQUIRED_SPAN_HZ[1], 0)})}{\\max(${speaker.freq_low_hz},\\,${round(REQUIRED_SPAN_HZ[0])})}`,
    value: `${bands.filter((b) => b.covered).length} of ${bands.length} bands`,
    result_tex: `= ${covered_octaves.toFixed(2)}\\ \\text{of}\\ ${REQUIRED_OCTAVES.toFixed(0)}\\ \\text{octaves} \\quad (\\textbf{${bands.filter((b) => b.covered).length} of ${bands.length} bands})`,
    source: 'bmr_analysis',
  })

  if (!freqKnown) {
    caveats.push({
      id: 'freq_unknown',
      text: 'No frequency range was entered, so the octave bands were not checked. A speakerphone in voice mode, for example, may not play the 125 Hz band.',
      uncertainty_db: 0,
    })
  }
  const missingCritical = bands.filter((b) => b.critical && !b.covered)
  const missingOther = bands.filter((b) => !b.critical && !b.covered)
  const partialBands = bands.filter((b) => b.partial)
  // A band at the edge of the range and a small driver together: the case where the edge band really does run out.
  const weakEdge = partialBands.length > 0 && speaker.woofer_mm !== null && speaker.woofer_mm < SMALL_WOOFER_MM
  if (missingCritical.length > 0) {
    caveats.push({
      id: 'missing_rt_band',
      text: `The ${missingCritical.map((b) => b.centre_hz + ' Hz').join(' and ')} band is outside the speaker's range. The reverberation time is built from 500 Hz and 1 kHz, so no reverberation time can be returned.`,
      uncertainty_db: 0,
    })
  }
  if (missingOther.length > 0) {
    caveats.push({
      id: 'missing_bands',
      text: `Bands outside the speaker's range: ${missingOther.map((b) => b.centre_hz + ' Hz').join(', ')}. They drop out of the report.`,
      uncertainty_db: 0,
    })
  }
  if (partialBands.length > 0) {
    caveats.push({
      id: 'partial_bands',
      text: `The ${partialBands.map((b) => b.centre_hz + ' Hz').join(' and ')} band is at the edge of the stated range (${speaker.freq_low_hz}–${speaker.freq_high_hz} Hz). A stated limit is where the output is a few dB down, not where it stops, so the band is measured but weaker, and it can drop out in a noisy room.`,
      uncertainty_db: 0,
    })
  }
  const weakLow = bands.filter((b) => b.covered && b.centre_hz <= 250 && b.snr_db < SNR_GATE_DB)
  if (weakLow.length > 0 && Number.isFinite(sweep_level_1m_db)) {
    caveats.push({
      id: 'low_band_snr',
      text: `Room noise is highest in the low bands, so ${weakLow.map((b) => b.centre_hz + ' Hz').join(' and ')} can be dropped even where the reverberation time is fine.`,
      uncertainty_db: 0,
    })
  }
  if (speaker.woofer_mm !== null && speaker.woofer_mm < SMALL_WOOFER_MM) {
    caveats.push({
      id: 'small_woofer',
      text: `A ${speaker.woofer_mm} mm driver reaches its excursion limit first at low frequencies, so the 125 Hz and 250 Hz bands run out before the rest. The datasheet range will still look correct.`,
      uncertainty_db: 0,
    })
  }

  // --- the full result: what the MOS score needs ----------------------------
  const lowMissing = bands.filter((b) => (BASS_RATIO_BANDS_HZ as readonly number[]).includes(b.centre_hz) && !b.covered)
  const lowBands = lowMissing.length === 0
  const halfWidths = fullHalfWidths(band_db)
  const fm = fullMargins(r)
  // Judged on all three parts even when a low band is outside the range: the size follows the level.
  const fullParts: ('rt' | 'b125' | 'b250')[] = ['rt', 'b125', 'b250']
  const fullStatus: Status = !Number.isFinite(sweep_level_1m_db) || !lowBands || missingCritical.length > 0
    ? 'no'
    : fullParts.every((k) => fm[k] >= halfWidths[k])
      ? 'yes'
      : fullParts.some((k) => fm[k] <= -halfWidths[k])
        ? 'no'
        : 'borderline'
  const binding = fullParts.reduce((a, k) => (fm[k] / halfWidths[k] < fm[a] / halfWidths[a] ? k : a), fullParts[0])
  const fullSize = missingCritical.length === 0
  const full: FullResult = {
    status: fullStatus,
    max_area_m2: fullSize ? maxFullAreaM2(sweep_level_1m_db, room.noise_floor_db, room.height_m, room.usage, band_db) : 0,
    bass_ratio_possible: lowBands,
    area_range_m2: fullSize
      ? [
          maxFullAreaM2(sweep_level_1m_db, room.noise_floor_db, room.height_m, room.usage, band_db, 1),
          maxFullAreaM2(sweep_level_1m_db, room.noise_floor_db, room.height_m, room.usage, band_db, -1),
        ]
      : [0, 0],
    binding: binding === 'rt' ? 'rt' : binding === 'b125' ? 125 : 250,
    margins: fm,
  }
  if (lowMissing.length > 0) {
    caveats.push({
      id: 'no_bass_ratio',
      text: `The ${lowMissing.map((b) => b.centre_hz + ' Hz').join(' and ')} band is outside the loudspeaker's range, so the MOS score is calculated without its Bass Ratio, which needs a reverberation time at 125 Hz and 250 Hz.`,
      uncertainty_db: 0,
    })
  }
  if (lowBands && full.binding !== 'rt' && fullStatus !== 'yes' && Number.isFinite(sweep_level_1m_db)) {
    caveats.push({
      id: 'low_band_decides',
      text: `The ${full.binding} Hz band decides this answer, and the loudspeaker's low end is not what decides it: rooms are about ${round(bandNoise(0, full.binding) - bandNoise(0, 500))} dB noisier there than at 500 Hz, and a single microphone position varies by several dB. Expect the Bass Ratio to be missing in some recordings.`,
      uncertainty_db: 0,
    })
  }
  const max_area_display_m2 = maxDisplayAreaM2(room.height_m)
  if (r.volume_m3 > MAX_VOLUME_M3) {
    caveats.push({
      id: 'beyond_volume',
      text: `${round(r.volume_m3, 0)} m³ is above the ${MAX_VOLUME_M3} m³ this check covers, the largest volume DIN 18041 states its A4 target for. The result is an extrapolation.`,
      uncertainty_db: 0,
    })
  }

  // --- the room, read against what is known --------------------------------
  if (!(room.usage in DIN18041_TARGET_RT)) {
    caveats.push({
      id: 'unknown_usage',
      text: `"${room.usage}" is not a DIN 18041 usage type; A3 was used for the reverberation time.`,
      uncertainty_db: 0,
    })
  }
  if (r.rt_s > LONG_RT_S) {
    caveats.push({
      id: 'long_rt',
      text: `With a reverberation time of ${round(r.rt_s, 2)} s the decay is still audible late in the recording, where the analysis measures the noise. The SNR it reaches can then be lower than shown here.`,
      uncertainty_db: 0,
    })
  }
  // Fires on every size the answer STATES, not only on the room the customer picked: the headline and the
  // "rough estimate" range both quote sizes far above anything BMR has measured, and a caveat that waited for
  // someone to type a big room would miss all of them.
  const reliableArea = tiers.find((t) => t.key === 'reliable')?.max_area_m2 ?? 0
  const largestStated = Math.max(room.area_m2, full.max_area_m2, full.area_range_m2[1], reliableArea)
  if (largestStated > FEW_MEASUREMENTS_ABOVE_M2) {
    caveats.push({
      id: 'few_measurements',
      text: `${LARGEST_MEASURED_ROOM_M2} m² is the largest room BMR has measured, and there is little data above ${FEW_MEASUREMENTS_ABOVE_M2} m². A larger size here is what the model says, not something that has been checked.`,
      uncertainty_db: 0,
    })
  }
  if (r.d > DIN18041_LONG_DISTANCE_M) {
    caveats.push({
      id: 'din_long_distance',
      text: `The far corner is ${round(r.d)} m from a centred source. DIN 18041 5.2 names about ${DIN18041_LONG_DISTANCE_M} m as the distance beyond which a source without reinforcement is at a disadvantage.`,
      uncertainty_db: 0,
    })
  }
  const [dinLo, dinHi] = DIN18041_VOLUME_RANGE[room.usage] ?? DIN18041_VOLUME_RANGE.A3
  if (rt_provenance === 'derived' && (r.volume_m3 < dinLo || r.volume_m3 >= dinHi)) {
    caveats.push({
      id: 'din_out_of_range',
      text: `${round(r.volume_m3)} m³ is outside the ${dinLo}–${dinHi} m³ range DIN 18041 states ${room.usage} for; the reverberation time is an extrapolation.`,
      uncertainty_db: 0,
    })
  }
  if (r.d < min_distance_m) {
    caveats.push({
      id: 'mic_too_close',
      text: `At ${round(r.d)} m the microphone is closer than the analysis wants in a room this size (${round(min_distance_m)} m), which makes its check stricter than shown here.`,
      uncertainty_db: 0,
    })
  }
  if (status !== 'no' && margin_db < band_db) {
    caveats.push({
      id: 'full_volume',
      text: 'It only just gets there, so play at full volume on a full battery. A limiter changes the gain during the sweep and the analysis cannot separate that out.',
      uncertainty_db: 0,
    })
  }
  if (speaker.connection === 'bluetooth' || speaker.connection === 'unknown') {
    caveats.push({
      id: 'bluetooth_only',
      text: "Over Bluetooth the speaker's own processing stays in the path. The BMR pipeline is built for that, but a wired input removes it where there is one.",
      uncertainty_db: 0,
    })
  }

  const confidence: Result['confidence'] =
    margin_uncertainty_db <= 1 ? 'high' : margin_uncertainty_db <= 3.5 ? 'medium' : 'low'
  const confidence_reason =
    margin_uncertainty_db === 0
      ? 'Level from the datasheet'
      : spl_at_1m_provenance === 'derived'
        ? 'No maximum level published — estimated from the wattage'
        : 'Datasheet does not state the measuring distance'

  // --- the answer for the user's room --------------------------------------
  const gate = tiers[0]
  const where = `a ${round(room.area_m2, 0)} m² room at ${room.noise_floor_db} dB(A)`
  const upTo =
    max_area_m2 >= AREA_SEARCH_MAX_M2 ? `in rooms well beyond ${AREA_SEARCH_MAX_M2} m²` : max_area_m2 > 0 ? `up to about ${max_area_m2} m²` : 'only in quieter rooms'
  const warning = r.snr_rt >= SNR_CLEAN_DB ? 'without a noise warning' : 'possibly with a "close to noise floor" warning'
  const goal: Record<string, string> = {
    compatible: 'a reverberation time',
    reliable: 'a reverberation time with margin',
    clean: 'a reverberation time without a noise warning',
    t30: 'T30 as well',
  }
  let verdict: string
  let recommendation: string
  let light: Result['light']
  if (missingCritical.length > 0) {
    light = 'red'
    verdict = 'Does not work'
    recommendation =
      'It cannot play the 500 Hz and 1 kHz bands the reverberation time is built from. Check whether a voice mode is switched on.'
  } else if (!Number.isFinite(spl_at_1m_db)) {
    light = 'yellow'
    verdict = 'No room size'
    recommendation = 'Its datasheet gives neither a maximum sound level nor a wattage, so there is no room size. The frequency bands below still hold.'
  } else if (gate.status === 'no') {
    light = 'red'
    verdict = 'Does not work in this room'
    recommendation = `About ${round(-gate.margin_db, 0)} dB short in ${where}. A quieter or smaller room, or a louder loudspeaker, is needed.`
  } else if (selected.status === 'yes') {
    light = missingOther.length === 0 && !weakEdge && freqKnown ? 'green' : 'yellow'
    verdict = 'Works in this room'
    recommendation = `The BMR analysis should return ${goal[selected.key]} in ${where}${selected.key === 'compatible' || selected.key === 'reliable' ? `, ${warning}` : ''}.`
  } else if (selected.status === 'borderline') {
    light = 'yellow'
    verdict = 'Borderline in this room'
    recommendation =
      margin_db >= 0
        ? `Probably ${goal[selected.key]} in ${where}, but close enough to the limit that it can go either way.`
        : `At the limit for ${goal[selected.key]} in ${where}. ${gate.status === 'yes' ? 'Expect a reverberation time, possibly with a noise warning.' : 'It may ask for a re-record.'} ${selected.label} ${upTo}.`
  } else {
    light = 'yellow'
    verdict = 'Works, with warnings'
    recommendation = `The BMR analysis will probably return a reverberation time in ${where}, but not ${goal[selected.key]}. ${selected.label} ${upTo}.`
  }
  // Marked down on how often BMR's recordings actually lost the band, not on the width of the borderline zone:
  // that width is mostly room modes, so it made every loudspeaker amber for something none of them controls.
  const lowBandSnr = Math.min(r.snr_125, r.snr_250)
  if (Number.isFinite(spl_at_1m_db) && missingCritical.length === 0 && gate.status !== 'no' && lowBands && lowBandSnr < BASS_RATIO_SAFE_SNR_DB) {
    const band = r.snr_125 <= r.snr_250 ? 125 : 250
    recommendation += ` The ${band} Hz band ${lowBandSnr < LOW_BAND_SNR_DB ? 'will probably' : 'may'} drop out, and the MOS score is then calculated without its Bass Ratio.`
    if (light === 'green') light = 'yellow'
  }
  if (Number.isFinite(spl_at_1m_db) && missingCritical.length === 0 && missingOther.length > 0) {
    recommendation += ` The ${missingOther.map((b) => b.centre_hz + ' Hz').join(' and ')} band will be missing.`
  }

  // --- a room larger than the check covers ----------------------------------
  if (Number.isFinite(spl_at_1m_db) && missingCritical.length === 0 && r.volume_m3 > MAX_VOLUME_M3) {
    light = 'yellow'
    verdict = 'Outside this check'
    recommendation = `${round(r.volume_m3, 0)} m³ is larger than the ${MAX_VOLUME_M3} m³ this check covers. A room this size needs a measurement to know.`
  }
  const A = round(room.area_m2, 0)
  const room_headline: string = {
    // "selected" rather than a bare size: the headline above quotes a different number, and without it nobody
    // can tell that this one came from the room control rather than from the loudspeaker.
    'Works in this room': `Works in the selected ${A} m² room`,
    'Borderline in this room': `Borderline in the selected ${A} m² room`,
    'Works, with warnings': `Works with warnings in the selected ${A} m² room`,
    'Does not work in this room': `Does not work in the selected ${A} m² room`,
    'Outside this check': `The selected room (${round(r.volume_m3, 0)} m³) is outside this check`,
  }[verdict] ?? verdict

  // --- the headline: which room sizes ---------------------------------------
  // The full result, whichever tier the user selected: a reverberation time with margin (28 dB) plus the 125 Hz
  // and 250 Hz bands the MOS score's Bass Ratio needs. BMR measured the Jabra Speak2 75 in a 28 m² room at
  // 37–39 dB(A): 31 dB in the RT bands, and 125 Hz at 29.8 and 23.6 dB, so one of two recordings lost the Bass Ratio.
  const works = tiers.find((t) => t.key === 'reliable')!
  const clean = tiers.find((t) => t.key === 'clean')!
  const cap = max_area_display_m2
  const capped = (a: number) => (a >= cap ? `${cap} m²` : `about ${a} m²`)
  const smallestPreset = Math.min(...ROOM_CLASSES.map((c) => c.area_m2))
  let headline: string
  let headline_text: string
  let headline_range = ''
  let headline_light: Result['light']
  if (!Number.isFinite(spl_at_1m_db) || missingCritical.length > 0) {
    headline = verdict
    headline_text = recommendation
    headline_light = missingCritical.length > 0 ? 'red' : 'yellow'
  } else if (gate.max_area_m2 === 0) {
    headline = 'Too quiet for a measurement'
    headline_text = `Even in a small room at ${room.noise_floor_db} dB(A) background it stays below what the BMR analysis needs.`
    headline_light = 'red'
  } else {
    const bg = `${room.noise_floor_db} dB(A) background`
    let span: [number, number]
    if (!lowBands) {
      headline = full.max_area_m2 > 0 ? `Rooms up to ${capped(full.max_area_m2)}, without Bass Ratio` : `Small rooms only, without Bass Ratio`
      headline_text = `At ${bg}, but without Bass Ratio: the ${lowMissing.map((b) => b.centre_hz + ' Hz').join(' and ')} band is outside its range.`
      span = full.max_area_m2 > 0 ? full.area_range_m2 : gate.area_range_m2
    } else if (full.max_area_m2 === 0) {
      headline = works.max_area_m2 > 0 ? `No full result, reverberation time up to ${capped(works.max_area_m2)}` : `Small rooms only, with warnings`
      headline_text = `At ${bg} the 125 Hz or 250 Hz band is too weak for the Bass Ratio in any room size.`
      span = works.max_area_m2 > 0 ? works.area_range_m2 : gate.area_range_m2
    } else if (r.volume_m3 > MAX_VOLUME_M3) {
      headline = `Rooms up to ${capped(full.max_area_m2)}`
      headline_text =
        `This check answers up to ${MAX_VOLUME_M3} m³ (${cap} m² at ${room.height_m} m). A larger room has to be measured. ` +
        (clean.max_area_m2 >= cap
          ? 'No noise warning anywhere it does cover.'
          : clean.max_area_m2 === 0
            ? 'Expect a noise warning.'
            : `No noise warning up to ${capped(clean.max_area_m2)}.`)
      span = full.area_range_m2
    } else {
      headline = `Rooms up to ${capped(full.max_area_m2)}`
      // Three cases, and every one of them says where the noise warning stands: silence there reads as if the
      // question had not been asked. At the cap the headline is the largest room the check covers, not the largest
      // the model reaches, and saying so is what stops it looking like a contradiction next to a smaller number.
      headline_text =
        clean.max_area_m2 >= cap
          ? `Full result with Bass Ratio and no noise warning anywhere this check covers, up to ${cap} m² at ${bg}.`
          : `Full result with Bass Ratio${full.max_area_m2 >= cap ? ` up to the ${cap} m² this check covers,` : ''} at ${bg}.` +
            (clean.max_area_m2 === 0 ? ' Expect a noise warning.' : ` No noise warning up to ${capped(clean.max_area_m2)}.`)
      span = full.area_range_m2
    }
    const hi = Math.min(span[1], cap)
    const upper = span[1] >= cap ? `${cap}+` : `${hi}`
    // Every uncertain part moved to its cautious and its optimistic end. Not a probability.
    headline_range =
      span[0] >= cap
        ? `Rough estimate: ${cap}+ m².`
        : span[0] > 0
          ? `Rough estimate: ${span[0]} to ${upper} m².`
          : `Rough estimate: up to ${upper} m², not certain even in a small room.`
    headline_light = !lowBands || full.max_area_m2 < smallestPreset || missingOther.length > 0 || weakEdge || !freqKnown ? 'yellow' : 'green'
    if (full.max_area_m2 >= cap) {
      caveats.push({
        id: 'check_cap',
        text: `The check stops at ${MAX_VOLUME_M3} m³ (${cap} m² at ${room.height_m} m), the largest volume DIN 18041 states its A4 target for.`,
        uncertainty_db: 0,
      })
    }
  }
  if (Number.isFinite(spl_at_1m_db) && missingCritical.length === 0 && weakEdge) {
    headline_text += ` ${partialBands.map((b) => b.centre_hz + ' Hz').join(' and ')} may drop out.`
  }
  // Bands already named by the "without Bass Ratio" headline are not repeated.
  const unnamed = missingOther.filter((b) => lowBands || !lowMissing.includes(b))
  if (Number.isFinite(spl_at_1m_db) && missingCritical.length === 0 && unnamed.length > 0) {
    headline_text += ` The ${unnamed.map((b) => b.centre_hz + ' Hz').join(' and ')} band will be missing.`
  }

  return {
    speaker,
    room,
    spl_at_1m_db,
    spl_at_1m_provenance,
    sweep_level_1m_db,
    distance_m: r.d,
    min_distance_m,
    volume_m3: r.volume_m3,
    expected_rt_s: r.rt_s,
    rt_provenance,
    level_at_mic_db: r.level,
    direct_db,
    target_snr_db,
    noise_500_db,
    noise_1000_db,
    snr_500_db: r.snr_500,
    snr_1000_db: r.snr_1000,
    snr_rt_db: r.snr_rt,
    binding_band_hz: r.binding,
    margin_uncertainty_db,
    band_db,
    margin_db,
    status,
    tiers,
    full,
    max_area_display_m2,
    snr_125_db: r.snr_125,
    snr_250_db: r.snr_250,
    best_tier,
    reach,
    max_area_m2,
    bands,
    covered_octaves,
    required_octaves: REQUIRED_OCTAVES,
    confidence,
    confidence_reason,
    caveats,
    trace,
    light: headline_light,
    headline,
    headline_text,
    headline_range,
    room_light: light,
    room_verdict: verdict,
    room_headline,
    room_recommendation: recommendation,
  }
}
