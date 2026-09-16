/**
 * Every constant the check uses, with where it came from.
 *
 * One line per constant, a pointer to the document that argues for it, and nothing derived inline.
 * The numbers come from BMR's own measurement data and from the named standards; the queries and
 * analyses behind them are kept internally, together with the method notes.
 */

// --- Step 1: what the BMR analysis requires ----------------------------------
// All three are thresholds on ONE quantity: the per-octave-band SNR the BMR analysis computes —
// the level at which the integrated noise sits on the Schroeder energy decay curve.
export const SNR_GATE_DB = 25 // below this in 500 Hz or 1 kHz: "No RTs calculated"
/**
 * The headline tier: the gate plus 3 dB. DESIGN CHOICE (Benny, 2026-09-15), own, no source. A result that
 * only just clears 25 dB is not what a customer means by "it works"; 3 dB is about 1.5 × the spread of real
 * rooms' absorption area for their size (1.9 dB, from BMR measurements). Between this and
 * SNR_CLEAN_DB the analysis still warns.
 */
export const SNR_RELIABLE_DB = 28
export const SNR_CLEAN_DB = 35 // below this: "Regression range … close to noise floor"
export const SNR_T30_DB = 38 // below this T30 is dropped

export type TierKey = 'compatible' | 'reliable' | 'clean' | 't30'

export interface Tier {
  key: TierKey
  /** Customer-facing name. */
  label: string
  snrDb: number
  /** What clearing this tier actually buys you. */
  means: string
  sourceId: string
}

/** The ladder, weakest first. A speaker's verdict is the highest tier it clears. */
export const TIERS: Tier[] = [
  {
    key: 'compatible',
    label: 'Minimum',
    snrDb: SNR_GATE_DB,
    means: '500 Hz and 1 kHz only. The BMR analysis just returns a reverberation time, with a noise warning; below this it asks for a re-record.',
    sourceId: 'bmr_analysis',
  },
  {
    key: 'reliable',
    label: 'Works',
    snrDb: SNR_RELIABLE_DB,
    means: '500 Hz and 1 kHz only: a reverberation time with 3 dB to spare. The analysis can still warn that the signal is close to the noise floor.',
    sourceId: 'bmr_analysis',
  },
  {
    key: 'clean',
    label: 'No noise warning',
    snrDb: SNR_CLEAN_DB,
    means: 'No noise warning in the 500 Hz and 1 kHz bands. Low bands such as 125 Hz can still warn.',
    sourceId: 'bmr_analysis',
  },
  {
    key: 't30',
    label: 'T30 available',
    snrDb: SNR_T30_DB,
    means: 'T30 is returned as well.',
    sourceId: 'bmr_analysis',
  },
]

/** What the app scores against unless the customer opens the advanced panel. */
export const DEFAULT_TIER: TierKey = 'reliable'

// --- Step 2: from the received sweep level to the SNR of the BMR analysis ----------
/**
 * SNR_b = L_mic − L_N,b + this. The gain the swept measurement signal has over the analysis window,
 * minus the share of a logarithmic sweep's energy that falls in one octave.
 * DERIVED, and checked 2026-09-15 by running the BMR analysis on synthetic rooms (T = 0.4 and 0.8 s, three
 * levels): within ±1 dB from 500 Hz to 8 kHz.
 */
export const SWEEP_ANALYSIS_GAIN_DB = -3.91

/**
 * Broadband RMS level a sine sweep reaches at full volume, relative to the datasheet maximum SPL.
 * The least certain number in the tool, and NOT independently supported:
 *   - Crest factor does not give −12. Manufacturer max-SPL figures are mostly pink noise at full
 *     drive, reported as the highest peak (Weinzierl, Handbuch der Audiotechnik, 2nd ed., ch. 17,
 *     p. 431). A sine at that peak has an RMS 3 dB lower, so crest factor alone puts k near −3 dB
 *     for a peak rating (up to +9 dB for an RMS rating of a ~12 dB crest signal), before limiters.
 *   - BMR measurements, calibrated recordings: as played (volume never recorded, so lower bounds on the full-volume k),
 *     the Jabra Speak2 75 delivered −15.0 … −12.1 dB (two recordings, 1 m to far corner), the Jabra Speak2 40
 *     −3.5 … +1.4 dB, the Cisco Room Kit EQ −21.2 … −14.0 dB (its rating has no distance; 1 m assumed).
 * DESIGN CHOICE: −12 dB, the Jabra Speak2 75 at the far-corner reading, cautious against crest factor and against the
 * Speak2 40. A full-volume measurement per device replaces it.
 */
