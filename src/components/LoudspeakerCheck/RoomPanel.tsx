import { DEFAULT_NOISE_FLOOR_DB, DEFAULT_ROOM_CLASS, NOISE_PRESETS, ROOM_CLASSES, TIERS } from './lib/constants'
import type { TierKey } from './lib/constants'
import { targetRtDin18041 } from './lib/scoring'
import type { Room } from './lib/types'
import { Card, CardTitle, Chip, Disclosure, Field, NumberInput, Select } from './ui'
import styles from './styles.module.css'

/**
 * The room is never a blocking question. It opens collapsed on a stated default and the summary line
 * always says what is being assumed.
 */
export function RoomPanel({ room, onChange }: { room: Room; onChange: (r: Room) => void }) {
  const set = <K extends keyof Room>(k: K, v: Room[K]) => onChange({ ...room, [k]: v })
  const cls = ROOM_CLASSES.find((c) => c.key === room.class_key)
  const volume = room.area_m2 * room.height_m
  const noiseLabel = NOISE_PRESETS.find((p) => p.db === room.noise_floor_db)?.label

  const pickClass = (key: string) => {
    const c = ROOM_CLASSES.find((x) => x.key === key)
    if (c) onChange({ ...room, class_key: c.key, area_m2: c.area_m2, height_m: c.height_m })
  }

  const std = ROOM_CLASSES.find((c) => c.key === DEFAULT_ROOM_CLASS)!
  const isStandard = room.class_key === std.key && room.area_m2 === std.area_m2 && room.height_m === std.height_m && room.noise_floor_db === DEFAULT_NOISE_FLOOR_DB

  return (
    <Card>
      <CardTitle
        title="Your room"
        sub={`Optional. If you leave it, the check uses a standard meeting room: ${std.area_m2} m², ${std.height_m} m ceiling, ${DEFAULT_NOISE_FLOOR_DB} dB(A) background.`}
      />
      <Disclosure
        summary={`${isStandard ? 'Standard meeting room' : cls ? cls.label : 'Custom room'}: ${room.area_m2} m² · ${room.noise_floor_db} dB(A) background`}
        detail={`${noiseLabel ?? 'Custom noise level'}. Change the size or the background noise here — the noise also changes the room sizes in the answer.`}
      >
        <Field label="Room size" hint="Pick the biggest room you would want to measure. The result also lists every size the speaker reaches.">
          <div className={styles.grid3}>
            {ROOM_CLASSES.map((c) => (
              <Chip key={c.key} active={c.key === room.class_key} onClick={() => pickClass(c.key)}>
                <span className={styles.chipTitle}>{c.label}</span>
                <span className={styles.chipSub}>
                  {c.people} · {c.area_m2} m²
                </span>
              </Chip>
            ))}
          </div>
        </Field>

        <div className={styles.grid2}>
          <Field label="Floor area" hint="Override if you know it.">
            <NumberInput value={room.area_m2} onChange={(v) => onChange({ ...room, area_m2: v ?? 40, class_key: 'custom' })} suffix="m²" />
          </Field>
          <Field label="Ceiling height">
            <NumberInput value={room.height_m} onChange={(v) => onChange({ ...room, height_m: v ?? 3.1, class_key: 'custom' })} step="0.1" suffix="m" />
          </Field>
        </div>

        <Field label="Background noise" hint="This sets the whole target: the sweep has to be this much above it. If you have measured it, type the value.">
          <Select
            value={String(room.noise_floor_db)}
            onChange={(v) => set('noise_floor_db', Number(v))}
            options={NOISE_PRESETS.map((p) => ({ value: String(p.db), label: `${p.db} dB(A) — ${p.label}` }))}
          />
        </Field>

        <Disclosure summary="Advanced" detail="Criterion, reverberation time">
          <Field label="What the measurement has to achieve">
            <div className={styles.stackSm}>
              {TIERS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set('tier', t.key as TierKey)}
                  className={`${styles.tierBtn} ${room.tier === t.key ? styles.tierBtnActive : ''}`}
                >
                  <span className={styles.tierHead}>
                    <span>{t.label}</span>
                    <span>SNR ≥ {t.snrDb} dB</span>
                  </span>
                  <span className={styles.tierMeans}>{t.means}</span>
                </button>
              ))}
            </div>
          </Field>

          <div className={styles.grid2}>
            <Field label="Room usage type (DIN 18041)" hint="Only used to estimate the reverberation time.">
              <Select
                value={room.usage}
                onChange={(v) => set('usage', v)}
                options={[
                  { value: 'A2', label: 'A2 — speech and presentation (Sprache/Vortrag)' },
                  { value: 'A3', label: 'A3 — teaching and conversation (Unterricht/Kommunikation)' },
                  { value: 'A4', label: 'A4 — inclusive communication, video conference (inklusiv)' },
                ]}
              />
            </Field>
            <Field
              label="Measured reverberation time"
              hint={`Leave empty for the DIN 18041 ${room.usage} target at ${volume.toFixed(0)} m³, which is ${targetRtDin18041(volume, room.usage).toFixed(2)} s.`}
            >
              <NumberInput value={room.rt_override_s} onChange={(v) => set('rt_override_s', v)} step="0.05" suffix="s" />
            </Field>
          </div>
        </Disclosure>
      </Disclosure>
    </Card>
  )
}
