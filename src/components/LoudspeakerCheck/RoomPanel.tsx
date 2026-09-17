import { DEFAULT_NOISE_FLOOR_DB, DEFAULT_ROOM_CLASS, NOISE_PRESETS, ROOM_CLASSES } from './lib/constants'
import { targetRtDin18041 } from './lib/scoring'
import type { Room } from './lib/types'
import { Card, CardTitle, Chip, Disclosure, Field, Info, NumberInput, Select } from './ui'
import styles from './styles.module.css'

/**
 * The room is never a blocking question. It opens collapsed on a stated default and the summary line
 * always says what is being assumed.
 */
export function RoomPanel({ room, onChange }: { room: Room; onChange: (r: Room) => void }) {
  const set = <K extends keyof Room>(k: K, v: Room[K]) => onChange({ ...room, [k]: v })
  const cls = ROOM_CLASSES.find((c) => c.key === room.class_key)
  const volume = room.area_m2 * room.height_m

  const pickClass = (key: string) => {
    const c = ROOM_CLASSES.find((x) => x.key === key)
    if (c) onChange({ ...room, class_key: c.key, area_m2: c.area_m2, height_m: c.height_m })
  }

  const std = ROOM_CLASSES.find((c) => c.key === DEFAULT_ROOM_CLASS)!
  const isStandard = room.class_key === std.key && room.area_m2 === std.area_m2 && room.height_m === std.height_m && room.noise_floor_db === DEFAULT_NOISE_FLOOR_DB

  return (
    <Card>
      <CardTitle
        title="Room"
        sub="Optional. Left alone, the check answers for a standard meeting room."
      />
      <Disclosure
        summary={`${isStandard ? 'Standard meeting room' : cls ? cls.label : 'Custom room'}: ${room.area_m2} m² · ${room.noise_floor_db} dB(A) background`}
        detail={`${room.height_m} m ceiling. The background noise moves the room sizes in the answer more than anything else here.`}
      >
        <Field label="Room size" hint="Pick the biggest room you would want to measure." info="The answer also lists every size the loudspeaker reaches, so a smaller room is covered by a bigger one.">
          <div className={styles.chipGrid}>
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
          <Field label="Ceiling height" hint="Floor to ceiling.">
            <NumberInput value={room.height_m} onChange={(v) => onChange({ ...room, height_m: v ?? 3.1, class_key: 'custom' })} step="0.1" suffix="m" />
          </Field>
        </div>

        <Field label="Background noise" hint="The sweep has to be this much above it." info="This sets the whole target, so it moves the answer more than anything else here. If you have measured the room, type the value instead of picking a preset.">
          <Select
            value={String(room.noise_floor_db)}
            onChange={(v) => set('noise_floor_db', Number(v))}
            options={NOISE_PRESETS.map((p) => ({ value: String(p.db), label: `${p.db} dB(A) — ${p.label}` }))}
          />
        </Field>

        {/* The criterion ladder used to be selectable here. It only ever moved the secondary room line — the
            headline is the full result and does not read it — and the answer already shows the whole ladder under
            "How close it is". What is left are the two inputs that genuinely change the prediction. */}
        <Disclosure summary="Advanced" detail="Room usage type, and a reverberation time you have measured yourself.">
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