export const SWEEP_LEVEL_OFFSET_DB = -12

/**
 * Octave-band background noise relative to the A-weighted background level (L90) of the BMR measurement. A hand-held
 * meter showing LAeq reads higher, so entering that value makes the prediction err low.
 * BMR measurements: 157 calibrated recordings, median of
 * the octave-band level minus the A-weighted level (L90). Interquartile range ±2 dB at 500 Hz / 1 kHz.
 */
export const NOISE_BAND_OFFSET_DB: Record<number, number> = {
  125: 0.1,
  250: -1.7,
  500: -4.7,
  1000: -7.2,
  2000: -8.7,
  4000: -11.2,
  8000: -13.9,
}

// --- How sure the prediction is -----------------------------------------
/**
 * Half-width of the borderline zone, before datasheet uncertainty. Two independent parts:
 *   - model error: spread of predicted vs stored SNR at fixed volume, 4.5 dB, the upper end of 4.2–4.6 dB from an
 *     earlier recomputation (BMR measurements). No saved query yet: OPEN, and kept with the internal method notes.
 *   - the sweep offset k: the span of per-device medians at the far-corner reading, the geometry the tool itself
 *     assumes: −15.4 (Room Kit EQ) … +0.3 dB (Jabra Speak2 40), from BMR measurements. Uniform over it:
 *     15.7 / √12 = 4.5 dB. DESIGN CHOICE; single recordings span −21.2 … +1.4 dB, but they mix device and volume.
 * √(4.5² + 4.5²) = 6.4 dB. Shrinks when k is measured per device.
 */
export const MODEL_ERROR_DB = 4.5
export const SWEEP_OFFSET_UNCERTAINTY_DB = (0.3 - -15.4) / Math.sqrt(12)
export const PREDICTION_UNCERTAINTY_DB = Math.hypot(MODEL_ERROR_DB, SWEEP_OFFSET_UNCERTAINTY_DB)
/** BMR measurements: of 77 rooms with a stored SNR, 63 are ≤ 30 m² and 7 exceed 45 m². */
export const FEW_MEASUREMENTS_ABOVE_M2 = 45
/**
 * Above this the late decay reaches the tail of the analysis window, where the noise is estimated, so the
 * SNR saturates below the prediction (seen on simulated rooms at T = 0.8 s and high SNR). DESIGN CHOICE,
 * a flag only; the BMR analysis documents record the window as covering T20 up to about 2 s.
 */
export const LONG_RT_S = 1.2

export const SPEED_OF_SOUND_MS = 343 // m/s   as used by the BMR analysis
export const DEFAULT_Q = 2 // -     the default of the BMR analysis, described there as talker directivity
export const DIFFUSE_COEFF = 25 // -     the 25·T/V reverberant term of the BMR speech level model
export const SABINE_COEFF = 0.161 // s/m  Sabine, A = 0.161·V/T  (standard; used only for the reverberation radius)

/**
 * Largest room the check covers: 500 m³, the upper end of the volume range DIN 18041:2016-03 4.2.3 states the A4
 * target for (30–500 m³; A3 runs to 5000 m³). Converted to floor area with the room's height. BMR measurements: the largest
 * rooms with a stored SNR are 343 and 386 m³, so the cap sits just above what has been measured.
 */
export const MAX_VOLUME_M3 = 500

// --- The full result: the bands the MOS score needs ----------------------
/**
 * The MOS score's Bass Ratio is (T125 + T250)/(T500 + T1000). A band below SNR_GATE_DB returns no T20, and then
 * there is no Bass Ratio. BMR measurements 2026-09-15: all 15 recordings scored without it miss a T20 at 125 or 250 Hz, all
 * 28 scored with it have both.
 */
export const BASS_RATIO_BANDS_HZ = [125, 250] as const
/**
 * How much weaker the sweep arrives in these bands than a flat loudspeaker would, relative to 500 Hz, and the
 * spread of that. BMR measurements: 154 / 157 calibrated recordings of 9 / 10 devices, median and
 * IQR/1.349 of (SNR_b + N_b) − (SNR_500 + N_500). Loudspeaker roll-off, room modes and the analysis's own band
 * dependence together. Not related to driver size in these data, so one value for every loudspeaker.
 */
