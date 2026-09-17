import { useMemo, useState } from 'react'
import { DEFAULT_NOISE_FLOOR_DB, DEFAULT_ROOM_CLASS, DEFAULT_TIER, DEFAULT_USAGE, ROOM_CLASSES } from './lib/constants'
import { EMPTY_SPEAKER, EXAMPLES } from './lib/examples'
import { score } from './lib/scoring'
import type { Room, Speaker } from './lib/types'
import { ResultCard } from './ResultCard'
import { SpeakerForm } from './SpeakerForm'
import styles from './styles.module.css'

const defaultClass = ROOM_CLASSES.find((c) => c.key === DEFAULT_ROOM_CLASS)!

/**
 * The design fixes the room assumptions — a standard meeting room at 35 dB(A), the DIN 18041 limit —
 * and answers per room type instead of asking for a room. The engine still scores against this room.
 */
const DEFAULT_ROOM: Room = {
  class_key: defaultClass.key,
  area_m2: defaultClass.area_m2,
  height_m: defaultClass.height_m,
  noise_floor_db: DEFAULT_NOISE_FLOOR_DB,
  tier: DEFAULT_TIER,
  usage: DEFAULT_USAGE,
  rt_override_s: null,
}

/** Field-by-field, so that editing any one of them drops the example's highlight by itself. */
function same(a: Speaker, b: Speaker): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof Speaker>
  return [...keys].every((k) => a[k] === b[k])
}

export default function LoudspeakerCheck() {
  const [speaker, setSpeaker] = useState<Speaker>(EMPTY_SPEAKER)
  // A frequency range alone is enough to answer the band question; the room size needs a level or a wattage.
  const ready = speaker.spl_peak_db !== null || speaker.power_watt !== null || speaker.freq_low_hz > 0
  const result = useMemo(() => (ready ? score(speaker, DEFAULT_ROOM) : null), [ready, speaker])
  // Highlighted only while the form still holds that example exactly. Clicking it again clears the form.
  const selected = EXAMPLES.find((e) => same(e.speaker, speaker))?.id

  return (
    <div className={styles.root}>
      <section className={styles.shortcut}>
        <p className={styles.shortcutTitle}>Shortcut: pick a loudspeaker we have looked up</p>
        <p className={styles.shortcutSub}>It fills in every step below. Not listed? Skip this and enter the numbers yourself.</p>
        <div className={styles.pills}>
          {EXAMPLES.map((e) => (
            <button
              key={e.id}
              type="button"
              aria-pressed={selected === e.id}
              className={`${styles.pill} ${selected === e.id ? styles.pillActive : ''}`}
              onClick={() => setSpeaker(selected === e.id ? EMPTY_SPEAKER : e.speaker)}
            >
              {e.speaker.name}
            </button>
          ))}
        </div>
      </section>

      <SpeakerForm speaker={speaker} onChange={setSpeaker} />

      <div className={styles.resultFrame}>
        <div className={styles.resultRowGrid}>
          <div className={styles.eqGlyph} aria-hidden>
            =
          </div>
          {result ? (
            <ResultCard result={result} />
          ) : (
            <div>
              <p className={styles.emptyHead}>The answer appears here as soon as step 2 has a number.</p>
              <p className={styles.emptySub}>You can also pick a loudspeaker from the shortcut at the top to see an example.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
