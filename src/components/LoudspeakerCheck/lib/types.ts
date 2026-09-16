import type { TierKey } from './constants'

/** Where a number in the calculation came from. Drives the confidence badges. */
export type Provenance = 'datasheet' | 'assumed' | 'derived'
export type PowerKind = 'amplifier' | 'speaker'
export type Connection = 'bluetooth' | 'wired' | 'both' | 'unknown'
export type PowerMode = 'battery' | 'mains'

export interface Speaker {
  name: string
  /** Required. Nothing else substitutes for an acoustic output level. */
  spl_peak_db: number | null
  spl_ref_distance_m: number
  /** false when the datasheet did not state the reference distance and 1 m was assumed. */
  spl_ref_distance_stated: boolean
  /** Required. */
  freq_low_hz: number
  freq_high_hz: number
  /** Optional. Only used to derive a level when no SPL is published. */
  power_watt: number | null
  power_kind: PowerKind | null
  /** How it will be running during the measurement. Portables publish two ratings. */
  power_mode: PowerMode
  /** Optional. Diameter of the largest (bass) driver, in mm. */
  woofer_mm: number | null
  sensitivity_db_1w_1m: number | null
  sensitivity_estimated: boolean
  connection: Connection
  bluetooth_codec: string
  note?: string
}

export interface Room {
  /** Which preset the customer picked; 'custom' when they typed their own. */
  class_key: string
  area_m2: number
  height_m: number
  /** A-weighted background noise, dB(A). */
  noise_floor_db: number
  tier: TierKey
  usage: string
  rt_override_s: number | null
}

/**
 * One thing the answer rests on. `uncertainty_db` is what not knowing it is worth
 * on the margin, in decibels — not an invented point score. Zero means it affects
 * how the result should be read but not the number itself.
 */
export interface Caveat {
  id: string
  text: string
  uncertainty_db: number
}

export interface TraceLine {
  step: 1 | 2 | 3
  label: string
  /** The working, as LaTeX with the numbers substituted. */
  tex: string
  value: string
  /** Replaces the appended "= value" when the result is not a plain number. */
  result_tex?: string
  source?: string
}

export interface BandCoverage {
  centre_hz: number
  low_hz: number
  high_hz: number
  covered: boolean
  /** Covered, but the loudspeaker's stated limit lies inside the band: measured, weaker, may drop out. */
  partial: boolean
  /** true for the two bands the whole measurement aborts on. */
  critical: boolean
  /** Predicted BMR analysis SNR in this band for a flat loudspeaker, dB. */
  snr_db: number
}

/** One rung of the ladder, evaluated for this speaker and room. */
export interface TierResult {
  key: TierKey
  label: string
  snrDb: number
  means: string
  sourceId: string
  /** yes: margin ≥ band; borderline: within ±band; no: below −band. */
  status: Status
  /** status is 'yes'. */
  cleared: boolean
  /** Predicted SNR − threshold. */
  margin_db: number
  /** Largest floor area at which the central prediction still reaches this threshold. */
  max_area_m2: number
  /** The same at the edges of the borderline zone: [prediction − β, prediction + β]. */
  area_range_m2: [number, number]
}

export type Status = 'yes' | 'borderline' | 'no'

/** The full result: RT bands at 28 dB with margin, plus the 125 Hz and 250 Hz bands the MOS score's Bass Ratio needs. */
export interface FullResult {
  status: Status
  /**
   * Largest floor area at which every part holds, central prediction. When 125 Hz or 250 Hz is outside the
   * loudspeaker's range the size is still judged on the level those bands would get: switching a band off does
   * not make a room bigger. `bass_ratio_possible` then says the Bass Ratio cannot be measured at all.
   */
  max_area_m2: number
  bass_ratio_possible: boolean
  /** The same at the cautious and the optimistic edge of each part's half-width. */
  area_range_m2: [number, number]
  /** The part closest to failing, in units of its own half-width. */
  binding: 'rt' | 125 | 250
  /** Predicted SNR minus threshold: RT bands against 28 dB, low bands against 25 dB. */
  margins: { rt: number; b125: number; b250: number }
}

export interface RoomReach {
  class_key: string
  label: string
  people: string
  area_m2: number
  snr_db: number
  status: Status
  margin_db: number
}

export interface Result {
  speaker: Speaker
  room: Room

  // level
  spl_at_1m_db: number
  spl_at_1m_provenance: Provenance
  /** Conservative broadband sweep level at 1 m: datasheet maximum + SWEEP_LEVEL_OFFSET_DB. */
  sweep_level_1m_db: number

  // room
  distance_m: number
  min_distance_m: number
  volume_m3: number
  expected_rt_s: number
  rt_provenance: Provenance
  /** Direct + reverberant sweep level at the far corner, dB SPL. */
  level_at_mic_db: number
  /** Direct sound alone, for comparison. */
  direct_db: number

  // SNR
  target_snr_db: number
  noise_500_db: number
  noise_1000_db: number
  snr_500_db: number
  snr_1000_db: number
  /** The lower of the two bands the reverberation time is built from. */
  snr_rt_db: number
  binding_band_hz: 500 | 1000
  /** Datasheet uncertainty σ, dB. */
  margin_uncertainty_db: number
  /** Half-width of the borderline zone. The datasheet doubt σ is subtracted from the level instead. */
  band_db: number
  /** snr_rt − target. */
  margin_db: number
  /** The answer for the user's own room at the selected tier. */
  status: Status

  tiers: TierResult[]
  full: FullResult
  /** Largest floor area the check covers at this height (the volume cap as an area). */
  max_area_display_m2: number
  snr_125_db: number
  snr_250_db: number
  best_tier: TierResult | null
  reach: RoomReach[]
  /** Largest floor area for the selected tier, central prediction. */
  max_area_m2: number

  bands: BandCoverage[]
  covered_octaves: number
  required_octaves: number

  confidence: 'high' | 'medium' | 'low'
  confidence_reason: string
  caveats: Caveat[]
  trace: TraceLine[]

  /** The headline: which room sizes it covers, at the selected noise and tier. */
  light: 'green' | 'yellow' | 'red'
  headline: string
  headline_text: string
  /** The size range the borderline zone spans, or '' when there is no size to state. */
  headline_range: string

  /** The optional check of the user's own room. */
  room_light: 'green' | 'yellow' | 'red'
  room_verdict: string
  /** The answer for the chosen room, for the result header, e.g. "Works in a 35 m² room". */
  room_headline: string
  room_recommendation: string
}