export const LOW_BAND_LEVEL_OFFSET_DB: Record<number, number> = { 125: -3.6, 250: -1.6 }
export const LOW_BAND_SPREAD_DB: Record<number, number> = { 125: 8.4, 250: 3.9 }
/**
 * 8.4 dB at 125 Hz is the p10–p90 span of the same recordings (21.5 dB) read as a standard deviation, not the
 * interquartile estimate (6.3 dB), which understates a heavy-tailed spread. Most of it is room modes: in the rooms
 * this check covers, the 125 Hz octave lies at or below the Schroeder frequency (2000·√(T/V): about 180 Hz at
 * 15 m², 94 Hz at 100 m²), where a single microphone position varies far more than a diffuse field would.
 */
/**
 * Line the low bands must clear: the gate, where the analysis returns a T20 at all. DESIGN CHOICE (Benny,
 * 2026-09-15): the tool's caution sits in the sweep offset k and the far-corner microphone; a 28 dB line here as
 * well stacked a third margin and cut the Jabra Speak2 75 from about 50 to 20 m². Stated openly: the analysis also
 * drops a band whose decay curve never falls 25 dB — a change of 2026-06-17 that also lowered the band gate from
 * 28 to 25 dB. BMR measurements, recordings from that date, duplicates collapsed: no T20 at 125 Hz in 25 % at 25–28 dB (7 of 28) and 5.3 % at ≥ 28 dB (14 of 264);
 * at 250 Hz 0 of 29 and 1 of 328. So at the headline size the Bass Ratio can still be missing, mostly at 125 Hz.
 */
export const LOW_BAND_SNR_DB = SNR_GATE_DB

/** Largest area the solver looks at. Beyond the room presets it is a statement about the model, not about data. */
export const AREA_SEARCH_MAX_M2 = 1000

/**
 * DIN 18041:2016-03, 4.2.3, equations (1)–(6): T_soll = a·log10(V/m³) + b.
 * BMR measurements: measured T20mid over the A3 target is 0.97 (median, 82 rooms with a stored SNR) to
 * 1.08 (per-room median, 344 rooms), so the target is a fair estimate of these rooms, not only a goal.
 */
export const DIN18041_TARGET_RT: Record<string, [number, number]> = {
  A1: [0.45, 0.07], // Musik                                        30 <= V < 1000 m³
  A2: [0.37, -0.14], // Sprache/Vortrag                              50 <= V < 5000 m³
  A3: [0.32, -0.17], // Unterricht/Kommunikation (bis 1000 m³) /
  //                    Sprache/Vortrag inklusiv (bis 5000 m³)       30 <= V < 5000 m³
  A4: [0.26, -0.14], // Unterricht/Kommunikation inklusiv            30 <= V < 500 m³
  A5: [0.75, -1.0], // Sport                                        200 <= V < 10000 m³
}

/** Volume range each equation is stated for (DIN 18041 4.2.3). Outside it the formula still returns a number the standard does not stand behind. */
export const DIN18041_VOLUME_RANGE: Record<string, [number, number]> = {
  A1: [30, 1000],
  A2: [50, 5000],
  A3: [30, 5000],
  A4: [30, 500],
  A5: [200, 10000],
}

/** DIN 18041 5.2: beyond about 8 m a passive source is at a disadvantage without reinforcement. */
export const DIN18041_LONG_DISTANCE_M = 8
export const DEFAULT_USAGE = 'A3' // what the BMR analysis MOS score is anchored on

// --- Room presets: the customer picks a size, not a geometry -------------
export interface RoomClass {
  key: string
  label: string
  people: string
  area_m2: number
  height_m: number
}

/**
 * From the BMR room estate: room records (rooms up to 2026-08-19),
 * floor area grouped by capacity, non-deleted rooms with both set.
 * Area is the class **p75**, rounded — a speaker sized to the median fails half the rooms,
 * and at n = 30–61 per class a p90 is three to six rooms. Height is the class median.
 *
 *   people   n   median   p75    p90    height
 *   1–4     30   19.6     25.0   40.2   2.90
 *   5–8     61   24.0     33.5   42.6   2.80
 *   9–20    50   43.1     58.5   85.1   2.80
 *   21–50    7   86.2    101.4    —     2.69    n too small: ASSUMED beyond "about 100 m²"
 *   51+      1  215.1       —      —     6.09    one room: ASSUMED
 */
