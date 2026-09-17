/**
 * Pinned reference speakers, all from real datasheets opened on 2026-09-01/02.
 * What each publishes and what it does not is recorded in the internal method notes.
 */
import type { Speaker } from './types'

export interface Example {
  id: string
  speaker: Speaker
  why: string
  sourceUrl: string
}

/**
 * Ordered by the room size the check gives them in a standard meeting room, largest first, so the list reads
 * from the most capable down. Recheck it when a level constant moves; EXAMPLES[0] is also the tests' template.
 */
export const EXAMPLES: Example[] = [
  {
    id: 'teufel-mynd',
    speaker: {
      name: 'Teufel MYND',
      spl_peak_db: 95,
      spl_ref_distance_m: 1,
      spl_ref_distance_stated: true,
      freq_low_hz: 52,
      freq_high_hz: 20000,
      power_watt: 35,
      power_kind: 'amplifier',
      woofer_mm: 90,
      connection: 'both',
      bluetooth_codec: 'Bluetooth 5.3',
      note: '2.1: 1 × 90 mm woofer, 2 × 20 mm tweeters, Class D with DSP. 3.5 mm AUX input.',
    },
    why: 'A reference case in which the datasheet states everything the calculation needs: a level with its reference distance, a wattage, driver sizes and a wired input. Nothing has to be assumed, so the result carries no uncertainty from missing data.',
    sourceUrl: 'https://teufel.de/mynd-107002004',
  },
  {
    id: 'cisco-room-bar-pro',
    speaker: {
      name: 'Cisco Room Bar Pro',
      spl_peak_db: 97,
      spl_ref_distance_m: 1,
      spl_ref_distance_stated: false,
      freq_low_hz: 70,
      freq_high_hz: 22000,
      power_watt: null,
      power_kind: null,
      woofer_mm: null,
      connection: 'unknown',
      bluetooth_codec: 'n/a (room system)',
      note: 'Cisco data sheet (updated 27 April 2026): "Max output Sound Pressure Level 97 dB", no distance; "Loudspeaker system frequency response 70 Hz to 22 kHz [+ 3 / -6 dB]"; three full-range drivers and a dual woofer section.',
    },
    why: 'A larger room system with a dedicated woofer section. Like the Room Bar it gives its level without a distance, so 1 m is assumed and the result carries 3 dB more doubt.',
    sourceUrl: 'https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/webex-room-series/room-bar-pro-ds.html',
  },
  {
    id: 'bo-beosound-explore',
    speaker: {
      name: 'Beosound Explore',
      spl_peak_db: 91,
      spl_ref_distance_m: 1,
      spl_ref_distance_stated: true,
      freq_low_hz: 56,
      freq_high_hz: 22700,
      power_watt: 60,
      power_kind: 'amplifier',
      woofer_mm: 46,
      connection: 'bluetooth',
      bluetooth_codec: 'Bluetooth 5.2',
      note: 'B&O product sheet: max loudness 91 dB SPL @ 1 m; frequency range 56 – 22 700 Hz; 2 × 30 W Class D, 2 × 1.8" full-range drivers, 360°. No AUX input.',
    },
    why: 'A BMR-recommended measurement speaker with a manufacturer-published maximum level. Its 56 Hz low end is stated without a tolerance, and two 46 mm full-range drivers have no dedicated woofer, so the 125 Hz band is where it runs out first.',
    sourceUrl: 'https://assets.ctfassets.net/8cd2csgvqd3m/18ihLlRE5rxB5S2NIDpPCi/e0382bc943290a0ededb07bb530be8ee/Beosound_Explore_Product_Sheet_English_0001_Feb2021.pdf',
  },
  {
    id: 'cisco-room-bar',
    speaker: {
      name: 'Cisco Room Bar',
      spl_peak_db: 93,
      spl_ref_distance_m: 1,
      spl_ref_distance_stated: false,
      freq_low_hz: 100,
      freq_high_hz: 20000,
      power_watt: null,
      power_kind: null,
      woofer_mm: null,
      connection: 'unknown',
      bluetooth_codec: 'n/a (room system)',
      note: 'Datasheet gives max output 93 dB SPL but does not say at what distance.',
    },
    why: 'A room system that publishes a level with no reference distance. The app assumes 1 m and says so — if Cisco meant 0.5 m, every figure is 6 dB optimistic.',
    sourceUrl:
      'https://www.cisco.com/c/en/us/products/collateral/collaboration-endpoints/webex-room-series/webex-room-bar-ds.html',
  },
  {
    id: 'jbl-xtreme-4',
    speaker: {
      name: 'JBL Xtreme 4',
      spl_peak_db: null,
      spl_ref_distance_m: 1,
      spl_ref_distance_stated: false,
      freq_low_hz: 44,
      freq_high_hz: 20000,
      power_watt: 70,
      power_kind: 'amplifier',
      woofer_mm: 70,
      connection: 'bluetooth',
      bluetooth_codec: 'Bluetooth 5.3, A2DP 1.3',
      note: 'Official spec sheet (Harman, 2024): 2 × 70 mm woofers, 2 × 20 mm tweeters, 44 Hz – 20 kHz. Rated output 2 × 20 W + 2 × 15 W RMS on battery (70 W) and 2 × 30 W + 2 × 20 W on AC (100 W). The battery figure is entered here; it ships with a mains adaptor, so measuring it plugged in and entering 100 W is worth 1.5 dB. No maximum SPL and no sensitivity are published anywhere on the sheet. USB-C in and out, no analogue input. The "signal-to-noise ratio > 80 dB" on the sheet is the electronics\' own noise floor and has nothing to do with the signal-to-noise ratio this check predicts.',
    },
    why: 'A loudspeaker BMR measures with. JBL publishes no maximum SPL for it, so its level is estimated from the 70 W battery rating and the room size carries the wider doubt that goes with that. The sheet also describes a feature that "analyzes the incoming signal in real time … pushes the driver to its maximum capability" and "reduces distortion even at high volume": that is a gain that changes during the sweep, and a swept measurement assumes the loudspeaker does not change while it plays. Switch that and any playtime-extending mode off before measuring, or the reverberation time is measured through a moving target.',
    sourceUrl:
      'https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwfce87bd2/pdfs/JBL_Xtreme_4_Specsheet_EN_(with_Adaptor).pdf',
  },
  {
    id: 'jbl-portable-average',
    speaker: {
      name: 'Typical JBL portable (€60–150)',
      spl_peak_db: null,
      spl_ref_distance_m: 1,
      spl_ref_distance_stated: false,
      freq_low_hz: 73,
      freq_high_hz: 20000,
      power_watt: 26,
      power_kind: 'amplifier',
      woofer_mm: 58,
      connection: 'bluetooth',
      bluetooth_codec: 'SBC / AAC',
      note: 'Mean of the JBL Clip 5, Flip 6 and Charge 5 as published: 95/63/60 Hz low ends, 7/30/40 W, and 45 mm / 44×80 mm / 53×93 mm drivers (the last two converted to equal-area circular diameters of 59 and 70 mm). None of the three publishes a maximum SPL.',
    },
    why: 'A class average for portable Bluetooth loudspeakers in the €60–150 range, built from what the manufacturer publishes — and JBL publishes no maximum SPL for any of them, so the level is estimated from the wattage. That is the point of this example: it carries the widest doubt of the set, and independent reviewers measuring the Flip 6 report figures more than 10 dB apart.',
    sourceUrl: 'https://www.jbl.com/bluetooth-speakers/',
  },
  {
    id: 'jabra-speak2-75',
    speaker: {
      name: 'Jabra Speak2 75 (music mode)',
      spl_peak_db: 88,
      spl_ref_distance_m: 0.5,
      spl_ref_distance_stated: true,
      freq_low_hz: 80,
      freq_high_hz: 20000,
      power_watt: null,
      power_kind: null,
      woofer_mm: 65,
      connection: 'both',
      bluetooth_codec: 'AAC, SBC, mSBC, CVSD',
      note: 'Speak mode narrows to 150 Hz – 14 kHz, which loses the 125 Hz band.',
    },
    why: 'A conference speakerphone that publishes its reference distance — 88 dB at 0.5 m, so 82 dB at 1 m — and no wattage at all.',
    sourceUrl: 'https://www.jabra.com/_/media/Jabra_VXi_Product-Documentation/Jabra-Speak2-75/Technical-specifications/RevC/EN-Speak2-75-Tech-Spechs-180924.pdf',
  },
  {
    id: 'jabra-speak2-75-speak',
    speaker: {
      name: 'Jabra Speak2 75 (speak mode)',
      spl_peak_db: 88,
      spl_ref_distance_m: 0.5,
      spl_ref_distance_stated: true,
      freq_low_hz: 150,
      freq_high_hz: 14000,
      power_watt: null,
      power_kind: null,
      woofer_mm: 65,
      connection: 'both',
      bluetooth_codec: 'AAC, SBC, mSBC, CVSD',
    },
    why: 'The same speaker in the mode it ships in. 150 Hz is above the bottom of the 125 Hz octave, so that band drops out — a setting, not a hardware limit.',
    sourceUrl: 'https://www.jabra.com/_/media/Jabra_VXi_Product-Documentation/Jabra-Speak2-75/Technical-specifications/RevC/EN-Speak2-75-Tech-Spechs-180924.pdf',
  },
  {
    id: 'jbl-clip-5',
    speaker: {
      name: 'JBL Clip 5',
      spl_peak_db: null,
      spl_ref_distance_m: 1,
      spl_ref_distance_stated: false,
      freq_low_hz: 95,
      freq_high_hz: 20000,
      power_watt: 7,
      power_kind: 'amplifier',
      woofer_mm: 45,
      connection: 'bluetooth',
      bluetooth_codec: 'SBC',
      note: 'The cheap end of the range, about €60. 7 W, one 45 mm driver, 95 Hz – 20 kHz.',
    },
    why: 'Its stated 95 Hz sits inside the 125 Hz octave (88.4–177 Hz), so that band is played, but weaker, and a 45 mm driver runs out of excursion in the bands below 250 Hz first: the 125 Hz band may drop out. No maximum SPL is published either, so the level comes from the 7 W rating — which is what puts it an order of magnitude below the 70 W Xtreme 4 rather than beside it.',
    sourceUrl: 'https://www.jbl.com/bluetooth-speakers/CLIP-5.html',
  },
]

export const EMPTY_SPEAKER: Speaker = {
  name: '',
  spl_peak_db: null,
  spl_ref_distance_m: 1,
  spl_ref_distance_stated: false,
  freq_low_hz: 0,
  freq_high_hz: 0,
  power_watt: null,
  power_kind: 'amplifier',
  woofer_mm: null,
  connection: 'unknown',
  bluetooth_codec: '',
}