export const ROOM_CLASSES: RoomClass[] = [
  { key: 'huddle', label: 'Huddle room', people: '2–4 people', area_m2: 25, height_m: 2.9 },
  { key: 'meeting', label: 'Meeting room', people: '5–8 people', area_m2: 35, height_m: 2.8 },
  { key: 'conference', label: 'Conference room', people: '9–20 people', area_m2: 60, height_m: 2.8 },
  { key: 'large', label: 'Large meeting space', people: '21–50 people', area_m2: 100, height_m: 3.0 },
]
export const DEFAULT_ROOM_CLASS = 'meeting'

// --- Noise floor ------------------------------------------------------------------------
export interface NoisePreset {
  label: string
  db: number
}
/**
 * BMR measurements (2026-09-15): A-weighted L90 from the 157 calibrated recordings, median per
 * room, 26 rooms (21 of them 15–30 m²). Across rooms p25 28.1, median 30.6, p75 39.1 dB(A); 15–30 m² median
 * 29.6, p75 33.2. 46 % of rooms are at or below 30 dB(A), 65 % at or below 35. Within one room readings
 * spread up to 22 dB between recordings. Peak-normalised recordings carry no usable noise level.
 */
export const NOISE_PRESETS: NoisePreset[] = [
  { label: 'Very quiet — no ventilation running', db: 25 },
  { label: 'Quiet meeting room', db: 30 },
  { label: 'Typical office, ventilation audible', db: 35 },
  { label: 'Busy or open space', db: 40 },
  { label: 'Noisy — fix this before measuring', db: 45 },
]
/**
 * DIN 18041:2016-03 Annex B.3 (informative): recommended L_NA,Bau ≤ 35 dB for A2–A4, operating noise not above it.
 * So the default is a room at DIN's recommended limit. About the p65 of BMR rooms and inside the p75 range of the room presets' rule (15–30 m²
 * p75 33, all rooms p75 39). The median room (≈ 30 dB(A)) would size every loudspeaker for a room half the
 * estate is noisier than.
 */
export const DEFAULT_NOISE_FLOOR_DB = 35

// --- Frequency: what the sweep and the BMR analysis need from a speaker ---------------------
/** Octave band centres the BMR analysis works in. */
export const CENTER_FREQUENCIES = [63, 125, 250, 500, 1000, 2000, 4000, 8000, 15000] as const
/** Indices 0 and 8 are EDGE_BANDS: the app plots 125 Hz – 8 kHz. */
export const REPORTED_BAND_INDICES = [1, 2, 3, 4, 5, 6, 7] as const
/** T20mid is the mean of these two; below the gate here the whole measurement aborts. */
export const RT_BAND_INDICES = [3, 4] as const

/** What the frequency slider offers: 20 Hz to Nyquist of the 48 kHz recording. Input only — scoring uses REQUIRED_SPAN_HZ. */
export const FREQ_INPUT_RANGE_HZ: [number, number] = [20, 24000]

export const SWEEP_NOMINAL_HZ: [number, number] = [80, 24000]
/** …and what it measures, 0.5 %/99.5 % of cumulative energy. */
export const SWEEP_MEASURED_HZ: [number, number] = [84.5, 23300]
export const SAMPLE_RATE_HZ = 48000

/** Octave band edges: f_c/√2 … f_c·√2. */
export function bandEdges(centre: number): [number, number] {
  return [centre / Math.SQRT2, centre * Math.SQRT2]
}

/** The frequency span the speaker has to cover: the reported bands, end to end. */
export const REQUIRED_SPAN_HZ: [number, number] = [
  bandEdges(CENTER_FREQUENCIES[REPORTED_BAND_INDICES[0]])[0],
  bandEdges(CENTER_FREQUENCIES[REPORTED_BAND_INDICES[REPORTED_BAND_INDICES.length - 1]])[1],
]

/** A small bass driver runs out of excursion in the low bands first. Flag only.  ASSUMED */
export const SMALL_WOOFER_MM = 60
